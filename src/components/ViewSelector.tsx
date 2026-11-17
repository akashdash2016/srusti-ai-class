import React from 'react';
import { LayoutGrid, AlignLeft, Table as TableIcon, ArrowDownUp, ArrowLeftRight } from 'lucide-react';
import type { ViewMode, LayoutOrientation } from '../types/attendance';

interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  orientation: LayoutOrientation;
  onOrientationChange: (orientation: LayoutOrientation) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  currentView,
  onViewChange,
  orientation,
  onOrientationChange,
}) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* View Modes */}
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => onViewChange('grid')}
          type="button"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentView === 'grid'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Grid View</span>
        </button>

        <button
          onClick={() => onViewChange('sequence')}
          type="button"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentView === 'sequence'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Sequence View</span>
        </button>

        <button
          onClick={() => onViewChange('table')}
          type="button"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentView === 'table'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Table View</span>
        </button>
      </div>

      {/* Item Stacking Orientation Switcher (Vertical vs Horizontal) */}
      {currentView !== 'table' && (
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-fit">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2">
            4-Item Layout:
          </span>
          <button
            onClick={() => onOrientationChange('vertical')}
            type="button"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              orientation === 'vertical'
                ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Stack 4 roll numbers vertically in a column per group"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>↕ Vertical Stack</span>
          </button>

          <button
            onClick={() => onOrientationChange('horizontal')}
            type="button"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              orientation === 'horizontal'
                ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Place 4 roll numbers horizontally in a row per group"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>↔ Horizontal Row</span>
          </button>
        </div>
      )}
    </div>
  );
};
