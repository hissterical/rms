"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Bot, 
  Upload, 
  FileText, 
  Save, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Mic,
  ArrowLeft
} from "lucide-react"

interface BotConfig {
  hotelInfo: string
  lastUpdated: string | null
  documentName: string | null
}

export default function BotConfigPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState<BotConfig>({
    hotelInfo: '',
    lastUpdated: null,
    documentName: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem('botConfig')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextChange = (value: string) => {
    setConfig(prev => ({ ...prev, hotelInfo: value }))
    setIsDirty(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Only accept TXT files for now (PDFs need special parsing libraries)
    if (file.type !== 'text/plain') {
      toast({
        title: "Only TXT files supported",
        description: "Please upload a .txt file, or copy-paste your content into the text area below. PDF parsing requires additional setup.",
        variant: "destructive"
      })
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      })
      e.target.value = ''
      return
    }

    try {
      const text = await extractTextFromFile(file)
      
      if (!text || text.trim().length === 0) {
        toast({
          title: "Empty file",
          description: "The file appears to be empty. Please check the file and try again.",
          variant: "destructive"
        })
        e.target.value = ''
        return
      }
      
      const updatedConfig = {
        hotelInfo: text,
        documentName: file.name,
        lastUpdated: new Date().toISOString()
      }
      
      // Save immediately
      localStorage.setItem('botConfig', JSON.stringify(updatedConfig))
      setConfig(updatedConfig)
      setIsDirty(false)
      
      toast({
        title: "File uploaded and saved",
        description: `${file.name} has been processed and saved successfully (${text.length} characters)`
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not process the file. Please try again.",
        variant: "destructive"
      })
    }
    
    // Reset file input
    e.target.value = ''
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const text = e.target?.result as string
        resolve(text)
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      
      if (file.type === 'text/plain') {
        reader.readAsText(file)
      } else {
        // For PDF/DOC, just read as text for now (basic extraction)
        reader.readAsText(file)
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedConfig = {
        ...config,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem('botConfig', JSON.stringify(updatedConfig))
      setConfig(updatedConfig)
      setIsDirty(false)
      
      toast({
        title: "Configuration saved",
        description: "Bot knowledge base has been updated successfully"
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save configuration. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveFile = () => {
    const updatedConfig = {
      ...config,
      documentName: null
    }
    
    localStorage.setItem('botConfig', JSON.stringify(updatedConfig))
    setConfig(updatedConfig)
    setIsDirty(false)
    
    toast({
      title: "File removed",
      description: "The uploaded document reference has been removed and changes saved."
    })
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the bot knowledge base? This cannot be undone.')) {
      const clearedConfig = {
        hotelInfo: '',
        lastUpdated: null,
        documentName: null
      }
      
      localStorage.setItem('botConfig', JSON.stringify(clearedConfig))
      setConfig(clearedConfig)
      setIsDirty(false)
      
      toast({
        title: "Knowledge base cleared",
        description: "All bot configuration data has been removed."
      })
    }
  }

  const wordCount = config.hotelInfo.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bot Configuration</h1>
            <p className="text-slate-600 mt-1">
              Configure the knowledge base for AI Chatbot and Voice Assistant
            </p>
          </div>
          <Bot className="h-12 w-12 text-teal-600" />
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg">Text Chatbot</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Appears on room services and food menu pages. Answers guest questions via text.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg">Voice Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Available on room services page. Listens to guest requests and responds with voice.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <CardTitle className="text-amber-900">Important: Accuracy & Reliability</CardTitle>
                <CardDescription className="text-amber-700 mt-1">
                  The bots will ONLY answer questions based on the information you provide below. 
                  They will NOT make up information or use external data. If they don't have the answer, 
                  they will say so explicitly.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Hotel Knowledge Base</span>
              {config.lastUpdated && (
                <Badge variant="outline" className="font-normal">
                  Last updated: {new Date(config.lastUpdated).toLocaleDateString()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Add all information about your hotel, services, policies, amenities, etc. 
              The more detailed you are, the better the bots can assist your guests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload" className="text-base font-semibold mb-2 block">
                Upload Document (Optional)
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {config.documentName && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span className="flex-1">{config.documentName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Currently supports: TXT files only (Max 5MB). For PDF/DOC files, please copy-paste the content into the text area below.
              </p>
            </div>

            {/* Text Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="hotel-info" className="text-base font-semibold">
                  Hotel Information
                </Label>
                <span className="text-sm text-slate-500">{wordCount} words</span>
              </div>
              <Textarea
                id="hotel-info"
                value={config.hotelInfo}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter detailed information about your hotel...&#10;&#10;Example:&#10;- Hotel name and location&#10;- Check-in/check-out times&#10;- Room types and amenities&#10;- Restaurant hours and menu details&#10;- Spa, gym, pool facilities&#10;- WiFi password and instructions&#10;- Local attractions and recommendations&#10;- Hotel policies and rules&#10;- Emergency contacts&#10;- Parking information&#10;- Pet policies&#10;- etc."
                className="min-h-[400px] max-h-[400px] font-mono text-sm overflow-y-auto resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                Be as detailed as possible. Include FAQs, policies, timings, contact numbers, etc.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!config.hotelInfo}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>

              {!isDirty && config.lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-green-600 ml-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>All changes saved</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>Include specific details like room numbers, phone extensions, and exact timings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>Add frequently asked questions and their answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>List all available services and how to request them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>Update this information whenever hotel policies or services change</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>The bots will refuse to answer questions outside this knowledge base</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
