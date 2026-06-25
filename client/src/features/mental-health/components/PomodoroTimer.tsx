import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { SectionCard } from "@/shared/ui/SectionCard";
import {
  POMODORO_WORK,
  POMODORO_BREAK,
  POMODORO_LONG_BREAK,
} from "@/features/mental-health/constants";
import type { Phase } from "../types/mental-health.types";
import { formatTime } from "../helpers";

export function PomodoroTimer() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("work");
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getDuration = (p: Phase) => {
    switch (p) {
      case "work":
        return POMODORO_WORK;
      case "break":
        return POMODORO_BREAK;
      case "longBreak":
        return POMODORO_LONG_BREAK;
    }
  };

  const start = useCallback(() => {
    if (intervalRef.current) return;
    const end = Date.now() + timeLeft * 1000;
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        setIsRunning(false);
        const next: Phase = phase === "work" ? "break" : "work";
        setPhase(next);
        setTimeLeft(getDuration(next));
      }
    }, 200);
  }, [timeLeft, phase, clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const pause = () => {
    clearTimer();
    setIsRunning(false);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(POMODORO_WORK);
  };

  const toggle = () => {
    if (isRunning) {
      pause();
    } else {
      setIsRunning(true);
      start();
    }
  };

  const progress =
    phase === "work"
      ? (timeLeft / POMODORO_WORK) * 100
      : (timeLeft / POMODORO_BREAK) * 100;

  const phaseLabel =
    phase === "work"
      ? t("mental-health.pomodoro.work")
      : t("mental-health.pomodoro.break");

  return (
    <SectionCard icon={Timer} label={t("mental-health.pomodoro.title")} variant="hero">
      <div className="mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {phaseLabel}
        </span>
      </div>

      <div className="mb-4">
        <span className="font-mono text-5xl font-black tracking-tight text-text sm:text-6xl">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            phase === "work" ? "bg-primary" : "bg-yellow-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="solid"
          size="sm"
          onClick={toggle}
          className="w-full sm:w-auto"
        >
          {isRunning ? (
            <>
              <Pause className="mr-1.5 h-4 w-4" />
              {t("mental-health.pomodoro.pause")}
            </>
          ) : (
            <>
              <Play className="mr-1.5 h-4 w-4" />
              {t("mental-health.pomodoro.start")}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t("mental-health.pomodoro.reset")}
        </Button>
      </div>
    </SectionCard>
  );
}
