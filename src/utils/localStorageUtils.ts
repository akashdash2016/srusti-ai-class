import type { AttendanceRecord } from '../types/attendance';

const STORAGE_KEY = 'attendance_register_history_v1';

/**
 * Retrieves all saved attendance records from localStorage
 */
export function getSavedAttendanceRecords(): AttendanceRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as AttendanceRecord[];
    // Ensure sorted newest first
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to read attendance history from localStorage', error);
    return [];
  }
}

/**
 * Saves an attendance record to localStorage.
 */
export function saveAttendanceRecord(record: AttendanceRecord): AttendanceRecord[] {
  try {
    const current = getSavedAttendanceRecords();
    // Filter out if record with same date & section already exists to prevent duplicate entries
    const filtered = current.filter(
      (item) => !(item.date === record.date && item.section === record.section)
    );
    const updated = [record, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save attendance record to localStorage', error);
    return getSavedAttendanceRecords();
  }
}

/**
 * Deletes a record by ID
 */
export function deleteAttendanceRecord(id: string): AttendanceRecord[] {
  try {
    const current = getSavedAttendanceRecords();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to delete attendance record', error);
    return getSavedAttendanceRecords();
  }
}

/**
 * Clears all attendance records from localStorage
 */
export function clearAllAttendanceRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear attendance history', error);
  }
}
