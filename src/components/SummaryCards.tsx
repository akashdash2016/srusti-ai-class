import React from 'react';
import { Users, CheckCircle2, XCircle, Percent } from 'lucide-react';
import type { AttendanceSummary } from '../types/attendance';

interface SummaryCardsProps {
  summary: AttendanceSummary;
  formattedDate: string;
  section: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  formattedDate,
  section,
}) => {
  const { totalStudents, presentCount, absentCount, attendancePercentage } = summary;

  // Determine attendance status badge color
  let pctColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (attendancePercentage < 60) {
    pctColor = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (attendancePercentage < 75) {
    pctColor = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="space-y-3">
      
      {/* Subheader info line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-1 pb-1 px-1">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Attendance Record Summary for <strong className="text-slate-900 dark:text-white">{section}</strong>
        </span>
        <span>Date: <strong className="text-slate-800 dark:text-slate-200">{formattedDate}</strong></span>
      </div>

      {/* Grid of 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Students */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Class
            </span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalStudents}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Roll 1 to {totalStudents}</p>
          </div>
        </div>

        {/* Present Count */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Present
            </span>
            <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {presentCount}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/70 mt-0.5">Students Present</p>
          </div>
        </div>

        {/* Absent Count */}
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Absent
            </span>
            <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/30">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {absentCount}
            </div>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 mt-0.5">Students Absent</p>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className={`border rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden group transition-all ${pctColor}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Attendance
            </span>
            <div className="p-2 bg-white/60 dark:bg-slate-900/40 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {attendancePercentage}%
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {attendancePercentage >= 75 ? 'Good Attendance' : 'Low Attendance'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
