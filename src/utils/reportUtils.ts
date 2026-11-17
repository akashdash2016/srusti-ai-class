import rawReport from '../data/assignment_report.json';
import type {
  AssignmentId,
  AssignmentMeta,
  AssignmentReportData,
  AssignmentStat,
  CoverageStat,
  DiscrepancyKind,
  ReportStudent,
  SectionKey,
  SectionStat,
  StudentAssignmentStatus,
} from '../types/report';

export const REPORT = rawReport as unknown as AssignmentReportData;

export const SECTION_KEYS: SectionKey[] = ['A', 'B', 'C'];
export const ASSIGNMENT_IDS: AssignmentId[] = ['a1', 'a2', 'a3'];

export const SECTION_LABEL: Record<SectionKey, string> = {
  A: 'Section A',
  B: 'Section B',
  C: 'Section C',
};

/** Tailwind tokens used across the report for consistent section colouring. */
export const SECTION_STYLE: Record<
  SectionKey,
  { dot: string; text: string; soft: string; ring: string; bar: string; barSoft: string }
> = {
  A: {
    dot: 'bg-indigo-500',
    text: 'text-indigo-700',
    soft: 'bg-indigo-50',
    ring: 'ring-indigo-200',
    bar: 'bg-indigo-500',
    barSoft: 'bg-indigo-100',
  },
  B: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    soft: 'bg-amber-50',
    ring: 'ring-amber-200',
    bar: 'bg-amber-500',
    barSoft: 'bg-amber-100',
  },
  C: {
    dot: 'bg-teal-500',
    text: 'text-teal-700',
    soft: 'bg-teal-50',
    ring: 'ring-teal-200',
    bar: 'bg-teal-500',
    barSoft: 'bg-teal-100',
  },
};

export function getAssignmentMeta(id: AssignmentId): AssignmentMeta {
  const meta = REPORT.assignments.find((a) => a.id === id);
  if (!meta) throw new Error(`Unknown assignment: ${id}`);
  return meta;
}

export function statusOf(
  student: ReportStudent,
  id: AssignmentId
): StudentAssignmentStatus {
  return student[id];
}

export function sectionStudents(section: SectionKey | 'ALL'): ReportStudent[] {
  return section === 'ALL'
    ? REPORT.students
    : REPORT.students.filter((s) => s.section === section);
}

export function computeAssignmentStats(): Record<AssignmentId, AssignmentStat> {
  const result = {} as Record<AssignmentId, AssignmentStat>;
  for (const id of ASSIGNMENT_IDS) {
    const meta = getAssignmentMeta(id);
    const perSection = {} as Record<SectionKey, SectionStat>;
    let submitted = 0;
    let total = 0;
    for (const section of SECTION_KEYS) {
      const roster = sectionStudents(section);
      const sub = roster.filter((s) => statusOf(s, id).submitted).length;
      const stat: SectionStat = {
        section,
        submitted: sub,
        total: roster.length,
        missing: roster.length - sub,
        pct: roster.length ? (sub / roster.length) * 100 : 0,
      };
      perSection[section] = stat;
      submitted += sub;
      total += roster.length;
    }
    result[id] = {
      meta,
      perSection,
      submitted,
      missing: total - submitted,
      pct: total ? (submitted / total) * 100 : 0,
    };
  }
  return result;
}

export function computeCoverage(section: SectionKey | 'ALL'): CoverageStat {
  const students = sectionStudents(section);
  const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const s of students) counts[s.submittedCount as 0 | 1 | 2 | 3] += 1;
  return {
    section,
    total: students.length,
    all3: counts[3],
    two: counts[2],
    one: counts[1],
    none: counts[0],
  };
}

export function missingStudents(id: AssignmentId, section: SectionKey): ReportStudent[] {
  return sectionStudents(section).filter((s) => !statusOf(s, id).submitted);
}

export function zeroSubmissionStudents(section: SectionKey | 'ALL' = 'ALL'): ReportStudent[] {
  return sectionStudents(section).filter((s) => s.submittedCount === 0);
}

export function quizScores(section: SectionKey | 'ALL' = 'ALL'): number[] {
  return sectionStudents(section)
    .map((s) => s.a2.score)
    .filter((score): score is number => typeof score === 'number');
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function quizBuckets(section: SectionKey | 'ALL' = 'ALL') {
  const scores = quizScores(section);
  const bands = [
    { label: '10 / 10', short: '10', min: 10, max: 10 },
    { label: '9 / 10', short: '9', min: 9, max: 9 },
    { label: '8 / 10', short: '8', min: 8, max: 8 },
    { label: '≤ 7 / 10', short: '≤7', min: 0, max: 7 },
  ];
  return {
    total: scores.length,
    average: average(scores),
    fullMarks: scores.filter((s) => s === 10).length,
    bands: bands.map((b) => ({
      ...b,
      count: scores.filter((s) => s >= b.min && s <= b.max).length,
    })),
  };
}

export function discrepanciesByKind(kind: DiscrepancyKind) {
  return REPORT.discrepancies.filter((d) => d.kind === kind);
}

export function formatSubmittedAt(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function percentageColor(pct: number): { bg: string; text: string; ring: string } {
  if (pct >= 75) return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' };
  if (pct >= 50) return { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' };
  return { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200' };
}

export interface StudentFilter {
  section: SectionKey | 'ALL';
  coverage: 'ALL' | '3' | '2' | '1' | '0';
  query: string;
  sort: 'roll' | 'most' | 'least';
}

export function filterStudents(filter: StudentFilter): ReportStudent[] {
  const q = filter.query.trim().toLowerCase();
  const rows = sectionStudents(filter.section).filter((s) => {
    if (filter.coverage !== 'ALL' && String(s.submittedCount) !== filter.coverage) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.roll).includes(q) ||
      `${s.section}${s.roll}`.toLowerCase().includes(q)
    );
  });
  if (filter.sort === 'most') rows.sort((a, b) => b.submittedCount - a.submittedCount || a.roll - b.roll);
  else if (filter.sort === 'least') rows.sort((a, b) => a.submittedCount - b.submittedCount || a.roll - b.roll);
  else rows.sort((a, b) => a.section.localeCompare(b.section) || a.roll - b.roll);
  return rows;
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildReportCsv(): string {
  const header = [
    'Section',
    'Roll',
    'Student Name',
    'A1 — AI Assignment (21–30 Sep)',
    'A2 — AI Quiz Set 1 (5 Oct)',
    'A2 Score /10',
    'A3 — Assignment Submission (11–16 Nov)',
    'Assessments Submitted',
  ];
  const rows = REPORT.students.map((s) => [
    s.section,
    s.roll,
    s.name,
    s.a1.submitted ? 'Submitted' : 'Missing',
    s.a2.submitted ? 'Submitted' : 'Missing',
    s.a2.score ?? '',
    s.a3.submitted ? 'Submitted' : 'Missing',
    s.submittedCount,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
