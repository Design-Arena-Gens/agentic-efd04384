"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";

const defaultForm = {
  employeeId: "",
  project: "",
  start: "",
  end: "",
  notes: "",
};

const toIso = (value: string) => {
  const parsed = value ? new Date(value) : null;
  return parsed ? parsed.toISOString() : "";
};

export const ManualEntryForm = () => {
  const { employees, addManualEntry } = useTimeTracking();
  const [form, setForm] = useState(defaultForm);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "active"),
    [employees],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.employeeId || !form.start || !form.end) return;
    const startIso = toIso(form.start);
    const endIso = toIso(form.end);
    if (!startIso || !endIso) return;
    addManualEntry({
      employeeId: form.employeeId,
      project: form.project || "Général",
      start: startIso,
      end: endIso,
      notes: form.notes,
    });
    setForm(defaultForm);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Ajouter une saisie manuelle
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Corrigez une oublie de pointage ou saisissez une plage horaire spécifique.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-4 grid gap-4 md:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Employé
          </span>
          <select
            required
            value={form.employeeId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, employeeId: event.target.value }))
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          >
            <option value="">Sélectionnez</option>
            {activeEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Projet / activité
          </span>
          <input
            value={form.project}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, project: event.target.value }))
            }
            placeholder="Ex: Accueil"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Début
          </span>
          <input
            required
            type="datetime-local"
            value={form.start}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, start: event.target.value }))
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Fin
          </span>
          <input
            required
            type="datetime-local"
            value={form.end}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, end: event.target.value }))
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Notes
          </span>
          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
            rows={3}
            placeholder="Commentaires éventuels"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          />
        </label>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Ajouter la saisie
          </button>
        </div>
      </form>
    </section>
  );
};
