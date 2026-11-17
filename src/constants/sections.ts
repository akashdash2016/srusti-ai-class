import type { SectionName } from '../types/attendance';

/** Preset sections shown in the section dropdown */
export const SECTION_OPTIONS: SectionName[] = [
  'Section A',
  'Section B',
  'Section C',
];

/** Default total student roll count for each preset section */
export const SECTION_DEFAULT_STUDENTS: Record<string, number> = {
  'Section A': 50,
  'Section B': 51,
  'Section C': 53,
};

export const DEFAULT_SECTION: SectionName = 'Section C';

export const DEFAULT_MAX_STUDENTS: number =
  SECTION_DEFAULT_STUDENTS[DEFAULT_SECTION] ?? 53;

/** Returns the default roll count for a section, or undefined for custom sections */
export function getSectionDefaultStudents(
  section: SectionName
): number | undefined {
  return SECTION_DEFAULT_STUDENTS[section];
}
