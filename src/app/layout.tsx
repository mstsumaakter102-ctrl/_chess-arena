import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chess Arena',
  description: 'Real-time multiplayer chess',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-[#0a0a0f] text-white font-sans">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1b26',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
              },
              classNames: {
                success: 'border-emerald-500/30',
                error: 'border-red-500/30',
              },
            }}
            richColors
          />
        </AuthProvider>
      </body>
    </html>
  )
}
