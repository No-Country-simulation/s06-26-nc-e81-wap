import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Bot, Target, Route, Briefcase, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { orientar, type OrientarResponse } from "@/services/api/orientar.api"
import { useAuthStore } from "@/store/auth.store"
import type { OrientationDialogProps } from "@/features/ai-orientation/types/orientation.types"

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

function TypewriterList({ items, speed = 20, itemDelay = 600, onComplete }: { items: string[]; speed?: number; itemDelay?: number; onComplete?: () => void }) {
  const [visibleIndex, setVisibleIndex] = useState(0)
  const [lastItemDone, setLastItemDone] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      onComplete?.()
      return
    }
    let current = 0
    const timer = setInterval(() => {
      current++
      setVisibleIndex(current)
      if (current >= items.length - 1) {
        clearInterval(timer)
      }
    }, itemDelay)
    return () => clearInterval(timer)
  }, [items, itemDelay, onComplete])

  useEffect(() => {
    if (lastItemDone && visibleIndex === items.length - 1) {
      onComplete?.()
    }
  }, [lastItemDone, visibleIndex, items.length, onComplete])

  return (
    <>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-text" style={{ display: i <= visibleIndex ? "flex" : "none" }}>
          <span className="mt-0.5 shrink-0 text-amber-400">•</span>
          {i < visibleIndex ? (
            item
          ) : (
            <TypewriterText text={item} speed={speed} onComplete={i === items.length - 1 ? () => setLastItemDone(true) : undefined} />
          )}
        </li>
      ))}
    </>
  )
}

function LoadingBrain() {
  const [dots, setDots] = useState("")
  const [step, setStep] = useState(0)
  const messages = [
    "Orion está analizando tu perfil",
    "Revisando habilidades y experiencia",
    "Comparando con el mercado laboral",
    "Calculando gap formativo",
    "Generando trayectoria personalizada",
  ]

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)
    const msgInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, messages.length - 1))
    }, 800)
    return () => {
      clearInterval(dotInterval)
      clearInterval(msgInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-10 w-10 text-primary" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex h-5 w-5 rounded-full bg-primary" />
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text transition-all duration-300">
          {messages[step]}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Orion IA — Procesando datos...
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

type RevealStep = "items" | "trajectory" | "vacancies" | "confidence" | "done"

const STEP_ORDER: RevealStep[] = ["items", "trajectory", "vacancies", "confidence", "done"]
const VISIBLE_AFTER: Record<RevealStep, RevealStep[]> = {
  items: ["items"],
  trajectory: ["items", "trajectory"],
  vacancies: ["items", "trajectory", "vacancies"],
  confidence: ["items", "trajectory", "vacancies", "confidence"],
  done: ["items", "trajectory", "vacancies", "confidence", "done"],
}

export function OrientationDialog({ open, onClose }: OrientationDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OrientarResponse | null>(null)
  const [reveal, setReveal] = useState<RevealStep>("items")

  const isVisible = (step: RevealStep) => result && VISIBLE_AFTER[reveal].includes(step)
  const isCurrentlyTyping = (step: RevealStep) => reveal === step

  const advance = useCallback(() => {
    setReveal((prev) => {
      const idx = STEP_ORDER.indexOf(prev)
      return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : "done"
    })
  }, [])

  const handleAnalyze = async () => {
    setLoading(true)
    setReveal("items")
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const data = await orientar({
      usuario_id: user?.id ?? "mock-user",
      perfil: user?.perfil ?? "desarrollador",
      nivel: user?.nivel ?? "junior",
      region: "latam",
      idioma: "es",
      lat: -23.55,
      lng: -46.63,
    })
    setResult(data)
    setLoading(false)
  }

  const handleClose = () => {
    setResult(null)
    setLoading(false)
    setReveal("items")
    onClose()
  }

  const handleGoToEmployability = () => {
    setResult(null)
    setLoading(false)
    setReveal("items")
    onClose()
    navigate("/dashboard/empleabilidad")
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {t("orientation.title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {result
              ? t("orientation.resultSubtitle")
              : t("orientation.description")}
          </DialogDescription>
        </DialogHeader>

        {!result && !loading && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-center text-sm text-text-secondary">
              {t("orientation.analyzePrompt")}
            </p>
            <Button onClick={handleAnalyze} variant="solid" className="w-full sm:w-auto">
              <Target className="mr-2 h-4 w-4" />
              {t("orientation.analyzeButton")}
            </Button>
          </div>
        )}

        {loading && !result && <LoadingBrain />}

        {result && !loading && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-text-secondary">{t("orientation.gap")}</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">{result.gap_porcentual}%</span>
              <span className="text-xs text-text-secondary">{t("orientation.gapRemaining")}</span>
            </div>

            <div
              className={`${isVisible("items") ? "animate-in fade-in block" : "hidden"}`}
            >
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {t("orientation.gapItems")}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {isCurrentlyTyping("items") ? (
                    <TypewriterList key={result.gap_items.join("")} items={result.gap_items} speed={18} itemDelay={600} onComplete={advance} />
                  ) : (
                    result.gap_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text">
                        <span className="mt-0.5 shrink-0 text-amber-400">•</span>
                        {item}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div
              className={`${isVisible("trajectory") ? "animate-in fade-in block" : "hidden"}`}
            >
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Route className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                    {t("orientation.trajectory")}
                  </span>
                </div>
                <p className="text-sm text-text">
                  {isCurrentlyTyping("trajectory") ? (
                    <TypewriterText key={result.trayectoria_sugerida} text={result.trayectoria_sugerida} speed={20} onComplete={advance} />
                  ) : (
                    result.trayectoria_sugerida
                  )}
                </p>
              </div>
            </div>

            <div
              className={`${isVisible("vacancies") ? "animate-in fade-in block" : "hidden"}`}
            >
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    {t("orientation.vacancies")}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {isCurrentlyTyping("vacancies") ? (
                    result.vacantes_compatibles.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {i === result.vacantes_compatibles.length - 1 ? (
                          <TypewriterText text={v} speed={20} onComplete={advance} />
                        ) : (
                          <TypewriterText text={v} speed={20} />
                        )}
                      </li>
                    ))
                  ) : (
                    result.vacantes_compatibles.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {v}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div
              className={`${isVisible("confidence") ? "animate-in fade-in flex" : "hidden"} items-center justify-center gap-1.5 text-xs text-text-secondary`}
              onAnimationEnd={() => isCurrentlyTyping("confidence") && advance()}
            >
              <span>{t("orientation.confidence")}</span>
              <span className="font-medium text-primary">{(result.confianza * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {reveal === "done" && (
            <Button variant="outline" onClick={handleGoToEmployability}>
              {t("orientation.goToEmployability")}
            </Button>
          )}
          <Button variant={result ? "solid" : "outline"} onClick={handleClose}>
            {result ? t("common.close") : t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
