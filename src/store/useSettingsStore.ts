import { create } from 'zustand'
import i18n from '@/i18n'

export type Language = 'en_US' | 'pt_BR'

const STORAGE_KEY = 'tq_settings_language'

interface SettingsStore {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  language: (localStorage.getItem(STORAGE_KEY) as Language) ?? 'pt_BR',
  setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang)
    i18n.changeLanguage(lang)
    set({ language: lang })
  },
}))
