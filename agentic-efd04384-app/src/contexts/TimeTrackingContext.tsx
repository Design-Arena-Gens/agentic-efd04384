"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "pointage-state-v1";

export type TimeRange = "today" | "week" | "month" | "all";

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  hourlyRate: number;
  status: "active" | "inactive";
};

export type TimeEntry = {
  id: string;
  employeeId: string;
  project: string;
  start: string;
  end: string;
  durationMinutes: number;
  notes?: string;
  type: "clock" | "manual";
};

export type ClockSession = {
  id: string;
  employeeId: string;
  project: string;
  clockIn: string;
  notes?: string;
};

type TimeTrackingState = {
  employees: Employee[];
  entries: TimeEntry[];
  sessions: ClockSession[];
};

type DashboardMetrics = {
  totalHours: number;
  totalEmployees: number;
  activeSessions: number;
  averageHoursPerEmployee: number;
  laborCost: number;
};

type TimeTrackingContextValue = {
  employees: Employee[];
  entries: TimeEntry[];
  sessions: ClockSession[];
  range: TimeRange;
  metrics: DashboardMetrics;
  entriesForRange: TimeEntry[];
  setRange: (range: TimeRange) => void;
  addEmployee: (payload: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, updates: Partial<Omit<Employee, "id">>) => void;
  archiveEmployee: (id: string) => void;
  clockIn: (employeeId: string, project: string, notes?: string) => void;
  clockOut: (employeeId: string) => void;
  cancelSession: (sessionId: string) => void;
  addManualEntry: (entry: {
    employeeId: string;
    project: string;
    start: string;
    end: string;
    notes?: string;
  }) => void;
  deleteEntry: (entryId: string) => void;
  updateEntry: (entryId: string, updates: Partial<Omit<TimeEntry, "id">>) => void;
  getEmployeeName: (id: string) => string;
};

const TimeTrackingContext = createContext<TimeTrackingContextValue | null>(null);

const defaultEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Sophie Dubois",
    role: "Assistante Administrative",
    email: "sophie.dubois@example.com",
    hourlyRate: 18,
    status: "active",
  },
  {
    id: "emp-2",
    name: "Marc Tremblay",
    role: "Technicien Support",
    email: "marc.tremblay@example.com",
    hourlyRate: 22,
    status: "active",
  },
  {
    id: "emp-3",
    name: "Lina Ouedraogo",
    role: "Chef de Projet",
    email: "lina.ouedraogo@example.com",
    hourlyRate: 30,
    status: "inactive",
  },
];

const now = new Date();
const defaultEntries: TimeEntry[] = [
  {
    id: "ent-1",
    employeeId: "emp-1",
    project: "Accueil",
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0).toISOString(),
    durationMinutes: 210,
    notes: "Réception des clients",
    type: "clock",
  },
  {
    id: "ent-2",
    employeeId: "emp-2",
    project: "Maintenance",
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 0).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 17, 15).toISOString(),
    durationMinutes: 495,
    notes: "Interventions sur site",
    type: "manual",
  },
  {
    id: "ent-3",
    employeeId: "emp-1",
    project: "Accueil",
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 8, 45).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 16, 30).toISOString(),
    durationMinutes: 465,
    type: "clock",
  },
];

const defaultState: TimeTrackingState = {
  employees: defaultEmployees,
  entries: defaultEntries,
  sessions: [],
};

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
};

const minutesBetween = (startIso: string, endIso: string) => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
};

const rangeMatches = (dateIso: string, range: TimeRange) => {
  if (range === "all") return true;
  const date = new Date(dateIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  if (range === "today") {
    return date >= startOfDay && date <= endOfDay;
  }

  const start = new Date(today);
  if (range === "week") {
    const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
    start.setDate(today.getDate() - day);
  } else if (range === "month") {
    start.setDate(1);
  }
  start.setHours(0, 0, 0, 0);

  return date >= start && date <= endOfDay;
};

const computeMetrics = (
  employees: Employee[],
  entries: TimeEntry[],
  range: TimeRange,
) => {
  const filtered = range === "all" ? entries : entries.filter((entry) => rangeMatches(entry.start, range));
  const totalMinutes = filtered.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const totalHours = totalMinutes / 60;
  const activeEmployeesCount = employees.filter((e) => e.status === "active").length;
  const averageHours =
    activeEmployeesCount > 0 ? totalHours / activeEmployeesCount : 0;
  const laborCost = filtered.reduce((sum, entry) => {
    const employee = employees.find((e) => e.id === entry.employeeId);
    if (!employee) return sum;
    return sum + (entry.durationMinutes / 60) * employee.hourlyRate;
  }, 0);

  return {
    totalHours,
    totalEmployees: activeEmployeesCount,
    activeSessions: 0,
    averageHoursPerEmployee: averageHours,
    laborCost,
  };
};

export const TimeTrackingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TimeTrackingState>(defaultState);
  const [range, setRange] = useState<TimeRange>("week");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TimeTrackingState;
        setState({
          employees: parsed.employees ?? defaultState.employees,
          entries: parsed.entries ?? defaultState.entries,
          sessions: parsed.sessions ?? [],
        });
      }
    } catch (error) {
      console.warn("Erreur de chargement du stockage local", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addEmployee = useCallback((payload: Omit<Employee, "id">) => {
    setState((prev) => ({
      ...prev,
      employees: [...prev.employees, { id: makeId(), ...payload }],
    }));
  }, []);

  const updateEmployee = useCallback(
    (id: string, updates: Partial<Omit<Employee, "id">>) => {
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((employee) =>
          employee.id === id ? { ...employee, ...updates } : employee,
        ),
      }));
    },
    [],
  );

  const archiveEmployee = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((employee) =>
        employee.id === id ? { ...employee, status: "inactive" } : employee,
      ),
    }));
  }, []);

  const clockIn = useCallback((employeeId: string, project: string, notes?: string) => {
    setState((prev) => {
      const alreadyActive = prev.sessions.find(
        (session) => session.employeeId === employeeId,
      );
      if (alreadyActive) {
        return prev;
      }
      const newSession: ClockSession = {
        id: makeId(),
        employeeId,
        project,
        clockIn: new Date().toISOString(),
        notes,
      };
      return { ...prev, sessions: [...prev.sessions, newSession] };
    });
  }, []);

  const clockOut = useCallback((employeeId: string) => {
    setState((prev) => {
      const session = prev.sessions.find((item) => item.employeeId === employeeId);
      if (!session) return prev;
      const clockOutTime = new Date().toISOString();
      const duration = minutesBetween(session.clockIn, clockOutTime);
      const newEntry: TimeEntry = {
        id: makeId(),
        employeeId,
        project: session.project,
        start: session.clockIn,
        end: clockOutTime,
        durationMinutes: duration,
        notes: session.notes,
        type: "clock",
      };
      return {
        ...prev,
        entries: [newEntry, ...prev.entries],
        sessions: prev.sessions.filter((item) => item.id !== session.id),
      };
    });
  }, []);

  const cancelSession = useCallback((sessionId: string) => {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((session) => session.id !== sessionId),
    }));
  }, []);

  const addManualEntry = useCallback(
    ({
      employeeId,
      project,
      start,
      end,
      notes,
    }: {
      employeeId: string;
      project: string;
      start: string;
      end: string;
      notes?: string;
    }) => {
      const duration = minutesBetween(start, end);
      if (duration <= 0) {
        return;
      }
      const newEntry: TimeEntry = {
        id: makeId(),
        employeeId,
        project,
        start,
        end,
        durationMinutes: duration,
        notes,
        type: "manual",
      };
      setState((prev) => ({
        ...prev,
        entries: [newEntry, ...prev.entries],
      }));
    },
    [],
  );

  const deleteEntry = useCallback((entryId: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== entryId),
    }));
  }, []);

  const updateEntry = useCallback(
    (entryId: string, updates: Partial<Omit<TimeEntry, "id">>) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) => {
          if (entry.id !== entryId) return entry;
          const nextEntry = { ...entry, ...updates };
          if (updates.start || updates.end) {
            const duration = minutesBetween(nextEntry.start, nextEntry.end);
            nextEntry.durationMinutes = duration;
          }
          return nextEntry;
        }),
      }));
    },
    [],
  );

  const entriesForRange = useMemo(() => {
    if (range === "all") return state.entries;
    return state.entries.filter((entry) => rangeMatches(entry.start, range));
  }, [state.entries, range]);

  const metrics = useMemo(() => {
    const baseMetrics = computeMetrics(state.employees, state.entries, range);
    return {
      ...baseMetrics,
      activeSessions: state.sessions.length,
    };
  }, [state.employees, state.entries, state.sessions.length, range]);

  const getEmployeeName = useCallback(
    (id: string) => state.employees.find((employee) => employee.id === id)?.name ?? "Employé inconnu",
    [state.employees],
  );

  const value: TimeTrackingContextValue = {
    employees: state.employees,
    entries: state.entries,
    sessions: state.sessions,
    range,
    metrics,
    entriesForRange,
    setRange,
    addEmployee,
    updateEmployee,
    archiveEmployee,
    clockIn,
    clockOut,
    cancelSession,
    addManualEntry,
    deleteEntry,
    updateEntry,
    getEmployeeName,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {hydrated ? children : null}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error(
      "useTimeTracking doit être utilisé à l'intérieur de TimeTrackingProvider",
    );
  }
  return context;
};
