import { create } from 'zustand'

type Page = 'machine' | 'cycles' | 'analysis' | 'report'

interface AppState {
  activePage: Page
  setActivePage: (page: Page) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'machine',
  setActivePage: (page) => set({ activePage: page }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
