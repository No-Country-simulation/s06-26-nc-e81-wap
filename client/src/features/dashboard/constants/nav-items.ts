import {
  LayoutDashboard,
  Brain,
  IdCard,
  Sparkles,
  UsersRound,
  Origami,
} from "lucide-react";

export const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "nav.dashboard" },
  { to: "/dashboard/formacion", icon: Brain, label: "nav.formacion" },
  { to: "/dashboard/empleabilidad", icon: IdCard, label: "nav.empleabilidad" },
  { to: "/dashboard/experiencias", icon: Sparkles, label: "nav.experiencias" },
  { to: "/dashboard/mentorias", icon: UsersRound, label: "nav.mentorias" },
  { to: "/dashboard/salud-mental", icon: Origami, label: "nav.salud-mental" },
] as const;
