import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

function LogoMark({ size = 22 }: { size?: number }) {
  const h = Math.round((size * 56) / 96)
  return (
    <svg
      viewBox="0 0 96 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={h}
      aria-hidden="true"
    >
      <path d="M 0 31.25 C 10 32.19 12 31.17 18 26.63 C 24 20.16 28 17.39 30 17.42 C 33 17.42 39 21.29 45 42.73 C 48 46.71 51 47.59 54 45.16 C 60 39.99 66 19.09 72 16.87 C 78 19.34 84 27.06 96 31.48" stroke="#4CAF50" strokeWidth="1.79" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-tq-bg">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-tq-bg-soft border-b border-tq-divider flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-md text-tq-fg-2 hover:bg-tq-bg-muted hover:text-tq-fg-1 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <LogoMark size={22} />
          <span className="font-bold text-[15px] tracking-tight text-tq-fg-1">TermIQ</span>
        </div>
      </header>

      {/* Drawer overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0 md:pl-60">
        <Outlet />
      </main>
    </div>
  )
}
