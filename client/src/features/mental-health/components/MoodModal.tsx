import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { MOOD_EMOJI_LIST } from "@/features/mental-health/constants";
import { useAuthStore } from "@/store/auth.store";
import type { MoodModalProps } from "@/features/mental-health/types/mental-health.types";

export function MoodModal({ open, onSelect }: MoodModalProps) {
  const { t } = useTranslation();
  const userName = useAuthStore((s) => s.user?.nombre);

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {t("mental-health.modal.greeting", { name: userName ?? t("common.profile") })}
          </DialogTitle>
          <DialogDescription>
            {t("mental-health.modal.title")}
            <br />
            {t("mental-health.modal.subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-5 py-4 sm:gap-7">
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
      </DialogContent>
    </Dialog>
  );
}
