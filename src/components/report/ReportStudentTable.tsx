import React, { useMemo, useState } from 'react';
import { Check, Filter, Minus, Search, SlidersHorizontal, Users } from 'lucide-react';
import {
  REPORT,
  SECTION_KEYS,
  SECTION_STYLE,
  computeAssignmentStats,
  filterStudents,
  formatSubmittedAt,
  getAssignmentMeta,
} from '../../utils/reportUtils';
import type { AssignmentId, ReportStudent, SectionKey } from '../../types/report';
import type { StudentAssignmentStatus } from '../../types/report';

const CARD = 'rounded-2xl border border-slate-200 bg-white p-5';

function StatusCell({ status, id }: { status: StudentAssignmentStatus; id: AssignmentId }) {
  if (!status.submitted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-600 ring-1 ring-rose-200">
        <Minus className="h-3 w-3" />
        Missing
      </span>
    );
  }

  if (id === 'a2' && typeof status.score === 'number') {
    const tone =
      status.score >= 9
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
        : status.score >= 7
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-orange-50 text-orange-700 ring-orange-200';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ${tone}`}
        title={`Submitted ${formatSubmittedAt(status.at)}`}
      >
        <Check className="h-3 w-3" />
        {status.score}/10
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
      title={`Submitted ${formatSubmittedAt(status.at)}`}
    >
      <Check className="h-3 w-3" />
      Yes
    </span>
  );
}

function CoverageDots({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < count ? 'bg-emerald-500' : 'bg-slate-200'}`}
        />
      ))}
      <span className="ml-1 w-6 text-[10.5px] font-semibold tabular-nums text-slate-600">{count}/3</span>
    </div>
  );
}

function StudentRow({ student }: { student: ReportStudent }) {
  const section = SECTION_STYLE[student.section];
  const zero = student.submittedCount === 0;
  return (
    <tr
      className={
        zero
          ? 'bg-rose-50/60'
          : student.submittedCount === 3
            ? 'bg-emerald-50/30'
            : 'bg-white'
      }
    >
      <td className="whitespace-nowrap px-3 py-1.5">
        <span className={`inline-flex min-w-7 items-center justify-center rounded-md px-1 py-0.5 text-[10px] font-bold ring-1 ${section.soft} ${section.text} ${section.ring}`}>
          {student.section}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono text-[10.5px] text-slate-500 tabular-nums">
        {String(student.roll).padStart(2, '0')}
      </td>
      <td className="px-2 py-1.5 text-[12px] font-medium text-slate-900">{student.name}</td>
      <td className="px-2 py-1.5"><StatusCell status={student.a1} id="a1" /></td>
      <td className="px-2 py-1.5"><StatusCell status={student.a2} id="a2" /></td>
      <td className="px-2 py-1.5"><StatusCell status={student.a3} id="a3" /></td>
      <td className="px-3 py-1.5"><CoverageDots count={student.submittedCount} /></td>
    </tr>
  );
}

export const ReportStudentTable: React.FC = () => {
  const [section, setSection] = useState<SectionKey | 'ALL'>('ALL');
  const [coverage, setCoverage] = useState<'ALL' | '3' | '2' | '1' | '0'>('ALL');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'roll' | 'most' | 'least'>('roll');

  const rows = useMemo(
    () => filterStudents({ section, coverage, query, sort }),
    [section, coverage, query, sort]
  );

  const total = section === 'ALL' ? REPORT.students.length : REPORT.students.filter((s) => s.section === section).length;
  const stats = computeAssignmentStats();

  const coverageLabel =
    coverage === 'ALL'
      ? 'all submission levels'
      : coverage === '0'
        ? 'students with no submissions'
        : `students with exactly ${coverage} of 3 submitted`;

  return (
    <section className={CARD}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Student register</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Names matched to the section roster JSON. {REPORT.class_size} students across three sections.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Users className="h-3.5 w-3.5" />
            {REPORT.class_size} students
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">
            <Check className="h-3.5 w-3.5" />
            {stats.a1.submitted + stats.a2.submitted + stats.a3.submitted} responses
          </span>
        </div>
      </div>

      {/* Interactive controls — excluded from PNG/PDF captures */}
      <div
        data-export-ignore="true"
        className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5"
      >
        <div className="flex items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-slate-200">
          {(['ALL', ...SECTION_KEYS] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                section === s
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s === 'ALL' ? 'All' : `Section ${s}`}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={coverage}
            onChange={(e) => setCoverage(e.target.value as typeof coverage)}
            className="bg-transparent text-[11px] font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All submission levels</option>
            <option value="3">3 of 3 submitted</option>
            <option value="2">2 of 3 submitted</option>
            <option value="1">1 of 3 submitted</option>
            <option value="0">0 of 3 — no submissions</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-transparent text-[11px] font-medium text-slate-700 outline-none"
          >
            <option value="roll">Roll order</option>
            <option value="least">Fewest submissions first</option>
            <option value="most">Most submissions first</option>
          </select>
        </label>

        <div className="ml-auto inline-flex min-w-[190px] flex-1 items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 ring-1 ring-slate-200 sm:flex-none">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or roll…"
            className="w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Export-safe summary of the active filter */}
      <p className="mb-2 text-[11px] text-slate-500">
        Showing <strong className="text-slate-800">{rows.length}</strong> of {total} students
        {section !== 'ALL' ? ` in Section ${section}` : ''} · {coverageLabel}
        {query.trim() ? ` · search: “${query.trim()}”` : ''}.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-semibold">Sec</th>
              <th className="px-2 py-2 text-right font-semibold">Roll</th>
              <th className="px-2 py-2 font-semibold">Student name</th>
              <th className="px-2 py-2 font-semibold" title={getAssignmentMeta('a1').title}>
                A1 · Sep
              </th>
              <th className="px-2 py-2 font-semibold" title={getAssignmentMeta('a2').title}>
                A2 · Quiz
              </th>
              <th className="px-2 py-2 font-semibold" title={getAssignmentMeta('a3').title}>
                A3 · Nov
              </th>
              <th className="px-3 py-2 text-center font-semibold">Done</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((student) => (
              <StudentRow key={`${student.section}-${student.roll}`} student={student} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-500">
                  No students match these filters.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 text-[10.5px] font-semibold text-slate-700">
              <td className="px-3 py-2" colSpan={3}>
                Submitted · {REPORT.class_size} students in the roster
              </td>
              <td className="px-2 py-2 tabular-nums">
                {stats.a1.submitted}/{stats.a1.submitted + stats.a1.missing}
              </td>
              <td className="px-2 py-2 tabular-nums">
                {stats.a2.submitted}/{stats.a2.submitted + stats.a2.missing}
              </td>
              <td className="px-2 py-2 tabular-nums">
                {stats.a3.submitted}/{stats.a3.submitted + stats.a3.missing}
              </td>
              <td className="px-3 py-2 text-center tabular-nums">
                {stats.a1.submitted + stats.a2.submitted + stats.a3.submitted} responses
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Submitted
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Missing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-emerald-50 ring-1 ring-emerald-200" /> All three complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-rose-50 ring-1 ring-rose-200" /> No submissions
        </span>
        <span>Quiz cell shows the score out of 10 (A2).</span>
      </div>
    </section>
  );
};
