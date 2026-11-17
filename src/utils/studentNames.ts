import sectionAStudents from '../data/section_A_students.json';
import sectionBStudents from '../data/section_B_students.json';
import sectionCStudents from '../data/section_C_students.json';

export interface StudentNameEntry {
  roll_no: number;
  name: string;
}

type SectionKey = 'A' | 'B' | 'C';

const SECTION_NAME_LISTS: Record<SectionKey, StudentNameEntry[]> = {
  A: sectionAStudents,
  B: sectionBStudents,
  C: sectionCStudents,
};

const SECTION_NAME_LOOKUPS: Record<SectionKey, Map<number, string>> = {
  A: new Map(sectionAStudents.map((s) => [s.roll_no, s.name])),
  B: new Map(sectionBStudents.map((s) => [s.roll_no, s.name])),
  C: new Map(sectionCStudents.map((s) => [s.roll_no, s.name])),
};

/**
 * Resolves any section label ("Section A", "A", "section-c", ...) to its
 * canonical key. Returns null for custom sections that have no name list.
 */
function getSectionKey(section: string): SectionKey | null {
  const match = section.trim().match(/(?:section[\s_-]*)?([a-c])$/i);
  if (!match) return null;
  return match[1].toUpperCase() as SectionKey;
}

/** Returns the student name for a section + roll number, if available. */
export function getStudentName(
  section: string,
  rollNumber: number
): string | undefined {
  const key = getSectionKey(section);
  if (!key) return undefined;
  return SECTION_NAME_LOOKUPS[key].get(rollNumber);
}

/** Returns the number of names available for a section. */
export function getSectionStudentCount(section: string): number {
  const key = getSectionKey(section);
  if (!key) return 0;
  return SECTION_NAME_LISTS[key].length;
}
