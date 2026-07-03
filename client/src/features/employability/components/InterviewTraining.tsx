import { useTranslation } from 'react-i18next';
import { ArrowRight, Play } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { InterviewTrainingProps } from '@/features/employability/types/employability.types';

export function InterviewTraining({ trainings, isLoading }: InterviewTrainingProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="mb-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-full sm:w-36" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <Skeleton className="h-36 w-full rounded-none sm:h-40" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (trainings.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold leading-8 tracking-tight text-text">
            {t('employability.training.title')}
          </h3>
          <p className="text-sm leading-5 text-text-secondary">
            {t('employability.training.subtitle')}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-xs font-semibold tracking-wider text-text transition-colors hover:bg-muted">
          {t('employability.training.explore')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {trainings.map((training) => (
          <div
            key={training.id}
            className="group overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-36 overflow-hidden sm:h-40">
              <img
                src={training.image}
                alt={training.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {training.tag && (
                <span className="absolute left-3 top-3 rounded bg-text/90 px-2 py-1 font-mono text-[10px] text-bg backdrop-blur">
                  {training.tag}
                </span>
              )}
            </div>
            <div className="p-6">
              <h4 className="mb-2 text-xl font-semibold leading-7 text-text transition-colors group-hover:text-primary">
                {training.title}
              </h4>
              <p className="mb-4 line-clamp-2 text-sm leading-5 text-text-secondary">
                {training.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-primary">
                  {training.duration}
                </span>
                <button className="cursor-pointer bg-transparent text-text-secondary transition-colors hover:text-text">
                  <Play className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
