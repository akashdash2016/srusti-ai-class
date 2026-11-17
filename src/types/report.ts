export type AssignmentId = 'a1' | 'a2' | 'a3';
export type SectionKey = 'A' | 'B' | 'C';
export type AssignmentKind = 'assignment' | 'quiz';

export interface AssignmentMeta {
  id: AssignmentId;
  code: string;
  kind: AssignmentKind;
  title: string;
  shortTitle: string;
  dateLabel: string;
  windowStart: string;
  windowEnd: string;
  responseCount: number;
  distinctCount: number;
  totalMarks: number | null;
}

export interface StudentAssignmentStatus {
  submitted: boolean;
  at?: string;
  score?: number;
  flags: string[];
}

export interface ReportStudent {
  section: SectionKey;
  roll: number;
  name: string;
  submittedCount: number;
  a1: StudentAssignmentStatus;
  a2: StudentAssignmentStatus;
  a3: StudentAssignmentStatus;
}

export type DiscrepancyKind = 'roll' | 'name' | 'duplicate' | 'swap' | 'late';
export type DiscrepancySeverity = 'high' | 'medium' | 'low';

export interface Discrepancy {
  assignment: AssignmentId;
  section: SectionKey;
  roll: number;
  name: string;
  kind: DiscrepancyKind;
  severity: DiscrepancySeverity;
  at: string;
  title: string;
  detail: string;
}

export interface AssignmentReportData {
  generated_at: string;
  class_size: number;
  roll_format_notes: number;
  assignments: AssignmentMeta[];
  students: ReportStudent[];
  discrepancies: Discrepancy[];
}

export interface SectionStat {
  section: SectionKey;
  submitted: number;
  total: number;
  missing: number;
  pct: number;
}

export interface AssignmentStat {
  meta: AssignmentMeta;
  perSection: Record<SectionKey, SectionStat>;
  submitted: number;
  missing: number;
  pct: number;
}

export interface CoverageStat {
  section: SectionKey | 'ALL';
  total: number;
  all3: number;
  two: number;
  one: number;
  none: number;
}
