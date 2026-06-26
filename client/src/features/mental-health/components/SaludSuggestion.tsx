import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Heart, AlertTriangle, Lightbulb, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import type { SaludResponse } from "@/services/api/salud.api";

interface SaludSuggestionProps {
  response: SaludResponse | null
  open: boolean
  onClose: () => void
}

function TypewriterText({ text, speed = 25, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-primary">|</span>}
    </span>
  )
}

function MiniLoadingBrain() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-primary" />
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text">
          Orion está analizando tu estado de ánimo
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Orion IA — Procesando respuesta...
        </p>
      </div>
    </div>
  )
}

type RevealStep = "message" | "suggestion" | "cvv" | "done"

const STEP_ORDER: RevealStep[] = ["message", "suggestion", "cvv", "done"]
const VISIBLE_AFTER: Record<RevealStep, RevealStep[]> = {
  message: ["message"],
  suggestion: ["message", "suggestion"],
  cvv: ["message", "suggestion", "cvv"],
  done: ["message", "suggestion", "cvv", "done"],
}

export function SaludSuggestion({ response, open, onClose }: SaludSuggestionProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState<RevealStep>("message");

  const isVisible = (step: RevealStep) => response && VISIBLE_AFTER[reveal].includes(step)
  const isCurrentlyTyping = (step: RevealStep) => reveal === step

  const advance = useCallback(() => {
    setReveal((prev) => {
      const idx = STEP_ORDER.indexOf(prev)
      return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : "done"
    })
  }, [])

  useEffect(() => {
    if (response && open) {
      const initTimer = setTimeout(() => {
        setLoading(true);
        setReveal("message");
      }, 0);
      const endTimer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => {
        clearTimeout(initTimer);
        clearTimeout(endTimer);
      };
    }
    const resetTimer = setTimeout(() => {
      setLoading(false);
      setReveal("message");
    }, 0);
    return () => clearTimeout(resetTimer);
  }, [response, open]);

  useEffect(() => {
    if (reveal === "cvv" && !response?.derivar_cvv) {
      const timer = setTimeout(() => advance(), 0);
      return () => clearTimeout(timer);
    }
  }, [reveal, response, advance])

  if (!response) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {t("mental-health.salud.title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {loading
              ? "Orion está procesando tu estado de ánimo..."
              : t("mental-health.salud.subtitle")}
          </DialogDescription>
        </DialogHeader>

        {loading && <MiniLoadingBrain />}

        {!loading && (
          <div className="space-y-4 py-2">
            <div className={`${isVisible("message") ? "animate-in fade-in block" : "hidden"}`}>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("mental-health.salud.message")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-text">
                  {isCurrentlyTyping("message") ? (
                    <TypewriterText text={response.mensaje} speed={18} onComplete={advance} />
                  ) : (
                    response.mensaje
                  )}
                </p>
              </div>
            </div>

            <div className={`${isVisible("suggestion") ? "animate-in fade-in block" : "hidden"}`}>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {t("mental-health.salud.suggestion")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-text">
                  {isCurrentlyTyping("suggestion") ? (
                    <TypewriterText text={response.accion_sugerida} speed={18} onComplete={advance} />
                  ) : (
                    response.accion_sugerida
                  )}
                </p>
              </div>
            </div>

            <div className={`${isVisible("cvv") && response.derivar_cvv ? "animate-in fade-in block" : "hidden"}`}
              onAnimationEnd={() => isCurrentlyTyping("cvv") && advance()}
            >
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">
                    {t("mental-health.salud.cvvWarning")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  {t("mental-health.salud.cvvMessage")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  onClick={() => window.open("https://www.cvv.org.br", "_blank")}
                >
                  {t("mental-health.salud.cvvButton")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="solid" className="w-full sm:w-auto">
            {t("common.continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
