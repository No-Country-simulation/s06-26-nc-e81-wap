import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Calendar,
  UserRound,
  Heart,
  Menu,
  Languages,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'
import { changeLanguage } from '@/i18n'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { to: '/dashboard/formacion', icon: BookOpen, label: 'nav.formacion' },
  { to: '/dashboard/empleabilidad', icon: Briefcase, label: 'nav.empleabilidad' },
  { to: '/dashboard/experiencias', icon: Calendar, label: 'nav.experiencias' },
  { to: '/dashboard/mentorias', icon: UserRound, label: 'nav.mentorias' },
  { to: '/dashboard/salud-mental', icon: Heart, label: 'nav.salud-mental' },
] as const

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
] as const

function SidebarContent() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-3">
        <span className="text-xl">🧠</span>
        <span className="font-heading text-lg font-bold text-white">App BiT</span>
      </div>
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/20 text-primary font-medium'
                : 'text-text-secondary hover:bg-surface hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{t(label)}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const currentLabel = navItems.find((item) => item.to === location.pathname)?.label ?? 'nav.dashboard'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 bg-bg p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <h1 className="font-heading text-lg font-semibold text-white">
          {t(currentLabel)}
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-text-secondary">
            <Languages className="h-4 w-4" />
            {i18n.language?.toUpperCase()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-bg-secondary border-border">
          {languages.map(({ code, label }) => (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLanguage(code)}
              className={cn(
                'cursor-pointer text-text-secondary hover:bg-surface hover:text-white',
                i18n.language === code && 'text-primary font-medium'
              )}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-bg">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-bg lg:block">
        <SidebarContent />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
