import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Search, LogOut, User } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { navItems } from "@/features/dashboard/constants/nav-items";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isOnboarding = location.pathname === "/onboarding"

  const currentLabel = isOnboarding
    ? "auth.onboarding"
    : navItems.find((item) => item.to === location.pathname)?.label ?? "nav.dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg px-10 lg:px-14">
      <div className="flex items-center gap-4">
        {isOnboarding ? (
          <span className="select-none text-2xl">🧠</span>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5 text-text" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-bg-secondary p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}
        <h1 className="font-heading text-lg  font-semibold text-text">
          {isOnboarding ? t(currentLabel) : t(currentLabel)}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {!isOnboarding && (
          <>
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder={t("common.search-placeholder")}
                className="h-10 w-48 border-border bg-surface pl-10 text-sm text-text placeholder:text-text-secondary lg:w-64"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-text md:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>
          </>
        )}

        <LanguageSwitcher />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full p-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.nombre ?? "User"} />
                <AvatarFallback className="bg-primary/20 text-xs text-primary">
                  {user?.nombre?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44 bg-bg-secondary border-border">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-text">
                {user?.nombre ?? "Usuario"}
              </p>
              <p className="text-xs text-text-secondary">{user?.email ?? ""}</p>
            </div>
            {!isOnboarding && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.dashboard")}
                </DropdownMenuItem>
              </>
            )}
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
    </header>
  );
}
