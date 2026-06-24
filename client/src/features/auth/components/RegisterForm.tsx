import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { registerSchema } from "@/features/auth/schemas/auth.schemas";
import type {
  RegisterFormData,
  RegisterFormProps,
} from "@/features/auth/types/auth.types";

export function RegisterForm({
  onSubmit,
  isLoading,
  onLoginClick,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          {t("auth.name")}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            type="text"
            placeholder={t("auth.namePlaceholder")}
            {...register("name")}
            className="border-border bg-surface pl-10 text-text placeholder:text-text-secondary"
          />
        </div>
        {errors.name && (
          <p className="text-xs text-danger">{t(errors.name.message!)}</p>
        )}
      </div>

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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          {t("auth.confirmPassword")}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            type={showCp ? "text" : "password"}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            {...register("confirmPassword")}
            className="border-border bg-surface pl-10 pr-10 text-text placeholder:text-text-secondary"
          />
          <button
            type="button"
            onClick={() => setShowCp((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
            tabIndex={-1}
          >
            {showCp ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-danger">
            {t(errors.confirmPassword.message!)}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="solid"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("auth.register")}
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

      <SocialButtons mode="register" />

      <p className="text-center text-sm text-text-secondary">
        {t("auth.hasAccount")}{" "}
        <button
          type="button"
          onClick={onLoginClick}
          className="font-medium text-primary hover:underline"
        >
          {t("auth.loginLink")}
        </button>
      </p>
    </form>
  );
}
