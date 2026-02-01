"use client";

import { useMemo } from "react";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";

const ranges = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "all", label: "Tout" },
] as const;

const greetings = ["Bonjour", "Salut", "Bienvenue"];

const randomGreeting = () => {
  return greetings[new Date().getSeconds() % greetings.length];
};

export const DashboardHeader = () => {
  const { range, setRange } = useTimeTracking();

  const greeting = useMemo(() => randomGreeting(), []);

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {greeting} 👋
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Logiciel de pointage
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {ranges.map((item) => (
          <button
            key={item.id}
            onClick={() => setRange(item.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              range === item.id
                ? "border-transparent bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
