import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { stepLocationSchema } from "@/features/onboarding/schemas/onboarding.schemas";
import {
  CONTINENTS,
  COUNTRIES,
} from "@/features/onboarding/constants";
import type { StepProps } from "@/features/onboarding/types/onboarding.types";

export function StepLocation({ data, onUpdate }: StepProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(stepLocationSchema),
    defaultValues: {
      continent: data.continent ?? "",
      country: data.country ?? "",
      state: data.state ?? "",
      city: data.city ?? "",
      whatsapp: data.whatsapp ?? "",
    },
  });

  const selectedContinent = useWatch({ control, name: "continent" });

  const filteredCountries = useMemo(
    () => COUNTRIES.filter((c) => c.continent === selectedContinent),
    [selectedContinent],
  );

  return (
    <form
      id="step-location"
      onSubmit={handleSubmit(onUpdate)}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">
            {t("onboarding.continent")}
          </label>
          <select
            {...register("continent")}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">{t("onboarding.selectOption")}</option>
            {CONTINENTS.map((c) => (
              <option key={c.value} value={c.value}>
                {t(c.labelKey)}
              </option>
            ))}
          </select>
          {errors.continent && (
            <p className="text-xs text-danger">
              {t(errors.continent.message!)}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">
            {t("onboarding.country")}
          </label>
          <select
            {...register("country")}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">{t("onboarding.selectOption")}</option>
            {filteredCountries.map((c) => (
              <option key={c.value} value={c.value}>
                {t(c.labelKey)}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-xs text-danger">{t(errors.country.message!)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">
            {t("onboarding.city")}
          </label>
          <input
            type="text"
            {...register("city")}
            placeholder={t("onboarding.cityPlaceholder")}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-text-secondary focus:border-primary"
          />
          {errors.city && (
            <p className="text-xs text-danger">{t(errors.city.message!)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">
            {t("onboarding.state")}
          </label>
          <input
            type="text"
            {...register("state")}
            placeholder={t("onboarding.statePlaceholder")}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-text-secondary focus:border-primary"
          />
          {errors.state && (
            <p className="text-xs text-danger">{t(errors.state.message!)}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          {t("onboarding.phone")}
        </label>
        <PhoneInput
          international
          defaultCountry="BR"
          value={data.whatsapp ?? ""}
          onChange={(value) => setValue("whatsapp", value ?? "")}
          className="[&_.PhoneInputCountry]:ml-0 [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:rounded-md [&_.PhoneInputInput]:border [&_.PhoneInputInput]:border-border [&_.PhoneInputInput]:bg-bg [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-2 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-text [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:focus:border-primary"
        />
      </div>
    </form>
  );
}
