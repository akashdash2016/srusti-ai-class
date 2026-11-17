import React, { useState } from 'react';
import {
  Copy,
  FileImage,
  FileText,
  FileSpreadsheet,
  Check,
  UserX,
  Share2,
} from 'lucide-react';
import type { AttendanceRecord, StudentAttendance, StudentGroup } from '../types/attendance';
import type { Theme } from './Header';
import {
  copyToClipboard,
  exportToCSV,
  exportToPDF,
  exportToPNG,
  generateAbsenteeListString,
  generateRegisterFormatString,
  generateSequenceString,
} from '../utils/exportUtils';

interface ExportToolbarProps {
  record: AttendanceRecord;
  groups: StudentGroup[];
  attendanceList: StudentAttendance[];
  targetElementId: string;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  theme: Theme;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  record,
  groups,
  attendanceList,
  targetElementId,
  onShowToast,
  theme,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleCopySequence = async () => {
    const seqStr = generateSequenceString(groups);
    const success = await copyToClipboard(seqStr);
    if (success) {
      setCopiedType('seq');
      onShowToast('Copied attendance sequence to clipboard!');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyRegister = async () => {
    const regStr = generateRegisterFormatString(groups);
    const success = await copyToClipboard(regStr);
    if (success) {
      setCopiedType('reg');
      onShowToast('Copied register format to clipboard!');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyAbsentees = async () => {
    const absStr = generateAbsenteeListString(
      attendanceList,
      record.section,
      record.formattedDate
    );
    const success = await copyToClipboard(absStr);
    if (success) {
      setCopiedType('abs');
      onShowToast('Copied absentee list to clipboard!');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleExportPNG = async () => {
    setIsExporting('PNG');
    onShowToast('Generating high-resolution PNG register image...', 'info');
    const filename = `Attendance_${record.section.replace(/\s+/g, '_')}_${record.date}.png`;
    const success = await exportToPNG(
      targetElementId,
      filename,
      theme === 'dark' ? '#0f172a' : '#ffffff'
    );
    setIsExporting(null);
    if (success) {
      onShowToast('Downloaded PNG Attendance Register!', 'success');
    } else {
      onShowToast('Failed to export PNG. Please try again.', 'error');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting('PDF');
    onShowToast('Generating printable Landscape PDF document...', 'info');
    const filename = `Attendance_${record.section.replace(/\s+/g, '_')}_${record.date}.pdf`;
    const success = await exportToPDF(targetElementId, filename, record);
    setIsExporting(null);
    if (success) {
      onShowToast('Downloaded Printable PDF Attendance Register!', 'success');
    } else {
      onShowToast('Failed to export PDF. Please try again.', 'error');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(record, attendanceList);
    onShowToast('Downloaded CSV Attendance Data!', 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
      
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Export & Copy Tools
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Fast export options for physical registers & messaging
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* COPY SEQUENCE */}
        <button
          onClick={handleCopySequence}
          type="button"
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-medium text-xs transition-all shadow-sm cursor-pointer"
        >
          {copiedType === 'seq' ? (
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          )}
          <span>{copiedType === 'seq' ? 'Copied Sequence!' : 'Copy Sequence'}</span>
        </button>

        {/* COPY REGISTER FORMAT */}
        <button
          onClick={handleCopyRegister}
          type="button"
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-medium text-xs transition-all shadow-sm cursor-pointer"
        >
          {copiedType === 'reg' ? (
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          )}
          <span>{copiedType === 'reg' ? 'Copied Register!' : 'Copy Register Format'}</span>
        </button>

        {/* COPY ABSENTEE LIST */}
        <button
          onClick={handleCopyAbsentees}
          type="button"
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-medium text-xs transition-all shadow-sm cursor-pointer"
        >
          {copiedType === 'abs' ? (
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span>{copiedType === 'abs' ? 'Copied Absentees!' : 'Copy Absentee List'}</span>
        </button>

        {/* EXPORT PNG */}
        <button
          onClick={handleExportPNG}
          disabled={isExporting !== null}
          type="button"
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <FileImage className="w-4 h-4" />
          <span>{isExporting === 'PNG' ? 'Exporting PNG...' : '↓ Export PNG'}</span>
        </button>

        {/* EXPORT PDF */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting !== null}
          type="button"
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>{isExporting === 'PDF' ? 'Exporting PDF...' : '↓ Export PDF'}</span>
        </button>

        {/* EXPORT CSV */}
        <button
          onClick={handleExportCSV}
          type="button"
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold text-xs shadow-md shadow-green-600/20 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>↓ Export CSV</span>
        </button>

      </div>

    </div>
  );
};
