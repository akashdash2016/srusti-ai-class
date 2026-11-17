export type SectionName = 'Section A' | 'Section B' | 'Section C' | string;

export type AttendanceStatus = 'P' | 'A';

export interface StudentAttendance {
  rollNumber: number;
  name?: string;
  status: AttendanceStatus;
}

export interface StudentGroup {
  groupIndex: number;
  startRoll: number;
  endRoll: number;
  students: StudentAttendance[];
  sequenceString: string; // e.g. "P P A P"
}

export interface ParseResult {
  validPresentRolls: number[];
  duplicates: number[];
  invalidEntries: {
    raw: string;
    reason: string;
  }[];
}

export interface AttendanceSummary {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface AttendanceRecord {
  id: string;
  timestamp: number;
  date: string; // e.g. "2026-09-25"
  formattedDate: string; // e.g. "25 Sep 2026"
  section: SectionName;
  maxStudents: number;
  groupSize: number;
  rawInput: string;
  presentRolls: number[];
  summary: AttendanceSummary;
}

export type ViewMode = 'grid' | 'sequence' | 'table';
export type LayoutOrientation = 'horizontal' | 'vertical';
