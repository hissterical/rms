"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Groq from 'groq-sdk'
import { getBotKnowledgeBase, hasBotKnowledge } from '@/lib/bot-config'

interface VoiceAssistantProps {
  isOpen: boolean
  onClose: () => void
  context?: {
    roomNumber?: string
    hotelName?: string
  }
}

export default function VoiceAssistant({ isOpen, onClose, context }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Load API key
    const key = process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (key) {
      setApiKey(key)
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const buildContext = () => {
    const knowledgeBase = getBotKnowledgeBase()
    
    let contextStr = `You are a hotel voice assistant. Follow these rules STRICTLY:

CRITICAL RULES:
1. ONLY answer using information from the HOTEL KNOWLEDGE BASE below
2. Keep responses VERY brief (1-2 sentences maximum for voice)
3. If the answer is NOT in the knowledge base, say: "I don't have that information. Please contact the front desk."
4. DO NOT make up or assume any information
5. DO NOT use general knowledge - ONLY the knowledge base

`
    
    if (knowledgeBase && knowledgeBase.trim().length > 0) {
      contextStr += `HOTEL KNOWLEDGE BASE:
${knowledgeBase}

---END OF KNOWLEDGE BASE---

`
    } else {
      contextStr += `⚠️ WARNING: No knowledge base configured. Direct all questions to the front desk.

`
    }
    
    if (context?.roomNumber) {
      contextStr += `Guest Room: ${context.roomNumber}\n`
    }
    
    if (context?.hotelName) {
      contextStr += `Hotel: ${context.hotelName}\n`
    }
    
    contextStr += "\nSpeak naturally and briefly. If you don't know, say so immediately."
    
    return contextStr
  }

  const getAIResponse = async (userMessage: string): Promise<string> => {
    const currentApiKey = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY
    
    if (!currentApiKey || currentApiKey === 'your_groq_api_key_here') {
      return "I'm not fully configured yet. Please contact the front desk for assistance."
    }

    try {
      const contextStr = buildContext()
      
      const groq = new Groq({
        apiKey: currentApiKey,
        dangerouslyAllowBrowser: true
      })

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: contextStr
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 150, // Shorter for voice
        top_p: 1,
      })

      const aiResponse = completion.choices[0]?.message?.content
      
      if (aiResponse) {
        return aiResponse
      } else {
        throw new Error('No response from API')
      }
    } catch (error) {
      console.error('AI response error:', error)
      return "I'm having trouble processing that. Please try again or contact the front desk."
    }
  }

  const speak = (text: string) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setResponse('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started')
      setIsListening(true)
      setTranscript('')
      setResponse('')
    }

    recognitionRef.current.onresult = async (event: any) => {
      console.log('Speech recognition result:', event)
      const lastResult = event.results[event.results.length - 1]
      const spokenText = lastResult[0].transcript
      
      if (lastResult.isFinal) {
        console.log('Final transcript:', spokenText)
        setTranscript(spokenText)
        setIsListening(false)

        // Get AI response
        const aiResponse = await getAIResponse(spokenText)
        setResponse(aiResponse)
        
        // Speak the response
        speak(aiResponse)
      } else {
        // Show interim results
        setTranscript(spokenText + '...')
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      if (event.error === 'no-speech') {
        setResponse("I didn't hear anything. Please try speaking again.")
      } else if (event.error === 'not-allowed') {
        setResponse("Microphone access was denied. Please allow microphone permissions.")
      } else if (event.error === 'network') {
        setResponse("Network error. Please check your connection.")
      } else {
        setResponse(`Error: ${event.error}. Please try again.`)
      }
    }

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended')
      setIsListening(false)
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('Failed to start recognition:', error)
      setIsListening(false)
      setResponse('Failed to start microphone. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsSpeaking(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Voice Assistant</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Microphone Animation */}
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
                  className={`w-32 h-32 rounded-full flex items-center justify-center ${
                    isListening 
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600' 
                      : isSpeaking
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800'
                  }`}
                >
                  {isSpeaking ? (
                    <Volume2 className="h-16 w-16 text-white" />
                  ) : (
                    <Mic className="h-16 w-16 text-white" />
                  )}
                </motion.div>

                <p className="mt-4 text-lg font-semibold text-slate-900">
                  {isListening 
                    ? 'Listening...' 
                    : isSpeaking 
                    ? 'Speaking...' 
                    : 'Ready to listen'}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {isListening 
                    ? 'Speak now, I\'m listening...' 
                    : isSpeaking
                    ? 'Playing response'
                    : 'Click "Start Speaking" button below'}
                </p>
              </div>

              {/* Transcript and Response */}
              {(transcript || response) && (
                <div className="space-y-3 mb-4">
                  {transcript && (
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">You said:</p>
                      <p className="text-sm text-slate-900">{transcript}</p>
                    </div>
                  )}
                  {response && (
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <p className="text-xs text-teal-600 mb-1">Assistant:</p>
                      <p className="text-sm text-slate-900">{response}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                {!isListening && !isSpeaking && (
                  <Button
                    onClick={startListening}
                    className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                    size="lg"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Speaking
                  </Button>
                )}
                
                {isListening && (
                  <Button
                    onClick={stopListening}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Listening
                  </Button>
                )}

                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Stop Speaking
                  </Button>
                )}
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                Works best in Chrome or Edge browser
              </p>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
