import React from 'react';
import { X, History, Trash2, ArrowRight, Calendar, Users, Percent } from 'lucide-react';
import type { AttendanceRecord } from '../types/attendance';

interface RecentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  onSelectRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const RecentHistoryModal: React.FC<RecentHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Attendance History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saved registers in local storage. Click any record to reload.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Record List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-30 text-slate-500 dark:text-slate-400" />
              <p className="text-sm font-medium">No saved attendance records yet.</p>
              <p className="text-xs text-slate-500 dark:text-slate-600">
                Generated attendance registers will automatically appear here.
              </p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-teal-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Users className="w-3 h-3" />
                      {rec.section}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {rec.formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>
                      Present:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {rec.summary.presentCount}/{rec.summary.totalStudents}
                      </strong>
                    </span>
                    <span>
                      Absent:{' '}
                      <strong className="text-rose-600 dark:text-rose-400 font-mono">
                        {rec.summary.absentCount}
                      </strong>
                    </span>
                    <span className="flex items-center gap-0.5 text-teal-700 dark:text-teal-300">
                      <Percent className="w-3 h-3" />
                      {rec.summary.attendancePercentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectRecord(rec);
                      onClose();
                    }}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 transition-all cursor-pointer"
                  >
                    <span>Reload</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    type="button"
                    className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {records.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total {records.length} saved records
            </span>
            <button
              onClick={onClearAll}
              type="button"
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
