/**
 * QR Code Generation Utilities
 * 
 * Provides functions to generate QR codes as:
 * - Data URLs (for inline display)
 * - Downloadable PNG files
 * - Canvas elements
 */

import QRCode from 'qrcode'

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * Generate a QR code as a data URL (base64 encoded image)
 * Perfect for displaying inline in <img> tags
 * 
 * @param data - The data to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise<string> - Data URL of the generated QR code
 */
export async function generateQRCodeDataURL(
  data: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const qrOptions = {
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      type: 'image/png' as const,
      quality: 1,
      margin: options?.margin || 2,
      width: options?.width || 256,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
    }

    const dataURL = await QRCode.toDataURL(data, qrOptions)
    return dataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate and download a QR code as a PNG file
 * 
 * @param data - The data to encode in the QR code
 * @param filename - The filename for the downloaded file (without extension)
 * @param options - QR code generation options
 */
export async function downloadQRCode(
  data: string,
  filename: string,
  options?: QRCodeOptions
): Promise<void> {
  try {
    const dataURL = await generateQRCodeDataURL(data, options)
    
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `${filename}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw new Error('Failed to download QR code')
  }
}

/**
 * Generate a QR code on a canvas element
 * Useful for more advanced manipulation or custom styling
 * 
 * @param canvasElement - The canvas element to render the QR code on
 * @param data - The data to encode in the QR code
 * @param options - QR code generation options
 */
export async function generateQRCodeOnCanvas(
  canvasElement: HTMLCanvasElement,
  data: string,
  options?: QRCodeOptions
): Promise<void> {
  try {
    const qrOptions = {
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      margin: options?.margin || 2,
      width: options?.width || 256,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
    }

    await QRCode.toCanvas(canvasElement, data, qrOptions)
  } catch (error) {
    console.error('Error generating QR code on canvas:', error)
    throw new Error('Failed to generate QR code on canvas')
  }
}

/**
 * Generate a QR code for a room access URL
 * Encodes hotel booking and room information
 * 
 * @param hotelId - The hotel/property ID
 * @param roomNumber - The room number
 * @param bookingId - The booking ID
 * @param baseURL - The base URL for the room services (defaults to current origin)
 * @returns Promise<string> - Data URL of the generated QR code
 */
export async function generateRoomQRCode(
  hotelId: string,
  roomNumber: string,
  bookingId: string,
  baseURL?: string
): Promise<string> {
  const origin = baseURL || (typeof window !== 'undefined' ? window.location.origin : '')
  const roomServiceURL = `${origin}/room-services?hotel=${hotelId}&room=${roomNumber}&booking=${bookingId}`
  
  return generateQRCodeDataURL(roomServiceURL, {
    errorCorrectionLevel: 'H', // High error correction for important access codes
    width: 300,
    margin: 3,
  })
}

/**
 * Generate a QR code for restaurant menu access
 * 
 * @param restaurantId - The restaurant ID
 * @param tableNumber - The table number
 * @param baseURL - The base URL for the menu (defaults to current origin)
 * @returns Promise<string> - Data URL of the generated QR code
 */
export async function generateMenuQRCode(
  restaurantId: string,
  tableNumber: number,
  baseURL?: string
): Promise<string> {
  const origin = baseURL || (typeof window !== 'undefined' ? window.location.origin : '')
  const menuURL = `${origin}/food?restaurant=${restaurantId}&table=${tableNumber}`
  
  return generateQRCodeDataURL(menuURL, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
  })
}

/**
 * Generate a QR code for booking check-in
 * 
 * @param bookingId - The booking ID
 * @param baseURL - The base URL for check-in (defaults to current origin)
 * @returns Promise<string> - Data URL of the generated QR code
 */
export async function generateBookingQRCode(
  bookingId: string,
  baseURL?: string
): Promise<string> {
  const origin = baseURL || (typeof window !== 'undefined' ? window.location.origin : '')
  const checkInURL = `${origin}/scanner?booking=${bookingId}`
  
  return generateQRCodeDataURL(checkInURL, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 3,
  })
}

/**
 * Copy QR code data to clipboard
 * 
 * @param data - The data encoded in the QR code
 */
export async function copyQRDataToClipboard(data: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(data)
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    throw new Error('Failed to copy QR code data to clipboard')
  }
}
