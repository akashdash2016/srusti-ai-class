import React from 'react';
import type { StudentGroup, LayoutOrientation } from '../types/attendance';

interface SequenceViewProps {
  groups: StudentGroup[];
  section: string;
  formattedDate: string;
  orientation?: LayoutOrientation;
}

export const SequenceView: React.FC<SequenceViewProps> = ({
  groups,
  section,
  formattedDate,
  orientation = 'vertical',
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
            SEQUENCE VIEW — {section}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVertical
              ? 'Vertical 4-student sequence list per block for fast manual register entry.'
              : 'Horizontal 4-student sequence line per block.'}{' '}
            Date: {formattedDate}
          </p>
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          isVertical
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {groups.map((group) => (
          <div
            key={group.groupIndex}
            className="bg-white/60 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-inner hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Rolls {group.startRoll}–{group.endRoll}
              </span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                {group.sequenceString}
              </span>
            </div>

            {/* 4 Students Items Layout (Vertical or Horizontal) */}
            {isVertical ? (
              /* VERTICAL STACKED LIST of 4 Students */
              <div className="space-y-1.5 pt-1">
                {group.students.map((student) => {
                  const isPresent = student.status === 'P';
                  return (
                    <div
                      key={student.rollNumber}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono shrink-0">
                        Roll {student.rollNumber}
                      </span>
                      <span
                        className="min-w-0 flex-1 text-[11px] font-sans font-medium leading-tight text-slate-600 dark:text-slate-300 break-words"
                        title={student.name ?? 'Name not available'}
                      >
                        {student.name ?? '—'}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black shadow-sm shrink-0 ${
                          isPresent
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* HORIZONTAL ROW of 4 Students */
              <div className="flex items-start justify-between gap-2 pt-1">
                {group.students.map((student) => (
                  <div
                    key={student.rollNumber}
                    className="flex-1 min-w-0 flex flex-col items-center gap-1"
                    title={`Roll ${student.rollNumber}: ${
                      student.name ?? 'Name not available'
                    } (${student.status === 'P' ? 'Present' : 'Absent'})`}
                  >
                    <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                      Roll {student.rollNumber}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center w-full py-1.5 rounded-lg text-xs font-black shadow-sm ${
                        student.status === 'P'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {student.status}
                    </span>
                    <span className="w-full text-center text-[10px] font-medium leading-tight text-slate-600 dark:text-slate-300 break-words">
                      {student.name ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
