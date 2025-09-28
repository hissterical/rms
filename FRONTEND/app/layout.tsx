import type { Metadata } from 'next'
import { Fredoka } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const fredoka = Fredoka({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka'
})

export const metadata: Metadata = {
  title: 'Sohraa',
  description: 'Complete hotel management solution for reservations, housekeeping, and analytics',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.className} ${fredoka.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
