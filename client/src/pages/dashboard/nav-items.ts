import { LayoutDashboard, BookOpen, Briefcase, Calendar, UserRound, Heart } from 'lucide-react'

export const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { to: '/dashboard/formacion', icon: BookOpen, label: 'nav.formacion' },
  { to: '/dashboard/empleabilidad', icon: Briefcase, label: 'nav.empleabilidad' },
  { to: '/dashboard/experiencias', icon: Calendar, label: 'nav.experiencias' },
  { to: '/dashboard/mentorias', icon: UserRound, label: 'nav.mentorias' },
  { to: '/dashboard/salud-mental', icon: Heart, label: 'nav.salud-mental' },
] as const
