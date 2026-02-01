"use client";

import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { formatDate, formatTime } from "@/lib/format";

export const ActiveSessions = () => {
  const { sessions, getEmployeeName, clockOut, cancelSession } = useTimeTracking();

  if (sessions.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Aucun pointage actif. Lancez un suivi depuis la liste des employés.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Pointages en cours
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contrôlez les sessions actives et clôturez-les en un clic.
          </p>
        </div>
      </header>
      <div className="space-y-3">
        {sessions.map((session) => (
          <article
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60"
          >
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {getEmployeeName(session.employeeId)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(session.clockIn)} • {formatTime(session.clockIn)} •{" "}
                {session.project}
              </p>
              {session.notes ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  {session.notes}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => cancelSession(session.id)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
              >
                Annuler
              </button>
              <button
                onClick={() => clockOut(session.employeeId)}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Clôturer
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
