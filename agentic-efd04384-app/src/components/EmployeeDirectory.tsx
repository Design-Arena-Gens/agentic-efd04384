"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Employee,
  useTimeTracking,
} from "@/contexts/TimeTrackingContext";
import { formatCurrency } from "@/lib/format";

type ClockFormState = Record<
  string,
  {
    project: string;
    notes: string;
  }
>;

const initialEmployeeForm = {
  name: "",
  role: "",
  email: "",
  hourlyRate: 18,
};

const sortEmployees = (employees: Employee[]) => {
  return [...employees].sort((a, b) => {
    if (a.status === b.status) {
      return a.name.localeCompare(b.name, "fr");
    }
    return a.status === "active" ? -1 : 1;
  });
};

export const EmployeeDirectory = () => {
  const {
    employees,
    sessions,
    addEmployee,
    archiveEmployee,
    updateEmployee,
    clockIn,
    clockOut,
  } = useTimeTracking();

  const orderedEmployees = useMemo(
    () => sortEmployees(employees),
    [employees],
  );
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
  const [clockFormState, setClockFormState] = useState<ClockFormState>({});

  const handleAddEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employeeForm.name.trim()) {
      return;
    }
    addEmployee({
      name: employeeForm.name.trim(),
      role: employeeForm.role.trim() || "Employé",
      email: employeeForm.email.trim(),
      hourlyRate: Number(employeeForm.hourlyRate) || 18,
      status: "active",
    });
    setEmployeeForm(initialEmployeeForm);
  };

  const handleClockIn = (employeeId: string) => {
    const current = clockFormState[employeeId];
    const project = current?.project?.trim() || "Général";
    const notes = current?.notes?.trim();
    clockIn(employeeId, project, notes);
    setClockFormState((prev) => ({
      ...prev,
      [employeeId]: { project: "", notes: "" },
    }));
  };

  const handleClockOut = (employeeId: string) => {
    clockOut(employeeId);
  };

  const setClockInput = (
    employeeId: string,
    field: "project" | "notes",
    value: string,
  ) => {
    setClockFormState((prev) => ({
      ...prev,
      [employeeId]: {
        project: field === "project" ? value : prev[employeeId]?.project ?? "",
        notes: field === "notes" ? value : prev[employeeId]?.notes ?? "",
      },
    }));
  };

  const activeSessionByEmployee = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((session) => {
      map.set(session.employeeId, session.project);
    });
    return map;
  }, [sessions]);

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Équipe
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ajoutez des collaborateurs et gérez leur pointage en direct.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleAddEmployee}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50 md:grid-cols-5"
      >
        <input
          required
          value={employeeForm.name}
          onChange={(event) =>
            setEmployeeForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="Nom complet"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        />
        <input
          value={employeeForm.role}
          onChange={(event) =>
            setEmployeeForm((prev) => ({ ...prev, role: event.target.value }))
          }
          placeholder="Poste"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        />
        <input
          type="email"
          value={employeeForm.email}
          onChange={(event) =>
            setEmployeeForm((prev) => ({ ...prev, email: event.target.value }))
          }
          placeholder="Adresse e-mail"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        />
        <input
          type="number"
          min={0}
          step={1}
          value={employeeForm.hourlyRate}
          onChange={(event) =>
            setEmployeeForm((prev) => ({
              ...prev,
              hourlyRate: Number(event.target.value),
            }))
          }
          placeholder="Taux horaire (€)"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Ajouter
        </button>
      </form>

      <div className="space-y-3">
        {orderedEmployees.map((employee) => {
          const activeSession = sessions.find(
            (session) => session.employeeId === employee.id,
          );
          const clockState = clockFormState[employee.id] ?? {
            project: "",
            notes: "",
          };
          return (
            <article
              key={employee.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-center text-sm font-semibold leading-10 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {employee.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {employee.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {employee.role || "Employé"} •{" "}
                      {formatCurrency(employee.hourlyRate)} / h
                    </p>
                  </div>
                </div>
                {employee.email ? (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {employee.email}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
                {employee.status === "active" ? (
                  <div className="flex flex-col gap-2 md:w-64">
                    {!activeSession ? (
                      <>
                        <input
                          value={clockState.project}
                          onChange={(event) =>
                            setClockInput(employee.id, "project", event.target.value)
                          }
                          placeholder="Projet / activité"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                        />
                        <input
                          value={clockState.notes}
                          onChange={(event) =>
                            setClockInput(employee.id, "notes", event.target.value)
                          }
                          placeholder="Notes (optionnel)"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                        />
                      </>
                    ) : (
                      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Session en cours sur « {activeSession.project} »
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/40 dark:text-amber-200">
                    Employé inactif
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {employee.status === "active" ? (
                    activeSession ? (
                      <button
                        onClick={() => handleClockOut(employee.id)}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Clôturer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClockIn(employee.id)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        Pointer
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => updateEmployee(employee.id, { status: "active" })}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                    >
                      Réactiver
                    </button>
                  )}
                  {employee.status === "active" ? (
                    <button
                      onClick={() => archiveEmployee(employee.id)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400"
                    >
                      Désactiver
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
