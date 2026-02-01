"use client";

import { useMemo, useState } from "react";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { formatDate, formatDuration, formatTime } from "@/lib/format";

export const EntriesTable = () => {
  const { entriesForRange, getEmployeeName, deleteEntry, employees } =
    useTimeTracking();

  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "clock" | "manual">("all");

  const filteredEntries = useMemo(() => {
    return entriesForRange.filter((entry) => {
      if (employeeFilter !== "all" && entry.employeeId !== employeeFilter) {
        return false;
      }
      if (typeFilter !== "all" && entry.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [entriesForRange, employeeFilter, typeFilter]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Journal des pointages
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visualisez, filtrez et nettoyez les enregistrements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={employeeFilter}
            onChange={(event) => setEmployeeFilter(event.target.value)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Tous les employés</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Tous les types</option>
            <option value="clock">Automatique</option>
            <option value="manual">Manuelle</option>
          </select>
        </div>
      </header>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Employé</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Début</th>
              <th className="px-4 py-3">Fin</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {filteredEntries.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                  colSpan={8}
                >
                  Aucun enregistrement à afficher pour ce filtre.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="group transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                    {getEmployeeName(entry.employeeId)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {entry.project}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {formatDate(entry.start)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatTime(entry.start)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatTime(entry.end)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {formatDuration(entry.durationMinutes)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        entry.type === "manual"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                      }`}
                    >
                      {entry.type === "manual" ? "Manuelle" : "Automatique"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-full border border-transparent px-3 py-1 text-xs font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-700 dark:hover:border-slate-600 dark:hover:text-slate-200"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
