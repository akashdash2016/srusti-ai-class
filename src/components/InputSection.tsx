import React, { useState } from 'react';
import { Calendar, Users, FileText, Save, RotateCcw, SlidersHorizontal, Zap } from 'lucide-react';
import type { SectionName } from '../types/attendance';
import { DEFAULT_MAX_STUDENTS, SECTION_OPTIONS } from '../constants/sections';

interface InputSectionProps {
  date: string;
  setDate: (date: string) => void;
  section: SectionName;
  setSection: (sec: SectionName) => void;
  maxStudents: number;
  setMaxStudents: (num: number) => void;
  groupSize: number;
  setGroupSize: (num: number) => void;
  rawInput: string;
  setRawInput: (input: string) => void;
  onSave: () => void;
  onReset: () => void;
  hasInput: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  date,
  setDate,
  section,
  setSection,
  maxStudents,
  setMaxStudents,
  groupSize,
  setGroupSize,
  rawInput,
  setRawInput,
  onSave,
  onReset,
  hasInput,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSection, setCustomSection] = useState('');
  const [isCustomSection, setIsCustomSection] = useState(false);

  const handleSectionChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomSection(true);
      if (customSection) setSection(customSection);
    } else {
      setIsCustomSection(false);
      setSection(val);
    }
  };

  const handleCustomSectionChange = (val: string) => {
    setCustomSection(val);
    setSection(val || 'Custom Section');
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Top Metadata Controls: Date, Section, Total Students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Date Selector */}
        <div className="space-y-1.5">
          <label htmlFor="attendance-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Date
            </span>
            <button
              onClick={handleTodayClick}
              type="button"
              className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline cursor-pointer"
            >
              Set Today
            </button>
          </label>
          <input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Section Selector */}
        <div className="space-y-1.5">
          <label htmlFor="attendance-section" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Section
          </label>
          {isCustomSection ? (
            <div className="flex items-center gap-2">
              <input
                id="attendance-section"
                type="text"
                placeholder="Enter section name"
                value={customSection}
                onChange={(e) => handleCustomSectionChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setIsCustomSection(false)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <select
              id="attendance-section"
              value={SECTION_OPTIONS.includes(section) ? section : 'CUSTOM'}
              onChange={(e) => handleSectionChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              {SECTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="CUSTOM">+ Custom Section Name</option>
            </select>
          )}
        </div>

        {/* Total Students Quick Preset */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Total Class Roll Count ({maxStudents})
            </label>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {showAdvanced ? 'Hide Settings' : 'Settings'}
            </button>
          </div>
          
          <div className="flex items-center gap-1.5">
            {[40, 45, 50, 51, 52, 60].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxStudents(num)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  maxStudents === num
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Advanced Settings Drawer (Optional custom student count & group size) */}
      {showAdvanced && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          <div className="space-y-1">
            <label htmlFor="custom-max-students" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Custom Maximum Roll Number
            </label>
            <input
              id="custom-max-students"
              type="number"
              min="1"
              max="200"
              value={maxStudents}
              onChange={(e) => setMaxStudents(Math.max(1, parseInt(e.target.value) || DEFAULT_MAX_STUDENTS))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="custom-group-size" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Group Size (Students per block)
            </label>
            <input
              id="custom-group-size"
              type="number"
              min="1"
              max="10"
              value={groupSize}
              onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 4))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Textarea for WhatsApp Present Roll Numbers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="raw-roll-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Paste Present Roll Numbers (From WhatsApp / Message)
          </label>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            {rawInput && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {rawInput.length} chars
              </span>
            )}
          </div>
        </div>

        <textarea
          id="raw-roll-input"
          rows={5}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`Paste WhatsApp present list here, e.g.:

Section C
Present list
20
42
4
1
10
36
... (or 20, 42, 4, 1, 10)`}
          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-mono text-emerald-700 dark:text-emerald-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-y leading-relaxed shadow-inner"
        />

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Supports newline, comma, or space separated numbers in any order. The
            register updates live as you type.
          </span>
        </div>
      </div>

      {/* Action Buttons: Save & Reset */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={onSave}
          type="button"
          disabled={!hasInput}
          className={`w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            hasInput
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.99]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-70'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>SAVE REGISTER TO HISTORY</span>
        </button>

        {hasInput && (
          <button
            onClick={onReset}
            type="button"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-medium text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

    </div>
  );
};
