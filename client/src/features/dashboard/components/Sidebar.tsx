import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, User } from "lucide-react";
import { version } from "../../../../package.json";

import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/store/auth.store";
import { navItems } from "@/features/dashboard/constants/nav-items";

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-border px-6",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="text-xl">🧠</span>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold text-text">
              App BiT
            </span>
            <span className="text-[10px] leading-tight text-text-secondary">
              v{version}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            title={collapsed ? t(label) : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-sm px-3 py-3 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-5",
                isActive
                  ? "border-l-3 border-primary bg-primary/10 font-medium text-primary"
                  : "border-l-3 border-transparent text-text-secondary hover:bg-surface hover:text-text",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t(label)}</span>}
          </NavLink>
        ))}
      </div>

      <div
        className={cn(
          "border-t border-border px-3 py-3",
          collapsed && "flex justify-center px-0",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 rounded-md transition-colors hover:bg-surface",
                collapsed ? "p-2" : "w-full px-3 py-2",
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="" alt={user?.nombre ?? "User"} />
                <AvatarFallback className="bg-primary/20 text-xs text-primary">
                  {user?.nombre?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-1 flex-col items-start text-left">
                  <span className="text-sm font-medium text-text truncate max-w-[140px]">
                    {user?.nombre ?? "Usuario"}
                  </span>
                  <span className="text-xs text-text-secondary truncate max-w-[140px]">
                    {user?.email ?? ""}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="min-w-40">
            <DropdownMenuItem
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              {t("nav.dashboard")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
