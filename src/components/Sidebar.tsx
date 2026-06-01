import { NavLink, useLocation } from 'react-router-dom'
import { Cpu, RefreshCw, LineChart, FileText, Settings, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/devices', icon: Cpu, label: 'Devices' },
  { path: '/cycles', icon: RefreshCw, label: 'Cycles' },
  { path: '/analysis', icon: LineChart, label: 'Analysis' },
  { path: '/report', icon: FileText, label: 'Report' },
]

function LogoMark({ size = 26 }: { size?: number }) {
  const h = Math.round((size * 56) / 96)
  return (
    <svg
      viewBox="0 0 96 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={h}
      aria-label="TermIQ"
    >
      <path d="M 0 28.52 C 16 31.93 22 31.93 30 29.30 C 38 26.62 42 19.50 45 19.50 C 48 19.50 54 25.12 60 30.64 C 66 36.37 67 32.85 72 31.23 C 78 29.74 82 26.72 96 27.87" stroke="#CFEAD2" strokeWidth="0.90" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"/>
      <path d="M 0 28.76 C 16 32.75 21 32.62 27 29.56 C 33 26.32 39 17.84 42 17.19 C 45 17.19 51 22.32 57 33.27 C 63 36.37 66 35.51 72 30.94 C 78 26.62 82 25.35 96 28.13" stroke="#A7D9AC" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.68"/>
      <path d="M 0 29.26 C 15 33.07 18 32.92 24 29.58 C 30 26.32 36 16.40 39 15.71 C 42 15.71 48 20.86 54 36.16 C 60 40.06 64 37.43 69 32.07 C 75 25.61 82 23.56 96 28.79" stroke="#A7D9AC" strokeWidth="1.39" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.79"/>
      <path d="M 0 29.96 C 13 32.98 15 32.83 21 29.49 C 27 26.18 33 15.94 36 15.27 C 39 15.27 45 21.17 51 38.95 C 57 43.46 63 37.84 69 28.09 C 75 22.01 82 21.42 96 29.74" stroke="#7BC684" strokeWidth="1.58" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.89"/>
      <path d="M 0 30.69 C 12 32.64 15 31.47 21 26.28 C 27 19.01 31 15.90 33 15.89 C 36 15.89 42 21.17 48 41.25 C 54 46.10 60 36.42 66 24.85 C 72 19.84 78 19.42 96 30.74" stroke="#5EC062" strokeWidth="1.72" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.96"/>
      <path d="M 0 31.25 C 10 32.19 12 31.17 18 26.63 C 24 20.16 28 17.39 30 17.42 C 33 17.42 39 21.29 45 42.73 C 48 46.71 51 47.59 54 45.16 C 60 39.99 66 19.09 72 16.87 C 78 19.34 84 27.06 96 31.48" stroke="#5EC062" strokeWidth="1.79" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="1.00"/>
      <path d="M 0 31.50 C 9 31.75 12 29.42 18 24.49 C 24 19.93 28 19.57 30 21.31 C 33 21.31 39 27.94 45 46.97 C 48 47.77 51 45.18 57 39.99 C 63 26.53 66 16.02 69 15.09 C 75 17.00 82 23.42 96 31.75" stroke="#4CAF50" strokeWidth="1.79" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="1.00"/>
      <path d="M 0 31.40 C 9 30.72 13 26.89 18 23.73 C 24 19.93 27 19.57 30 23.52 C 33 24.99 39 34.65 45 46.56 C 51 41.71 57 24.69 63 15.05 C 66 14.23 72 19.04 81 30.32 C 87 33.07 90 32.96 96 31.52" stroke="#4CAF50" strokeWidth="1.72" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.96"/>
      <path d="M 0 31.08 C 9 29.61 15 25.65 19 24.36 C 24 24.44 27 26.91 33 36.93 C 36 41.14 39 43.90 43 44.32 C 48 42.01 54 24.20 60 15.08 C 63 14.30 69 19.17 75 23.19 C 81 30.83 84 33.70 96 30.96" stroke="#3E9243" strokeWidth="1.58" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.89"/>
      <path d="M 0 30.73 C 10 28.40 16 26.66 22 27.50 C 27 29.50 33 39.09 36 41.16 C 39 41.55 42 39.42 45 35.38 C 51 27.48 57 16.23 60 15.44 C 66 20.08 72 28.06 81 34.03 C 84 33.83 90 31.98 96 30.35" stroke="#2E8B57" strokeWidth="1.39" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.79"/>
      <path d="M 0 30.53 C 10 28.57 16 28.36 22 29.54 C 27 31.22 33 38.20 36 38.28 C 39 37.71 42 35.33 48 26.02 C 54 18.43 57 17.78 63 19.63 C 67 23.37 72 29.67 81 33.69 C 84 32.91 90 30.99 96 29.98" stroke="#2E8B57" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.68"/>
      <path d="M 0 30.59 C 9 30.37 15 30.03 22 31.97 C 27 33.35 30 35.43 33 35.39 C 36 34.28 42 30.72 48 23.24 C 54 20.93 57 21.81 63 26.40 C 69 32.66 75 33.23 81 29.82 C 87 31.55 90 32.28 96 29.97" stroke="#1F5E33" strokeWidth="0.90" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"/>
    </svg>
  )
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'w-60 bg-tq-bg-soft border-r border-tq-divider flex flex-col py-4 px-3 shrink-0',
        // Mobile: fixed drawer, slides in from left
        'fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-tq-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: fixed to viewport, always visible
        '2xl:fixed 2xl:top-0 2xl:h-screen 2xl:translate-x-0',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-2 mb-5">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-bold text-[15px] tracking-tight text-tq-fg-1">TermIQ</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="2xl:hidden flex items-center justify-center w-7 h-7 rounded-md text-tq-fg-3 hover:bg-tq-bg-muted hover:text-tq-fg-1 transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto min-h-0">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path || (path === '/machine' && location.pathname === '/')
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] font-medium text-tq-fg-2',
                'transition-colors duration-[140ms] ease-tq-out',
                'hover:bg-tq-bg-muted hover:text-tq-fg-1',
                isActive && 'bg-white text-tq-fg-1 font-semibold shadow-sm',
              )}
            >
              <span
                className={cn(
                  'flex items-center transition-colors duration-[140ms]',
                  isActive ? 'text-tq-green-600' : 'text-tq-fg-3',
                )}
              >
                <Icon size={18} />
              </span>
              <span className="flex-1">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer: Settings + user avatar */}
      <div className="flex flex-col gap-1 mt-3 pt-3">
        <Separator className="mb-2" />
        <button
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] font-medium text-tq-fg-2 w-full text-left',
            'transition-colors duration-[140ms] ease-tq-out',
            'hover:bg-tq-bg-muted hover:text-tq-fg-1',
          )}
        >
          <span className="flex items-center text-tq-fg-3">
            <Settings size={18} />
          </span>
          <span>Settings</span>
        </button>

        <div className="flex items-center gap-2.5 px-2 py-1.5 mt-1">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="text-[11px]">BK</AvatarFallback>
          </Avatar>
          <div className="leading-tight min-w-0">
            <div className="text-[12px] font-semibold text-tq-fg-1 truncate">R. Fernandes</div>
            <div className="text-[11px] text-tq-fg-3">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
