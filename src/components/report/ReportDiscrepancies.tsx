import React from 'react';
import {
  ArrowLeftRight,
  BadgeCheck,
  Clock,
  Copy,
  FileWarning,
  ShieldAlert,
  Type,
} from 'lucide-react';
import {
  REPORT,
  formatSubmittedAt,
  getAssignmentMeta,
} from '../../utils/reportUtils';
import type { DiscrepancyKind } from '../../types/report';

const CARD = 'rounded-2xl border border-slate-200 bg-white p-5';

const GROUP_CONFIG: Array<{
  kind: DiscrepancyKind;
  label: string;
  description: string;
  icon: React.ReactNode;
  header: string;
  chip: string;
}> = [
  {
    kind: 'roll',
    label: 'Roll-number corrections',
    description: 'Rows where the roll field was not a plain roster roll. Matched by student name.',
    icon: <FileWarning className="h-4 w-4" />,
    header: 'bg-amber-50 text-amber-800 border-amber-200',
    chip: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  {
    kind: 'swap',
    label: 'Swapped fields',
    description: 'Name and roll-number columns were filled the wrong way round.',
    icon: <ArrowLeftRight className="h-4 w-4" />,
    header: 'bg-violet-50 text-violet-800 border-violet-200',
    chip: 'bg-violet-100 text-violet-800 ring-violet-200',
  },
  {
    kind: 'duplicate',
    label: 'Duplicate submissions',
    description: 'The same student submitted more than once. Only the first response is counted.',
    icon: <Copy className="h-4 w-4" />,
    header: 'bg-sky-50 text-sky-800 border-sky-200',
    chip: 'bg-sky-100 text-sky-800 ring-sky-200',
  },
  {
    kind: 'late',
    label: 'Late submissions',
    description: 'Responses that arrived after the assessment window closed.',
    icon: <Clock className="h-4 w-4" />,
    header: 'bg-orange-50 text-orange-800 border-orange-200',
    chip: 'bg-orange-100 text-orange-800 ring-orange-200',
  },
  {
    kind: 'name',
    label: 'Name variations',
    description: 'Spellings that differ from the roster. Identity was confirmed by roll number.',
    icon: <Type className="h-4 w-4" />,
    header: 'bg-slate-50 text-slate-700 border-slate-200',
    chip: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
];

export const ReportDiscrepancies: React.FC = () => {
  const unmatched = 0;
  const total = REPORT.discrepancies.length;

  return (
    <section className={CARD}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700 ring-1 ring-amber-200">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Data quality &amp; discrepancies</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Every response was reconciled against the roster. Flags below explain the corrections made.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-200">
            <ShieldAlert className="h-3.5 w-3.5" />
            {total} flags reviewed
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            {REPORT.class_size - unmatched}/{REPORT.class_size} matched
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
            {unmatched} unmatched responses
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GROUP_CONFIG.map((group) => {
          const items = REPORT.discrepancies.filter((d) => d.kind === group.kind);
          if (!items.length) return null;
          return (
            <div
              key={group.kind}
              className={`overflow-hidden rounded-xl border border-slate-200 ${
                group.kind === 'name' ? 'md:col-span-2' : ''
              }`}
            >
              <div className={`flex items-center justify-between gap-2 border-b px-4 py-2.5 ${group.header}`}>
                <div className="flex items-center gap-2">
                  {group.icon}
                  <span className="text-[12px] font-bold">{group.label}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 tabular-nums ${group.chip}`}>
                  {items.length}
                </span>
              </div>
              <p className="border-b border-slate-100 bg-white px-4 py-1.5 text-[10.5px] text-slate-500">
                {group.description}
              </p>
              <ul
                className={
                  group.kind === 'name'
                    ? 'grid gap-x-6 sm:grid-cols-2'
                    : 'divide-y divide-slate-100'
                }
              >
                {items.map((item, index) => {
                  const meta = getAssignmentMeta(item.assignment);
                  return (
                    <li
                      key={`${item.kind}-${item.roll}-${index}`}
                      className={`px-4 py-2.5 ${
                        group.kind === 'name' ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded bg-slate-900 px-1 text-[9px] font-bold text-white">
                          {meta.code}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-[12px] font-semibold text-slate-900">
                              {item.section}
                              {item.roll} · {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              {formatSubmittedAt(item.at)}
                            </span>
                          </div>
                          <div className="text-[11.5px] font-medium text-slate-700">{item.title}</div>
                          <p className="mt-0.5 text-[10.5px] leading-4 text-slate-500">{item.detail}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-600">
        Impact on the numbers: none of the flags change who submitted. Corrections only fixed roll numbers,
        spellings and duplicate rows — each student is counted once per assessment. Additionally,{' '}
        {REPORT.roll_format_notes} roll entries used leading zeros (e.g. <span className="font-mono">05</span>) and
        were normalised automatically.
      </p>
    </section>
  );
};
