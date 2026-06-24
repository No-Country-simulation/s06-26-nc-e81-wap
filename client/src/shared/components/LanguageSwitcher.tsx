import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'
import { changeLanguage } from '@/i18n'

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-text"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-16 bg-bg-secondary border-border">
        {languages.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className={cn(
              'cursor-pointer',
              i18n.language === code && 'font-medium text-primary',
            )}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
