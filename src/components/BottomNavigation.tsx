'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BarChart3, Award, Settings, Plus } from 'lucide-react'

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/artists', label: 'Artis', icon: Users },
    { href: '/rank-videos', label: 'Rank Video', icon: BarChart3 },
    { href: '/rank-artists', label: 'Rank Artis', icon: Award },
    { href: '/settings', label: 'Pengaturan', icon: Settings },
  ]

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 max-w-[480px] w-full pointer-events-none flex justify-end pr-4">
        <Link
          href="/videos/new"
          className="pointer-events-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white p-3.5 rounded-full shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1 font-semibold text-sm"
          aria-label="Tambah Video"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
        <div className="w-full max-w-[480px] h-[64px] flex items-center justify-around px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full min-h-[60px] py-1 transition-colors ${
                  isActive
                    ? 'text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
