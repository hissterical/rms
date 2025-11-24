"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { QRScanner } from "@/components/qr-scanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"

export default function ScannerPage() {
  const [showScanner, setShowScanner] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const router = useRouter()

  const handleScan = (data: string) => {
    setScanResult(data)
    setShowScanner(false)
    
    // Validate QR code format (example: BOOKING-12345 or ROOM-301)
    if (data.startsWith('BOOKING-') || data.startsWith('ROOM-')) {
      setScanStatus('success')
      
      // Redirect based on QR code type
      setTimeout(() => {
        if (data.startsWith('BOOKING-')) {
          router.push(`/document-upload?booking=${data}`)
        } else if (data.startsWith('ROOM-')) {
          router.push(`/room-services?room=${data}`)
        }
      }, 1500)
    } else {
      setScanStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                QR Code Scanner
              </h1>
              <p className="text-sm text-gray-600">Scan for check-in or room access</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4"
              >
                <QrCode className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold">
                Scan QR Code
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Scan your booking confirmation or room QR code
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Scan Result */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border-2 ${
                    scanStatus === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scanStatus === 'success' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className={`font-semibold ${
                        scanStatus === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {scanStatus === 'success' ? 'QR Code Verified!' : 'Invalid QR Code'}
                      </p>
                      <p className={`text-sm ${
                        scanStatus === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {scanStatus === 'success' 
                          ? `Scanned: ${scanResult}` 
                          : 'Please scan a valid booking or room QR code'
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scan Button */}
              <Button
                onClick={() => setShowScanner(true)}
                size="lg"
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg h-14"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Start Scanning
              </Button>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">How to use:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">1.</span>
                    <span>Click "Start Scanning" to open camera</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">2.</span>
                    <span>Position the QR code within the frame</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">3.</span>
                    <span>Wait for automatic detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">4.</span>
                    <span>Follow the redirected flow for check-in or room access</span>
                  </li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/document-upload">
                  <Button variant="outline" className="w-full">
                    Skip to Upload
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}