import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNavigation from '@/components/BottomNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Database Manajemen Video & Artis',
  description: 'PWA Manajemen Video & Artis dengan Sistem Rating Kustom',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="dark h-full bg-slate-950 text-slate-100">
      <body className={`${inter.className} h-full antialiased flex flex-col items-center min-h-screen bg-slate-950`}>
        <div className="w-full max-w-[480px] min-h-screen bg-slate-900 border-x border-slate-800/60 shadow-2xl flex flex-col pb-[72px] relative">
          <main className="flex-1 w-full p-4 overflow-y-auto">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </body>
    </html>
  )
}
