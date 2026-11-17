import React from 'react';
import { CalendarDays, ClipboardList, UserX } from 'lucide-react';
import {
  ASSIGNMENT_IDS,
  REPORT,
  SECTION_KEYS,
  SECTION_STYLE,
  computeAssignmentStats,
  getAssignmentMeta,
  missingStudents,
  zeroSubmissionStudents,
} from '../../utils/reportUtils';
import type { SectionKey } from '../../types/report';

const CARD = 'rounded-2xl border border-slate-200 bg-white p-5';

function SectionTag({ section, count }: { section: SectionKey; count: number }) {
  const style = SECTION_STYLE[section];
  return (
    <div className="flex items-center justify-between">
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${style.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        Section {section}
      </span>
      <span className="text-[11px] font-semibold tabular-nums text-slate-500">{count} missing</span>
    </div>
  );
}

export const ReportAttention: React.FC = () => {
  const zero = zeroSubmissionStudents('ALL');
  const stats = computeAssignmentStats();

  return (
    <div className="space-y-6">
      {/* Zero submissions */}
      <section className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200/80 bg-rose-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-rose-100 p-2.5 text-rose-700 ring-1 ring-rose-200">
              <UserX className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">No submissions at all</h3>
              <p className="text-xs text-slate-600">
                These students have not responded to any of the three assessments. Follow-up needed.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white tabular-nums">
            {zero.length} students · {Math.round((zero.length / REPORT.class_size) * 100)}%
          </span>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          {SECTION_KEYS.map((s) => {
            const rows = zeroSubmissionStudents(s);
            return (
              <div key={s} className="rounded-xl border border-rose-200/70 bg-white p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${SECTION_STYLE[s].text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${SECTION_STYLE[s].dot}`} />
                    Section {s}
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 tabular-nums">
                    {rows.length}
                  </span>
                </div>
                {rows.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Everyone has submitted at least once.</p>
                ) : (
                  <ul className="space-y-1">
                    {rows.map((student) => (
                      <li key={student.roll} className="flex items-baseline gap-2 text-[11.5px] leading-5">
                        <span className="w-5 shrink-0 text-right font-mono text-[10px] text-slate-400 tabular-nums">
                          {String(student.roll).padStart(2, '0')}
                        </span>
                        <span className="text-slate-800">{student.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Missing per assessment */}
      <section className={CARD}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Missing by assessment</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Every student with no response for that assessment, grouped by section and matched to the roster.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            <ClipboardList className="h-3.5 w-3.5" />
            {stats.a1.missing + stats.a2.missing + stats.a3.missing} total missing entries
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {ASSIGNMENT_IDS.map((id) => {
            const meta = getAssignmentMeta(id);
            const totalMissing = stats[id].missing;
            return (
              <div key={id} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-md bg-slate-900 px-1.5 text-[10px] font-bold text-white">
                        {meta.code}
                      </span>
                      <span className="text-[13px] font-bold leading-4 text-slate-900">{meta.shortTitle}</span>
                    </div>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 tabular-nums">
                      {totalMissing} missing
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {meta.dateLabel}
                  </div>
                </div>

                <div className="flex-1 divide-y divide-slate-200/80">
                  {SECTION_KEYS.map((s) => {
                    const rows = missingStudents(id, s);
                    return (
                      <div key={s} className="px-4 py-2.5">
                        <SectionTag section={s} count={rows.length} />
                        {rows.length === 0 ? (
                          <p className="mt-1 text-[11px] text-emerald-600">All present.</p>
                        ) : (
                          <p className="mt-1 text-[11px] leading-5 text-slate-700">
                            {rows.map((student, index) => (
                              <React.Fragment key={student.roll}>
                                {index > 0 && <span className="mx-1 text-slate-300">·</span>}
                                <span className="inline-block">
                                  <strong className="font-semibold text-slate-900 tabular-nums">{student.roll}</strong>{' '}
                                  {student.name}
                                </span>
                              </React.Fragment>
                            ))}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
