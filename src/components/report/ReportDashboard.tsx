import React from 'react';
import { CalendarDays, GraduationCap } from 'lucide-react';
import { ReportSummary } from './ReportSummary';
import { ReportAttention } from './ReportAttention';
import { ReportDiscrepancies } from './ReportDiscrepancies';
import { ReportStudentTable } from './ReportStudentTable';
import { REPORT, formatDate, getAssignmentMeta } from '../../utils/reportUtils';

interface ReportDashboardProps {
  elementId: string;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ elementId }) => {
  const a1 = getAssignmentMeta('a1');
  const a2 = getAssignmentMeta('a2');
  const a3 = getAssignmentMeta('a3');

  return (
    <article
      id={elementId}
      className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/10"
    >
      <header className="relative overflow-hidden bg-slate-900 px-6 py-7 text-white sm:px-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300 ring-1 ring-white/15">
              <GraduationCap className="h-3.5 w-3.5" />
              Srusti MBA · Academic Report
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-[32px] sm:leading-9">
              Assignment &amp; Quiz Performance
            </h1>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-slate-300">
              Section-wise submission tracking for three assessments, matched student-by-student against the
              roster. Includes quiz scores, missing lists, zero-submission follow-ups and a data-quality audit.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur">
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <CalendarDays className="h-3 w-3" />
              Generated
            </div>
            <div className="mt-1 text-sm font-bold text-white">{formatDate(REPORT.generated_at)}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              {REPORT.class_size} students · Sections A, B, C
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-2 sm:grid-cols-3">
          {[a1, a2, a3].map((a) => {
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5"
              >
                <span className="inline-flex h-7 min-w-9 items-center justify-center rounded-lg bg-emerald-400 px-1.5 text-[10px] font-black text-slate-950">
                  {a.code}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold text-white">{a.shortTitle}</div>
                  <div className="text-[10.5px] text-slate-400">
                    {a.dateLabel} · {a.distinctCount}/{REPORT.class_size} submitted
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      <div className="space-y-6 bg-slate-50/70 p-5 sm:p-7 lg:p-8">
        <ReportSummary />
        <ReportAttention />
        <ReportDiscrepancies />
        <ReportStudentTable />

        <footer className="rounded-2xl border border-slate-200 bg-white p-5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            How this report was calculated
          </h4>
          <div className="mt-2 grid gap-x-6 gap-y-1.5 text-[11px] leading-5 text-slate-600 sm:grid-cols-2">
            <p>
              <strong className="text-slate-800">Roster:</strong> section_A (50), section_B (51) and section_C
              (53) student JSON files · {REPORT.class_size} students.
            </p>
            <p>
              <strong className="text-slate-800">Matching:</strong> each form response was matched on section +
              roll number; invalid or swapped rolls were resolved by student name.
            </p>
            <p>
              <strong className="text-slate-800">Counting:</strong> one submission per student per assessment.
              Duplicate form entries were counted once using the earliest response.
            </p>
            <p>
              <strong className="text-slate-800">Sources:</strong> three Google Forms exports (A1: 72 rows, A2:
              91 rows, A3: 62 rows) · quiz scores read from the form's score column.
            </p>
          </div>
          <p className="mt-3 border-t border-slate-100 pt-2.5 text-[10.5px] text-slate-400">
            Srusti MBA attendance console · assignment report · {REPORT.discrepancies.length} data-quality
            flags reviewed · {REPORT.roll_format_notes} roll formats normalised.
          </p>
        </footer>
      </div>
    </article>
  );
};
