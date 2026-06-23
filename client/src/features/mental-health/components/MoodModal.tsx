import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MOOD_EMOJI_LIST } from "@/features/mental-health/constants";
import { useAuthStore } from "@/store/auth.store";
import type { MoodModalProps } from "@/features/mental-health/types/mental-health.types";

export function MoodModal({ open, onSelect }: MoodModalProps) {
  const { t } = useTranslation();
  const userName = useAuthStore((s) => s.user?.nombre);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto h-full w-full max-h-full max-w-full bg-black/60 backdrop-blur-sm open:flex open:items-center open:justify-center border-0 p-0"
      onClick={(e) => {
        if (e.target === dialogRef.current) return;
      }}
    >
      <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl">
        <p className="mb-1 text-center text-lg font-semibold text-text">
          {t("mental-health.modal.greeting", { name: userName ?? t("common.profile") })}
        </p>
        <h2 className="mb-2 text-center text-2xl font-bold text-text">
          {t("mental-health.modal.title")}
        </h2>
        <p className="mb-8 text-center text-sm leading-5 text-text-secondary">
          {t("mental-health.modal.subtitle")}
        </p>
        <div className="flex justify-center gap-5 sm:gap-7">
          {MOOD_EMOJI_LIST.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onSelect((i + 1) as 1 | 2 | 3 | 4 | 5)}
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl text-3xl transition-transform duration-200 hover:scale-125 focus:outline-none sm:h-20 sm:w-20 sm:text-4xl"
              aria-label={t(`mental-health.modal.mood${i + 1}`)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
