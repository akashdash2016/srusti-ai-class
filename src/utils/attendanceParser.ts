import type {
  AttendanceSummary,
  ParseResult,
  StudentAttendance,
  StudentGroup,
} from '../types/attendance';
import { getStudentName } from './studentNames';

/**
 * Intelligent parser that extracts valid roll numbers from raw WhatsApp messages
 * or pasted text in any format (newline, comma, space, mixed).
 */
export function parseRollNumbers(
  rawInput: string,
  maxStudents: number = 52
): ParseResult {
  const validPresentRolls: number[] = [];
  const duplicates: number[] = [];
  const invalidEntries: { raw: string; reason: string }[] = [];
  
  if (!rawInput || !rawInput.trim()) {
    return { validPresentRolls: [], duplicates: [], invalidEntries: [] };
  }

  const seenSet = new Set<number>();

  // Tokenize by newlines, commas, spaces, tabs, semicolons
  // First, split into lines to filter out known WhatsApp headers cleanly if needed
  const lines = rawInput.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if line is purely non-numeric words (e.g. "Section C", "Present list")
    // If a token contains no numbers at all, we silently ignore general headers
    const tokens = trimmedLine.split(/[\s,;\t]+/);

    for (const token of tokens) {
      const cleanToken = token.trim();
      if (!cleanToken) continue;

      // If token is purely alphabetic or header text (e.g. "Section", "Present", "List", "C"), skip silently
      if (/^[a-zA-Z]+$/.test(cleanToken)) {
        continue;
      }

      // If token contains digits
      if (/\d/.test(cleanToken)) {
        // Attempt to parse float/int
        const numValue = Number(cleanToken);

        if (isNaN(numValue)) {
          invalidEntries.push({
            raw: cleanToken,
            reason: 'Not a valid numeric roll number',
          });
          continue;
        }

        if (!Number.isInteger(numValue)) {
          invalidEntries.push({
            raw: cleanToken,
            reason: 'Roll number must be a whole number',
          });
          continue;
        }

        if (numValue < 1 || numValue > maxStudents) {
          invalidEntries.push({
            raw: cleanToken,
            reason: `Roll number must be between 1 and ${maxStudents}`,
          });
          continue;
        }

        // Valid roll number check duplicates
        if (seenSet.has(numValue)) {
          if (!duplicates.includes(numValue)) {
            duplicates.push(numValue);
          }
        } else {
          seenSet.add(numValue);
          validPresentRolls.push(numValue);
        }
      } else {
        // Mixed weird symbols or invalid characters
        invalidEntries.push({
          raw: cleanToken,
          reason: 'Invalid text format',
        });
      }
    }
  }

  // Sort valid roll numbers ascending
  validPresentRolls.sort((a, b) => a - b);
  duplicates.sort((a, b) => a - b);

  return {
    validPresentRolls,
    duplicates,
    invalidEntries,
  };
}

/**
 * Generates the full attendance status list for Roll Numbers 1..maxStudents
 */
export function generateAttendanceList(
  presentRolls: number[],
  maxStudents: number = 52,
  section?: string
): StudentAttendance[] {
  const presentSet = new Set(presentRolls);
  const list: StudentAttendance[] = [];

  for (let roll = 1; roll <= maxStudents; roll++) {
    list.push({
      rollNumber: roll,
      name: section ? getStudentName(section, roll) : undefined,
      status: presentSet.has(roll) ? 'P' : 'A',
    });
  }

  return list;
}

/**
 * Groups full attendance list into blocks of N students (default 4)
 * e.g. 1-4, 5-8, 9-12, ..., 49-52
 */
export function groupAttendanceList(
  attendanceList: StudentAttendance[],
  groupSize: number = 4
): StudentGroup[] {
  const groups: StudentGroup[] = [];
  const total = attendanceList.length;

  if (total === 0) return groups;

  let groupIdx = 0;
  for (let i = 0; i < total; i += groupSize) {
    const chunk = attendanceList.slice(i, i + groupSize);
    const startRoll = chunk[0].rollNumber;
    const endRoll = chunk[chunk.length - 1].rollNumber;
    const sequenceString = chunk.map((s) => s.status).join(' ');

    groups.push({
      groupIndex: groupIdx++,
      startRoll,
      endRoll,
      students: chunk,
      sequenceString,
    });
  }

  return groups;
}

/**
 * Computes Attendance Summary metrics
 */
export function computeAttendanceSummary(
  presentRollsCount: number,
  maxStudents: number = 52
): AttendanceSummary {
  const totalStudents = maxStudents;
  const presentCount = presentRollsCount;
  const absentCount = Math.max(0, totalStudents - presentCount);
  const percentage =
    totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

  return {
    totalStudents,
    presentCount,
    absentCount,
    attendancePercentage: Number(percentage.toFixed(2)),
  };
}

/**
 * Helper to format date cleanly: "2026-09-25" -> "25 Sep 2026"
 */
export function formatDateReadable(dateStr: string): string {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00');
  if (isNaN(dateObj.getTime())) return dateStr;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}
