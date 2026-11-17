import React from 'react';
import { Check, X } from 'lucide-react';
import type { StudentGroup, LayoutOrientation } from '../types/attendance';

interface AttendanceGridProps {
  groups: StudentGroup[];
  section: string;
  formattedDate: string;
  orientation?: LayoutOrientation;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  groups,
  section,
  formattedDate,
  orientation = 'vertical',
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div className="space-y-4">
      
      {/* Register Title Header inside exportable container */}
      <div className="text-center py-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide uppercase">
          ATTENDANCE REGISTER — {section}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Date: {formattedDate} | Total Blocks: {groups.length} (4 Students per block, {isVertical ? 'Vertical Stack' : 'Horizontal Row'})
        </p>
      </div>

      {/* Grid of Group Blocks */}
      <div
        className={`grid gap-4 ${
          isVertical
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {groups.map((group) => (
          <div
            key={group.groupIndex}
            className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md space-y-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                Rolls {group.startRoll}–{group.endRoll}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 dark:bg-slate-950 px-2 rounded-lg border border-slate-200 dark:border-slate-800 py-0.5">
                <span className="text-slate-500 font-sans text-[10px] uppercase">Seq:</span>
                <span className="font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                  {group.sequenceString}
                </span>
              </div>
            </div>

            {/* 4-Student Cell Layout (Vertical Stack or Horizontal Row) */}
            {isVertical ? (
              /* VERTICAL STACK of 4 Students */
              <div className="flex flex-col gap-2">
                {group.students.map((student) => {
                  const isPresent = student.status === 'P';
                  return (
                    <div
                      key={student.rollNumber}
                      className={`rounded-xl px-3 py-2 flex items-center justify-between gap-2 transition-all border shadow-sm ${
                        isPresent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-900 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                          Roll
                        </span>
                        <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white shrink-0">
                          {student.rollNumber}
                        </span>
                        <span
                          className="min-w-0 text-xs font-medium leading-snug text-slate-700 dark:text-slate-200 break-words"
                          title={student.name ?? 'Name not available'}
                        >
                          {student.name ?? '—'}
                        </span>
                      </div>

                      {/* Status Pill */}
                      <div
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs font-black tracking-wider shrink-0 ${
                          isPresent
                            ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                            : 'bg-rose-500 text-slate-950 shadow-sm shadow-rose-500/30'
                        }`}
                      >
                        {isPresent ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>P</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>A</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* HORIZONTAL ROW of 4 Students */
              <div className="grid grid-cols-4 gap-2">
                {group.students.map((student) => {
                  const isPresent = student.status === 'P';
                  return (
                    <div
                      key={student.rollNumber}
                      className={`rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all border shadow-sm ${
                        isPresent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-900 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-400'
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        Roll
                      </span>
                      <span className="text-base sm:text-lg font-extrabold my-0.5 tracking-tight font-mono text-slate-900 dark:text-white">
                        {student.rollNumber}
                      </span>

                      <span
                        className="w-full my-0.5 text-[11px] font-medium leading-tight text-slate-700 dark:text-slate-200 break-words"
                        title={student.name ?? 'Name not available'}
                      >
                        {student.name ?? '—'}
                      </span>

                      {/* Status Pill */}
                      <div
                        className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-md text-xs font-black tracking-wider w-full ${
                          isPresent
                            ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                            : 'bg-rose-500 text-slate-950 shadow-sm shadow-rose-500/30'
                        }`}
                      >
                        {isPresent ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>P</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>A</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};
