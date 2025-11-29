"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Groq from 'groq-sdk'
import { getBotKnowledgeBase, hasBotKnowledge } from '@/lib/bot-config'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotProps {
  context?: {
    roomNumber?: string
    hotelName?: string
    services?: string[]
  }
}

export default function Chatbot({ context }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load API key
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // Try to fetch from environment or config
        const key = process.env.NEXT_PUBLIC_GROQ_API_KEY
        if (key) {
          setApiKey(key)
        }
      } catch (error) {
        console.error('Failed to load API key:', error)
      }
    }
    loadApiKey()
  }, [])

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const hasKnowledge = hasBotKnowledge()
      const welcomeMessage = hasKnowledge
        ? `👋 Hi! I'm your hotel assistant${context?.roomNumber ? ` for Room ${context.roomNumber}` : ''}. I can answer questions about:\n\n• Hotel facilities and services\n• Room amenities\n• Restaurant and dining\n• Check-in/check-out procedures\n• Hotel policies\n• And more!\n\nI only provide information based on our hotel's official data. What would you like to know?`
        : `👋 Hi! I'm your hotel assistant${context?.roomNumber ? ` for Room ${context.roomNumber}` : ''}.\n\n⚠️ Note: My knowledge base hasn't been configured yet. For any specific information, please contact the front desk.\n\nHow can I direct your inquiry?`
      
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage
        }
      ])
    }
  }, [isOpen, messages.length, context?.roomNumber])

  const buildContext = () => {
    const knowledgeBase = getBotKnowledgeBase()
    
    let contextStr = `You are a hotel assistant chatbot. Follow these rules STRICTLY:

CRITICAL RULES:
1. ONLY answer questions using the information provided in the HOTEL KNOWLEDGE BASE below
2. If the answer is NOT in the knowledge base, you MUST respond: "I don't have that information. Please contact the front desk at [contact number if available] or ask hotel staff."
3. DO NOT make up, assume, or infer information that is not explicitly stated
4. DO NOT use your general knowledge about hotels or anything else
5. Be helpful and friendly, but NEVER fabricate information

`
    
    if (knowledgeBase && knowledgeBase.trim().length > 0) {
      contextStr += `HOTEL KNOWLEDGE BASE:
${knowledgeBase}

---END OF KNOWLEDGE BASE---

`
    } else {
      contextStr += `⚠️ WARNING: No hotel knowledge base configured. You can only provide very basic assistance and must direct all specific questions to the front desk.

`
    }
    
    if (context?.roomNumber) {
      contextStr += `Guest Room: ${context.roomNumber}\n`
    }
    
    if (context?.hotelName) {
      contextStr += `Hotel Name: ${context.hotelName}\n`
    }
    
    contextStr += "\nRemember: ONLY use information from the knowledge base above. If you don't know, say so clearly."
    
    return contextStr
  }

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // First check if API key exists
    const currentApiKey = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY
    
    console.log('Chatbot Debug - API Key available:', !!currentApiKey)
    console.log('Chatbot Debug - API Key starts with:', currentApiKey?.substring(0, 10))
    
    if (!currentApiKey || currentApiKey === 'your_groq_api_key_here') {
      console.warn('No valid Groq API key found. Using fallback responses.')
      console.warn('To enable AI responses, add NEXT_PUBLIC_GROQ_API_KEY to .env.local')
      return getFallbackResponse(userMessage)
    }

    try {
      const contextStr = buildContext()
      console.log('Chatbot Debug - Calling Groq API...')
      
      const groq = new Groq({
        apiKey: currentApiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
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
        temperature: 0.9,
        max_tokens: 400,
        top_p: 1,
      })

      const aiResponse = completion.choices[0]?.message?.content
      
      if (aiResponse) {
        console.log('Chatbot Debug - AI response generated successfully')
        return aiResponse
      } else {
        console.error('No response from Groq API')
        throw new Error('No response from API')
      }
    } catch (error) {
      console.error('AI response error:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      return getFallbackResponse(userMessage)
    }
  }

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    // Try to understand the intent and provide relevant responses
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('help')) {
      return "For emergencies, please call our 24/7 emergency line at +1 (555) 123-4567 immediately or press the emergency button in your room."
    }
    
    if (lowerMessage.includes('food') || lowerMessage.includes('menu') || lowerMessage.includes('restaurant') || lowerMessage.includes('order') || lowerMessage.includes('eat') || lowerMessage.includes('hungry') || lowerMessage.includes('breakfast') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) {
      return "I can help you with food! Our restaurant menu is available through the 'Restaurant Menu' service. You can browse dishes in multiple languages, use voice search, and order directly to your room. Would you like me to guide you there?"
    }
    
    if (lowerMessage.includes('housekeeping') || lowerMessage.includes('cleaning') || lowerMessage.includes('towel') || lowerMessage.includes('clean') || lowerMessage.includes('maid')) {
      return "I'll help you with housekeeping! You can request room cleaning, fresh towels, bed linen changes, or any other housekeeping services through our 'Housekeeping' section. What specific service do you need?"
    }
    
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair') || lowerMessage.includes('broken') || lowerMessage.includes('fix') || lowerMessage.includes('ac') || lowerMessage.includes('tv') || lowerMessage.includes('light')) {
      return "I can help with maintenance issues! Please use the 'Maintenance' service to submit a request. Our team will respond promptly to fix any issues in your room. What needs to be repaired?"
    }
    
    if (lowerMessage.includes('wifi') || lowerMessage.includes('internet') || lowerMessage.includes('password')) {
      return "For WiFi access, the network name and password should be available in your room. If you're having connectivity issues, I can arrange for technical support. Would you like me to send someone to assist?"
    }
    
    if (lowerMessage.includes('checkout') || lowerMessage.includes('check out') || lowerMessage.includes('leaving')) {
      return "Checkout time is typically 11:00 AM. If you need a late checkout, I can help arrange that for you. Would you like to request an extension?"
    }
    
    if (lowerMessage.includes('pool') || lowerMessage.includes('gym') || lowerMessage.includes('spa') || lowerMessage.includes('facilities') || lowerMessage.includes('amenities')) {
      return "Our hotel offers various amenities including swimming pool, fitness center, and spa services. Most facilities are open from 6:00 AM to 10:00 PM. Would you like specific information about any particular facility?"
    }
    
    // General fallback - try to be helpful even without understanding
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('charge')) {
      return "For pricing information, please contact our front desk at the reception. They'll provide you with detailed pricing for all our services and amenities."
    }
    
    if (lowerMessage.includes('available') || lowerMessage.includes('open')) {
      return "Most hotel facilities are available from 6:00 AM to 10:00 PM. The restaurant operates from 7:00 AM to 11:00 PM. For specific availability, please contact the front desk."
    }
    
    // Smart general response
    return `I'm here to help with your request. I can assist you with:\n\n✓ Food ordering - Browse menu and order to your room\n✓ Housekeeping - Request cleaning or fresh supplies\n✓ Maintenance - Report any room issues\n✓ Hotel information - Facilities, timings, services\n✓ Emergency help - 24/7 assistance\n\nFor more specific requests, please contact the front desk who can provide personalized assistance. How else can I help you today?`
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue('')
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      const response = await getAIResponse(userMessage)
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      setIsTyping(false)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, I'm having trouble responding right now. Please contact the front desk for assistance." 
      }])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { label: '🍽️ Order Food', message: 'How can I order food?' },
    { label: '🧹 Housekeeping', message: 'I need housekeeping service' },
    { label: '🔧 Maintenance', message: 'I have a maintenance issue' },
    { label: 'ℹ️ Hotel Info', message: 'Tell me about hotel amenities' },
  ]

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-14 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageSquare className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ?
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 top-4 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[calc(100vh-8rem)] md:h-auto md:top-auto md:bottom-24"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-500/30 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-teal-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Hotel Assistant</h3>
                      <p className="text-xs text-slate-200">Here to help you!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[400px] p-4 bg-slate-50">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-teal-500 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-teal-500 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-teal-500 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="px-4 py-3 border-t bg-white">
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-colors"
                        onClick={() => {
                          setInputValue(action.message)
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 border-slate-300 focus-visible:ring-teal-500"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
