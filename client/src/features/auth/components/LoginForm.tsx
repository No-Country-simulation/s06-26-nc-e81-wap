import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { loginSchema } from "@/features/auth/schemas/auth.schemas";
import type {
  LoginFormData,
  LoginFormProps,
} from "@/features/auth/types/auth.types";

export function LoginForm({
  onSubmit,
  isLoading,
  onRegisterClick,
}: LoginFormProps) {
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          {t("auth.email")}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            {...register("email")}
            className="border-border bg-surface pl-10 text-text placeholder:text-text-secondary"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-danger">{t(errors.email.message!)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          {t("auth.password")}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            type={showPw ? "text" : "password"}
            placeholder={t("auth.passwordPlaceholder")}
            {...register("password")}
            className="border-border bg-surface pl-10 pr-10 text-text placeholder:text-text-secondary"
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
            tabIndex={-1}
          >
            {showPw ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-danger">{t(errors.password.message!)}</p>
        )}
      </div>

      <div className="text-right">
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          title={t("auth.comingSoon")}
        >
          {t("auth.forgotPassword")}
        </button>
      </div>

      <Button
        type="submit"
        variant="solid"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("auth.login")}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg px-2 text-text-secondary">
            {t("common.or")}
          </span>
        </div>
      </div>

      <SocialButtons mode="login" />

      <p className="text-center text-sm text-text-secondary">
        {t("auth.noAccount")}{" "}
        <button
          type="button"
          onClick={onRegisterClick}
          className="font-medium text-primary hover:underline"
        >
          {t("auth.registerLink")}
        </button>
      </p>
    </form>
  );
}
