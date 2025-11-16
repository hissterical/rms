"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, Check, RotateCw, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PhotoCaptureProps {
  onCapture: (photoDataUrl: string) => void
  onClose?: () => void
  title?: string
  instructions?: string
}

export function PhotoCapture({ onCapture, onClose, title, instructions }: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError("Unable to access camera. Please grant camera permissions.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedPhoto(photoDataUrl)
      }
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
      stopCamera()
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user")
    setCapturedPhoto(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <Card className="w-full max-w-2xl relative overflow-hidden">
        {onClose && (
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {title || "Capture Photo"}
            </h2>
            {instructions && (
              <p className="text-gray-600 mt-2 text-sm">
                {instructions}
              </p>
            )}
          </div>

          {/* Camera View */}
          <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              {!capturedPhoto ? (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-80">
                      {/* Oval face guide */}
                      <div className="absolute inset-0 border-4 border-white/50 rounded-full"></div>
                      
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-8 w-12 h-12 border-l-4 border-t-4 border-white"></div>
                      <div className="absolute top-0 right-8 w-12 h-12 border-r-4 border-t-4 border-white"></div>
                      <div className="absolute bottom-0 left-8 w-12 h-12 border-l-4 border-b-4 border-white"></div>
                      <div className="absolute bottom-0 right-8 w-12 h-12 border-r-4 border-b-4 border-white"></div>
                    </div>
                  </div>

                  {/* Instructions overlay */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                    Position your face in the oval
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full h-full"
                >
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Check mark overlay */}
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {!capturedPhoto ? (
              <>
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg"
                  disabled={!stream}
                >
                  <Camera className="h-8 w-8" />
                </Button>

                <div className="w-14"></div>
              </>
            ) : (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="lg"
                >
                  <RotateCw className="mr-2 h-5 w-5" />
                  Retake
                </Button>
                
                <Button
                  onClick={confirmPhoto}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Confirm
                </Button>
              </>
            )}
          </div>

          {/* File Upload Alternative */}
          {!capturedPhoto && (
            <div className="mt-4 text-center">
              <label className="cursor-pointer text-sm text-slate-600 hover:text-slate-700 underline">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        const result = reader.result as string
                        setCapturedPhoto(result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                Or upload from gallery
              </label>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}