import { ActiveSessions } from "@/components/ActiveSessions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EmployeeDirectory } from "@/components/EmployeeDirectory";
import { EntriesTable } from "@/components/EntriesTable";
import { ManualEntryForm } from "@/components/ManualEntryForm";
import { MetricCards } from "@/components/MetricCards";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";

export default function Home() {
  return (
    <TimeTrackingProvider>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-72 bg-[radial-gradient(circle,rgba(59,130,246,0.25)_0%,rgba(59,130,246,0)_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(14,165,233,0.35)_0%,rgba(14,165,233,0)_70%)]" />
        <main className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <DashboardHeader />
          <MetricCards />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EmployeeDirectory />
            </div>
            <ActiveSessions />
          </div>
          <ManualEntryForm />
          <EntriesTable />
        </main>
      </div>
    </TimeTrackingProvider>
  );
}
