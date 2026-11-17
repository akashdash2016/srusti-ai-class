import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { ParseResult } from '../types/attendance';

interface WarningBannerProps {
  parseResult: ParseResult;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ parseResult }) => {
  const { duplicates, invalidEntries } = parseResult;

  if (duplicates.length === 0 && invalidEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Duplicates Warning */}
      {duplicates.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              Duplicate Roll Numbers Detected ({duplicates.length}):
            </span>{' '}
            Roll number(s){' '}
            <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-100 font-bold">
              {duplicates.join(', ')}
            </span>{' '}
            appeared multiple times in your input. Duplicates were automatically consolidated into a single record.
          </div>
        </div>
      )}

      {/* Invalid Entries Warning */}
      {invalidEntries.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed space-y-1">
            <div className="font-semibold text-rose-700 dark:text-rose-300">
              Skipped Invalid Input Entries ({invalidEntries.length}):
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-xs font-mono text-rose-700/90 dark:text-rose-300/90 pl-1">
              {invalidEntries.map((item, idx) => (
                <li key={idx}>
                  <span className="font-bold bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-900 dark:text-rose-100">
                    "{item.raw}"
                  </span>{' '}
                  — {item.reason}
                </li>
              ))}
            </ul>
            <div className="text-[11px] text-rose-700/80 dark:text-rose-300/70 pt-1">
              Valid roll numbers were processed normally.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
