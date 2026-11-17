import { useState, useEffect, useId, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { SectionName, AttendanceRecord, ViewMode, LayoutOrientation } from './types/attendance';
import {
  parseRollNumbers,
  generateAttendanceList,
  groupAttendanceList,
  computeAttendanceSummary,
  formatDateReadable,
} from './utils/attendanceParser';
import {
  getSavedAttendanceRecords,
  saveAttendanceRecord,
  deleteAttendanceRecord,
  clearAllAttendanceRecords,
} from './utils/localStorageUtils';
import {
  DEFAULT_MAX_STUDENTS,
  DEFAULT_SECTION,
  getSectionDefaultStudents,
} from './constants/sections';

import { Header, type Theme } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ReportPage } from './components/report/ReportPage';
import { InputSection } from './components/InputSection';
import { WarningBanner } from './components/WarningBanner';
import { SummaryCards } from './components/SummaryCards';
import { ViewSelector } from './components/ViewSelector';
import { AttendanceGrid } from './components/AttendanceGrid';
import { SequenceView } from './components/SequenceView';
import { DetailedTable } from './components/DetailedTable';
import { ExportToolbar } from './components/ExportToolbar';
import { RecentHistoryModal } from './components/RecentHistoryModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { Toast, type ToastMessage } from './components/Toast';

const THEME_STORAGE_KEY = 'attendance_theme';

type Screen = 'home' | 'attendance' | 'report';

function readScreen(): Screen {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  return hash === 'attendance' || hash === 'report' ? hash : 'home';
}

const SAMPLE_WHATSAPP_TEXT = `Section C

Present list

20
42
4
1
10
36
23
44
51
50
21
15
34
8
12
47
22
14
33
11
26
40
2
49
46
35
5
29
48
16
3
41
13
7
30
25`;

export function App() {
  // Form State
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [section, setSection] = useState<SectionName>(DEFAULT_SECTION);
  const [maxStudents, setMaxStudents] = useState<number>(DEFAULT_MAX_STUDENTS);
  const [groupSize, setGroupSize] = useState<number>(4);
  const [rawInput, setRawInput] = useState<string>('');

  // UI State
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [currentView, setCurrentView] = useState<ViewMode>('grid');
  const [orientation, setOrientation] = useState<LayoutOrientation>('vertical');
  const [history, setHistory] = useState<AttendanceRecord[]>(() => getSavedAttendanceRecords());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [screen, setScreen] = useState<Screen>(() => readScreen());

  const navigate = (next: Screen) => {
    const hash = next === 'home' ? '' : `#${next}`;
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    setScreen(next);
  };

  // Keep the screen in sync with browser back/forward and direct hash links
  useEffect(() => {
    const sync = () => setScreen(readScreen());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  const registerContainerId = useId().replace(/:/g, '');

  // Keep the document theme in sync with the selected mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures (e.g. private mode)
    }
  }, [theme]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({
      id: Date.now().toString(),
      text,
      type,
    });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSectionChange = (nextSection: SectionName) => {
    setSection(nextSection);
    const sectionDefault = getSectionDefaultStudents(nextSection);
    if (sectionDefault !== undefined) {
      setMaxStudents(sectionDefault);
    }
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_WHATSAPP_TEXT);
    setSection(DEFAULT_SECTION);
    setMaxStudents(DEFAULT_MAX_STUDENTS);
    showToast('Loaded WhatsApp sample present list!');
  };

  // Live-derived register data: updates on every keystroke / control change
  const hasInput = rawInput.trim().length > 0;

  const parseResult = useMemo(
    () => parseRollNumbers(rawInput, maxStudents),
    [rawInput, maxStudents]
  );

  const attendanceList = useMemo(
    () =>
      generateAttendanceList(
        parseResult.validPresentRolls,
        maxStudents,
        section
      ),
    [parseResult, maxStudents, section]
  );

  const groups = useMemo(
    () => groupAttendanceList(attendanceList, groupSize),
    [attendanceList, groupSize]
  );

  const summary = useMemo(
    () => computeAttendanceSummary(parseResult.validPresentRolls.length, maxStudents),
    [parseResult.validPresentRolls.length, maxStudents]
  );

  const formattedDate = useMemo(() => formatDateReadable(date), [date]);

  const currentRecord = useMemo<AttendanceRecord | null>(() => {
    if (!hasInput) return null;

    return {
      id: 'live-preview',
      timestamp: 0,
      date,
      formattedDate,
      section,
      maxStudents,
      groupSize,
      rawInput,
      presentRolls: parseResult.validPresentRolls,
      summary,
    };
  }, [
    hasInput,
    date,
    formattedDate,
    section,
    maxStudents,
    groupSize,
    rawInput,
    parseResult,
    summary,
  ]);

  const handleSaveRecord = () => {
    if (!hasInput || !currentRecord) {
      showToast('Please paste present roll numbers first', 'error');
      return;
    }

    const recordToSave: AttendanceRecord = {
      ...currentRecord,
      id: `att_${Date.now()}`,
      timestamp: Date.now(),
    };

    const updatedHistory = saveAttendanceRecord(recordToSave);
    setHistory(updatedHistory);

    // Celebrate 100% attendance if applicable
    if (summary.attendancePercentage === 100) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    showToast(
      `Saved Register for ${section} (${summary.presentCount}/${summary.totalStudents} Present)`
    );
  };

  const handleResetConfirm = () => {
    setRawInput('');
    showToast('Input and attendance register reset', 'info');
  };

  const handleSelectHistoryRecord = (record: AttendanceRecord) => {
    setDate(record.date);
    setSection(record.section);
    setMaxStudents(record.maxStudents);
    setGroupSize(record.groupSize || 4);
    setRawInput(record.rawInput);

    showToast(`Reloaded attendance record from ${record.formattedDate} (${record.section})`);
  };

  const handleDeleteHistoryRecord = (id: string) => {
    const updated = deleteAttendanceRecord(id);
    setHistory(updated);
    showToast('Record deleted from history', 'info');
  };

  const handleClearHistoryAll = () => {
    clearAllAttendanceRecords();
    setHistory([]);
    showToast('Cleared all saved records', 'info');
  };

  if (screen === 'home') {
    return (
      <HomeScreen
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenAttendance={() => navigate('attendance')}
        onOpenReport={() => navigate('report')}
        historyCount={history.length}
      />
    );
  }

  if (screen === 'report') {
    return (
      <ReportPage
        onBack={() => navigate('home')}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-slate-950">

      {/* App Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLoadSample={handleLoadSample}
        onOpenMenu={() => navigate('home')}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Input Controls */}
        <InputSection
          date={date}
          setDate={setDate}
          section={section}
          setSection={handleSectionChange}
          maxStudents={maxStudents}
          setMaxStudents={setMaxStudents}
          groupSize={groupSize}
          setGroupSize={setGroupSize}
          rawInput={rawInput}
          setRawInput={setRawInput}
          onSave={handleSaveRecord}
          onReset={() => setIsResetModalOpen(true)}
          hasInput={hasInput}
        />

        {/* Validation Warnings (Duplicates / Invalid numbers) */}
        {hasInput && <WarningBanner parseResult={parseResult} />}

        {/* Live Attendance Output Container */}
        {hasInput && currentRecord && (
          <div className="space-y-6 animate-fadeIn">

            {/* Export & Copy Toolbar */}
            <ExportToolbar
              record={currentRecord}
              groups={groups}
              attendanceList={attendanceList}
              targetElementId={registerContainerId}
              onShowToast={showToast}
              theme={theme}
            />

            {/* View Switcher Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <ViewSelector
                currentView={currentView}
                onViewChange={setCurrentView}
                orientation={orientation}
                onOrientationChange={setOrientation}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Showing {maxStudents} Students ({groups.length} Blocks of {groupSize})
              </span>
            </div>

            {/* Target Container for PNG / PDF Export */}
            <div
              id={registerContainerId}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6"
            >
              {/* Summary statistics included inside the export container so they
                  appear in the exported PNG and PDF */}
              <SummaryCards
                summary={summary}
                formattedDate={currentRecord.formattedDate}
                section={currentRecord.section}
              />

              {currentView === 'grid' && (
                <AttendanceGrid
                  groups={groups}
                  section={currentRecord.section}
                  formattedDate={currentRecord.formattedDate}
                  orientation={orientation}
                />
              )}

              {currentView === 'sequence' && (
                <SequenceView
                  groups={groups}
                  section={currentRecord.section}
                  formattedDate={currentRecord.formattedDate}
                  orientation={orientation}
                />
              )}

              {currentView === 'table' && (
                <DetailedTable
                  attendanceList={attendanceList}
                  section={currentRecord.section}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Attendance Register & WhatsApp Present List Converter Utility</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-600 mt-1">Built with React, TypeScript & Tailwind CSS • Ready for Vercel</p>
      </footer>

      {/* Modals & Toast */}
      <RecentHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelectRecord={handleSelectHistoryRecord}
        onDeleteRecord={handleDeleteHistoryRecord}
        onClearAll={handleClearHistoryAll}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
export default App;
