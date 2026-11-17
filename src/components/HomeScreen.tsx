import React from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckSquare,
  ClipboardList,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react';
import type { Theme } from './Header';
import { REPORT } from '../utils/reportUtils';

interface HomeScreenProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenAttendance: () => void;
  onOpenReport: () => void;
  historyCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  theme,
  onToggleTheme,
  onOpenAttendance,
  onOpenReport,
  historyCount,
}) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px] opacity-40 dark:opacity-20" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-slate-200/70 bg-white/60 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight sm:text-base">Srusti MBA Console</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Attendance &amp; academic reports
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20 sm:inline-flex dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Private
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
              )}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <a
              href="/api/logout"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
              title="Lock this site"
            >
              <Lock className="h-3.5 w-3.5 text-rose-500" />
              <span className="hidden sm:inline">Lock</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-9 text-center sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/70 dark:text-slate-400 dark:ring-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Signed in · choose a workspace
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-[42px] sm:leading-[1.1]">
              What would you like to{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                open
              </span>
              ?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Build the daily attendance register, or review how the class is doing across the three AI
              assignments — section by section, student by student.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Attendance card */}
            <button
              type="button"
              onClick={onOpenAttendance}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-xl shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700 sm:p-7"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25">
                  <CheckSquare className="h-7 w-7" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                  Daily tool
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold tracking-tight">Attendance Register</h2>
              <p className="mt-1.5 text-[12.5px] leading-5 text-slate-600 dark:text-slate-400">
                Paste the WhatsApp present list and turn it into a colour-coded, grouped register — ready to
                print or export.
              </p>

              <ul className="mt-4 space-y-1.5 text-[11.5px] text-slate-600 dark:text-slate-400">
                {[
                  'Grid, sequence and table views',
                  'Duplicate & invalid roll detection',
                  'Export PNG, PDF and CSV',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {REPORT.class_size} students
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
                    {historyCount} saved
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm shadow-emerald-500/25 transition-transform group-hover:translate-x-0.5">
                  Open register
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>

            {/* Report card */}
            <button
              type="button"
              onClick={onOpenReport}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-xl shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 sm:p-7"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/25">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
                  Analysis
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold tracking-tight">Assignment Report</h2>
              <p className="mt-1.5 text-[12.5px] leading-5 text-slate-600 dark:text-slate-400">
                A student-level dashboard for the three assessments — submissions, missing names, quiz scores
                and every data discrepancy.
              </p>

              <ul className="mt-4 space-y-1.5 text-[11.5px] text-slate-600 dark:text-slate-400">
                {[
                  'Section & assessment breakdown',
                  'Students with nothing submitted',
                  'Export the dashboard as PNG or PDF',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                    222 responses
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    33 zero
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform group-hover:translate-x-0.5 dark:bg-indigo-500 dark:text-white">
                  View report
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          </div>

          <p className="mt-8 text-center text-[10.5px] text-slate-400 dark:text-slate-500">
            Data: {REPORT.class_size} students · 3 assessments · {REPORT.discrepancies.length} reconciled
            flags · generated {REPORT.generated_at}
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-200/70 py-4 text-center text-[10.5px] text-slate-400 dark:border-slate-800/80 dark:text-slate-500">
        Attendance Register &amp; Assignment Analytics · password protected
      </footer>
    </div>
  );
};
