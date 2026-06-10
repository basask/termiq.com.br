import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettingsStore, type Language } from '@/store/useSettingsStore'

const LANGUAGES: Array<{ value: Language; labelKey: string }> = [
  { value: 'en_US', labelKey: 'settings.langEn'   },
  { value: 'pt_BR', labelKey: 'settings.langPtBR' },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className="p-4 md:p-7 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tq-fg-1">{t('settings.title')}</h1>
        <p className="font-mono text-[12px] text-tq-fg-3 mt-1">{t('settings.subtitle')}</p>
      </div>

      <Card className="max-w-sm">
        <CardHeader className="p-4">
          <CardTitle>{t('settings.languageSection')}</CardTitle>
          <CardDescription>{t('settings.languageDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col gap-2.5">
          {LANGUAGES.map(({ value, labelKey }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="language"
                value={value}
                checked={language === value}
                onChange={() => setLanguage(value)}
                className="accent-tq-green-600 w-4 h-4 cursor-pointer"
              />
              <span className="text-[13px] text-tq-fg-1 group-hover:text-tq-fg-1 font-medium">
                {t(labelKey)}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
