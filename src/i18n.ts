import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from '@/locales/en_US.json'
import ptBR from '@/locales/pt_BR.json'

const STORAGE_KEY = 'tq_settings_language'
const stored = localStorage.getItem(STORAGE_KEY)
const lng = stored === 'en_US' ? 'en_US' : 'pt_BR'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en_US:    { translation: enUS },
      pt_BR: { translation: ptBR },
    },
    lng,
    fallbackLng: 'pt_BR',
    interpolation: { escapeValue: false },
  })

export default i18n
