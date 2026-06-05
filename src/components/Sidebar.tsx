import { NavLink, useLocation } from 'react-router-dom'
import { Cpu, RefreshCw, LineChart, FileText, Settings, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import LogoMark from '@/components/LogoMark'

const navItems = [
  { path: '/devices', icon: Cpu, label: 'Devices' },
  { path: '/cycles', icon: RefreshCw, label: 'Cycles' },
  { path: '/analysis', icon: LineChart, label: 'Analysis' },
  { path: '/report', icon: FileText, label: 'Report' },
]

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
        'fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-tq-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        '2xl:fixed 2xl:top-0 2xl:h-screen 2xl:translate-x-0',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-2 mb-5">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-bold text-[15px] tracking-tight text-tq-fg-1">TermIQ</span>
        </div>
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
            location.pathname === path || (path === '/devices' && location.pathname === '/')
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
