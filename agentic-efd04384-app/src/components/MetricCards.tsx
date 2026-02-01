"use client";

import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { formatCurrency, formatDuration } from "@/lib/format";

const cards = [
  {
    id: "totalHours",
    title: "Heures suivies",
    accent: "from-sky-400/80 to-sky-600/60",
    formatter: (value: number) => formatDuration(Math.round(value * 60)),
  },
  {
    id: "totalEmployees",
    title: "Employés actifs",
    accent: "from-emerald-400/80 to-emerald-600/60",
    formatter: (value: number) => `${value}`,
  },
  {
    id: "activeSessions",
    title: "Pointages en cours",
    accent: "from-amber-400/80 to-amber-600/60",
    formatter: (value: number) => `${value}`,
  },
  {
    id: "laborCost",
    title: "Coût estimé",
    accent: "from-purple-400/70 to-purple-600/50",
    formatter: (value: number) => formatCurrency(value),
  },
] as const;

export const MetricCards = () => {
  const { metrics } = useTimeTracking();

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className={`pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-br ${card.accent} opacity-70 blur-2xl`}
          />
          <div className="flex h-full flex-col justify-between">
            <div className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.title}
            </div>
            <div className="mt-6 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              {card.formatter(metrics[card.id as keyof typeof metrics] as number)}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
