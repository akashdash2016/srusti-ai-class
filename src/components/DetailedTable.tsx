import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import type { StudentAttendance } from '../types/attendance';

interface DetailedTableProps {
  attendanceList: StudentAttendance[];
  section: string;
}

export const DetailedTable: React.FC<DetailedTableProps> = ({
  attendanceList,
  section,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'P' | 'A'>('ALL');

  const filteredList = attendanceList.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      item.rollNumber.toString().includes(query) ||
      (item.name?.toLowerCase().includes(query) ?? false);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
            DETAILED STUDENT TABLE — {section}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search by roll number or student name, and filter by status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roll or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium ${
                statusFilter === 'ALL' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('P')}
              className={`px-2.5 py-1 rounded-lg font-medium ${
                statusFilter === 'P' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Present
            </button>
            <button
              onClick={() => setStatusFilter('A')}
              className={`px-2.5 py-1 rounded-lg font-medium ${
                statusFilter === 'A' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Absent
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-96">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Roll Number</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Attendance Status</th>
              <th className="px-4 py-3">Group Block</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white/60 dark:bg-slate-900/60">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No roll numbers found matching filter.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const groupNum = Math.ceil(item.rollNumber / 4);
                const isPresent = item.status === 'P';
                return (
                  <tr key={item.rollNumber} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                      Roll {item.rollNumber}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      {item.name ?? '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PRESENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          ABSENT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-mono">
                      Group {groupNum} (Rolls {(groupNum - 1) * 4 + 1}–{groupNum * 4})
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
