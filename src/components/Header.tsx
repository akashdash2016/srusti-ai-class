import React from 'react';
import { Sparkles, History, CheckSquare, Zap, Sun, Moon, Lock, LayoutGrid } from 'lucide-react';

export type Theme = 'light' | 'dark';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onLoadSample: () => void;
  onOpenMenu: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onLoadSample,
  onOpenMenu,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Badge */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-500/20 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5">
              <CheckSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Attendance Register Generator
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  WhatsApp Converter
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Convert WhatsApp present roll numbers (1–53) into a visual, grouped attendance register in seconds.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
            <button
              onClick={onOpenMenu}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
              title="Back to the workspace menu"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Menu</span>
            </button>

            <button
              onClick={onToggleTheme}
              type="button"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              )}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={onLoadSample}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
              title="Click to paste example WhatsApp message data"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Load Sample</span>
            </button>

            <button
              onClick={onOpenHistory}
              type="button"
              className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Saved Registers</span>
              {historyCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950 bg-teal-400 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>

            <a
              href="/api/logout"
              title="Lock this site and return to the password screen"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Lock</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
