import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Inbox,
  Trophy,
  UserX,
  Users,
} from 'lucide-react';
import {
  ASSIGNMENT_IDS,
  REPORT,
  SECTION_KEYS,
  SECTION_STYLE,
  computeAssignmentStats,
  computeCoverage,
  percentageColor,
  quizBuckets,
} from '../../utils/reportUtils';
import type { SectionKey } from '../../types/report';

const CARD = 'rounded-2xl border border-slate-200 bg-white p-5';

function SectionPill({ section }: { section: SectionKey }) {
  const style = SECTION_STYLE[section];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${style.soft} ${style.text} ${style.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      Section {section}
    </span>
  );
}

interface KpiProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: 'slate' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

function Kpi({ label, value, hint, icon, tone }: KpiProps) {
  const tones: Record<KpiProps['tone'], string> = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className={`rounded-xl p-2 ring-1 ${tones[tone]}`}>{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</p>
    </div>
  );
}

export const ReportSummary: React.FC = () => {
  const stats = computeAssignmentStats();
  const coverage = computeCoverage('ALL');
  const quiz = quizBuckets('ALL');

  const totalResponses = ASSIGNMENT_IDS.reduce((sum, id) => sum + stats[id].submitted, 0);
  const totalPossible = REPORT.class_size * ASSIGNMENT_IDS.length;
  const overallPct = (totalResponses / totalPossible) * 100;
  const worst = ASSIGNMENT_IDS.reduce((min, id) => (stats[id].pct < stats[min].pct ? id : min), ASSIGNMENT_IDS[0]);
  const best = ASSIGNMENT_IDS.reduce((max, id) => (stats[id].pct > stats[max].pct ? id : max), ASSIGNMENT_IDS[0]);

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          label="Class size"
          value={String(REPORT.class_size)}
          hint="Sections A · B · C on the roster"
          tone="slate"
          icon={<Users className="h-4 w-4" />}
        />
        <Kpi
          label="Responses"
          value={String(totalResponses)}
          hint={`of ${totalPossible} expected · ${overallPct.toFixed(1)}% overall`}
          tone="emerald"
          icon={<Inbox className="h-4 w-4" />}
        />
        <Kpi
          label="Submitted all 3"
          value={String(coverage.all3)}
          hint={`${Math.round((coverage.all3 / coverage.total) * 100)}% of the class is fully up to date`}
          tone="indigo"
          icon={<Trophy className="h-4 w-4" />}
        />
        <Kpi
          label="Zero submissions"
          value={String(coverage.none)}
          hint={`${Math.round((coverage.none / coverage.total) * 100)}% of the class has no response`}
          tone="rose"
          icon={<UserX className="h-4 w-4" />}
        />
        <Kpi
          label="Quiz average"
          value={quiz.average.toFixed(2)}
          hint={`out of 10 · ${quiz.total} appeared`}
          tone="amber"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Assignment × section table */}
      <section className={CARD}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submission by assessment</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Submitted students out of the full section roster. Colour reflects the completion rate.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥ 75%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> 50–74%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> &lt; 50%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-4 font-semibold">Assessment</th>
                {SECTION_KEYS.map((s) => (
                  <th key={s} className="px-2 pb-2 font-semibold">
                    Section {s}
                  </th>
                ))}
                <th className="px-2 pb-2 font-semibold">Total</th>
                <th className="pb-2 pl-2 text-right font-semibold">Missing</th>
              </tr>
            </thead>
            <tbody>
              {ASSIGNMENT_IDS.map((id) => {
                const stat = stats[id];
                const color = percentageColor(stat.pct);
                return (
                  <tr key={id} className="border-b border-slate-100 align-top last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-md bg-slate-900 px-1.5 text-[10px] font-bold text-white">
                          {stat.meta.code}
                        </span>
                        <div>
                          <div className="text-[13px] font-semibold leading-4 text-slate-900">
                            {stat.meta.shortTitle}
                          </div>
                          <div className="text-[11px] text-slate-500">{stat.meta.dateLabel}</div>
                        </div>
                      </div>
                    </td>
                    {SECTION_KEYS.map((s) => {
                      const cell = stat.perSection[s];
                      const c = percentageColor(cell.pct);
                      return (
                        <td key={s} className="px-2 py-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={`text-sm font-bold tabular-nums ${c.text}`}>
                              {cell.pct.toFixed(0)}%
                            </span>
                            <span className="text-[11px] text-slate-500 tabular-nums">
                              {cell.submitted}/{cell.total}
                            </span>
                          </div>
                          <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${c.bg}`}>
                            <div
                              className={`h-full rounded-full ${
                                cell.pct >= 75 ? 'bg-emerald-500' : cell.pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.max(2, cell.pct)}%` }}
                            />
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2 py-3">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-bold tabular-nums ${color.text}`}>
                          {stat.pct.toFixed(1)}%
                        </span>
                        <span className="text-[11px] text-slate-500 tabular-nums">
                          {stat.submitted}/{REPORT.class_size}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
                        {stat.missing}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            Best turnout: <strong className="text-slate-900">{stats[best].meta.shortTitle}</strong> ·{' '}
            {stats[best].pct.toFixed(1)}%
          </span>
          <span className="inline-flex items-center gap-2 sm:justify-end">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            Weakest turnout: <strong className="text-slate-900">{stats[worst].meta.shortTitle}</strong> ·{' '}
            {stats[worst].pct.toFixed(1)}%
          </span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
        {/* Coverage */}
        <section className={CARD}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">How many were submitted</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {coverage.total} students
            </span>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Out of three assessments, how many each student completed.
          </p>

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${(coverage.all3 / coverage.total) * 100}%` }} />
            <div className="bg-teal-400" style={{ width: `${(coverage.two / coverage.total) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(coverage.one / coverage.total) * 100}%` }} />
            <div className="bg-rose-400" style={{ width: `${(coverage.none / coverage.total) * 100}%` }} />
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              { label: 'All 3 submitted', count: coverage.all3, color: 'bg-emerald-500' },
              { label: '2 of 3', count: coverage.two, color: 'bg-teal-400' },
              { label: '1 of 3', count: coverage.one, color: 'bg-amber-400' },
              { label: 'None', count: coverage.none, color: 'bg-rose-400' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2.5 text-xs">
                <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                <span className="flex-1 text-slate-600">{row.label}</span>
                <span className="font-bold tabular-nums text-slate-900">{row.count}</span>
                <span className="w-10 text-right tabular-nums text-slate-500">
                  {Math.round((row.count / coverage.total) * 100)}%
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Section</th>
                  <th className="px-2 py-2 text-center font-semibold">3/3</th>
                  <th className="px-2 py-2 text-center font-semibold">2/3</th>
                  <th className="px-2 py-2 text-center font-semibold">1/3</th>
                  <th className="px-2 py-2 text-center font-semibold">0/3</th>
                </tr>
              </thead>
              <tbody>
                {SECTION_KEYS.map((s) => {
                  const row = computeCoverage(s);
                  return (
                    <tr key={s} className="border-t border-slate-100">
                      <td className="px-3 py-1.5">
                        <SectionPill section={s} />
                      </td>
                      <td className="px-2 py-1.5 text-center font-semibold tabular-nums text-emerald-700">{row.all3}</td>
                      <td className="px-2 py-1.5 text-center tabular-nums text-slate-700">{row.two}</td>
                      <td className="px-2 py-1.5 text-center tabular-nums text-slate-700">{row.one}</td>
                      <td className="px-2 py-1.5 text-center font-semibold tabular-nums text-rose-600">{row.none}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Heat map */}
        <section className={CARD}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Section heat map</h3>
            <span className="text-[11px] text-slate-500">completion rate</span>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Where each section stands on each assessment, and across all three.
          </p>

          <div className="grid grid-cols-[100px_repeat(4,minmax(0,1fr))] gap-1.5 text-center">
            <div />
            {ASSIGNMENT_IDS.map((id) => (
              <div key={id} className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {stats[id].meta.code}
              </div>
            ))}
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">All</div>

            {SECTION_KEYS.map((s) => {
              const sectionCoverage = computeCoverage(s);
              const sectionPct = ((sectionCoverage.all3 * 3 + sectionCoverage.two * 2 + sectionCoverage.one) / (sectionCoverage.total * 3)) * 100;
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center justify-start">
                    <SectionPill section={s} />
                  </div>
                  {ASSIGNMENT_IDS.map((id) => {
                    const cell = stats[id].perSection[s];
                    return (
                      <div
                        key={id}
                        className={`rounded-xl px-1 py-2.5 ring-1 ${heatClasses(cell.pct)}`}
                      >
                        <div className="text-base font-extrabold leading-5 tabular-nums">{cell.pct.toFixed(0)}%</div>
                        <div className="text-[10px] leading-3 opacity-70 tabular-nums">
                          {cell.submitted}/{cell.total}
                        </div>
                      </div>
                    );
                  })}
                  <div className={`rounded-xl px-1 py-2.5 ring-1 ${heatClasses(sectionPct)}`}>
                    <div className="text-base font-extrabold leading-5 tabular-nums">{sectionPct.toFixed(0)}%</div>
                    <div className="text-[10px] leading-3 opacity-70">
                      {sectionCoverage.all3 * 3 + sectionCoverage.two * 2 + sectionCoverage.one}/{sectionCoverage.total * 3}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-emerald-200" /> 75%+
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-teal-100" /> 60–74%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-amber-100" /> 45–59%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-rose-100" /> below 45%
            </span>
          </div>
        </section>
      </div>

      {/* Quiz performance */}
      <section className={CARD}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quiz performance — Set 1</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {quiz.total} students appeared · {quiz.fullMarks} perfect scores · class average{' '}
              <strong className="text-slate-800">{quiz.average.toFixed(2)}/10</strong>
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {Math.round((quiz.fullMarks / quiz.total) * 100)}% scored full marks
          </div>
        </div>

        <div className="space-y-3">
          {SECTION_KEYS.map((s) => {
            const q = quizBuckets(s);
            return (
              <div key={s} className="grid items-center gap-3 sm:grid-cols-[130px_1fr_180px]">
                <div className="flex items-center gap-2">
                  <SectionPill section={s} />
                  <span className="text-xs font-bold tabular-nums text-slate-900">{q.average.toFixed(2)}</span>
                </div>
                <div className="flex h-5 w-full overflow-hidden rounded-lg bg-slate-100">
                  {q.bands.map((b, i) => {
                    const colors = ['bg-emerald-500', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400'];
                    return (
                      <div
                        key={b.label}
                        className={colors[i]}
                        style={{ width: `${q.total ? (b.count / q.total) * 100 : 0}%` }}
                        title={`${b.label}: ${b.count}`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                  {q.bands.map((b, i) => (
                    <span
                      key={b.label}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ring-1 ${
                        ['bg-emerald-50 text-emerald-700 ring-emerald-200', 'bg-teal-50 text-teal-700 ring-teal-200', 'bg-amber-50 text-amber-700 ring-amber-200', 'bg-rose-50 text-rose-700 ring-rose-200'][i]
                      }`}
                    >
                      {b.short} · {b.count}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500 sm:grid-cols-4">
          {[10, 9, 8, 7].map((band, i) => {
            const colors = ['bg-emerald-500', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400'];
            return (
              <span key={band} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${colors[i]}`} />
                {band === 7 ? '≤ 7' : band} / 10
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
};

function heatClasses(pct: number): string {
  if (pct >= 75) return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
  if (pct >= 60) return 'bg-teal-50 text-teal-800 ring-teal-200';
  if (pct >= 45) return 'bg-amber-50 text-amber-800 ring-amber-200';
  return 'bg-rose-50 text-rose-800 ring-rose-200';
}
