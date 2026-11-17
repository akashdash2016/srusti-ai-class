import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  Moon,
  Sun,
} from 'lucide-react';
import { ReportDashboard } from './ReportDashboard';
import { exportReportCsv, exportReportPdf, exportReportPng } from '../../utils/reportExportUtils';
import { Toast, type ToastMessage } from '../Toast';
import type { Theme } from '../Header';

const EXPORT_TARGET_ID = 'assignment-report-export';

interface ReportPageProps {
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

type ExportKind = 'png' | 'pdf' | 'csv' | null;

export const ReportPage: React.FC<ReportPageProps> = ({ onBack, theme, onToggleTheme }) => {
  const [busy, setBusy] = useState<ExportKind>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ id: Date.now().toString(), text, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const runExport = async (kind: Exclude<ExportKind, null>) => {
    if (busy) return;
    setBusy(kind);
    try {
      if (kind === 'csv') {
        exportReportCsv();
        showToast('CSV downloaded — one row per student.');
      } else if (kind === 'png') {
        const ok = await exportReportPng(EXPORT_TARGET_ID);
        showToast(ok ? 'Dashboard image downloaded as PNG.' : 'PNG export failed. Please try again.', ok ? 'success' : 'error');
      } else {
        const ok = await exportReportPdf(EXPORT_TARGET_ID);
        showToast(ok ? 'PDF downloaded with the full dashboard.' : 'PDF export failed. Please try again.', ok ? 'success' : 'error');
      }
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const buttonClass =
    'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20 sm:inline-flex dark:text-emerald-400">
                Report
              </span>
              <h1 className="truncate text-sm font-bold tracking-tight sm:text-base">
                Assignment &amp; Quiz Dashboard
              </h1>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block dark:text-slate-400">
              154 students · 3 assessments · section-wise submissions, missing lists &amp; discrepancies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runExport('png')}
              disabled={busy !== null}
              className={`${buttonClass} bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700`}
              title="Download the full dashboard as a PNG image"
            >
              {busy === 'png' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
              PNG
            </button>
            <button
              type="button"
              onClick={() => runExport('pdf')}
              disabled={busy !== null}
              className={`${buttonClass} bg-rose-500 text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600`}
              title="Download a print-ready A4 PDF report"
            >
              {busy === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              PDF
            </button>
            <button
              type="button"
              onClick={() => runExport('csv')}
              disabled={busy !== null}
              className={`${buttonClass} bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20 hover:bg-emerald-400`}
              title="Download the per-student matrix as CSV"
            >
              {busy === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
              CSV
            </button>

            <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />

            <button
              type="button"
              onClick={onToggleTheme}
              className={`${buttonClass} bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700`}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <a
              href="/api/logout"
              className={`${buttonClass} bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700`}
              title="Lock this site"
            >
              <Lock className="h-3.5 w-3.5 text-rose-500" />
              <span className="hidden sm:inline">Lock</span>
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-3 py-6 sm:px-6 sm:py-8">
        <ReportDashboard elementId={EXPORT_TARGET_ID} />

        <p className="mx-auto mt-4 flex max-w-[1180px] items-center justify-center gap-1.5 text-center text-[10.5px] text-slate-500 dark:text-slate-500">
          <Download className="h-3 w-3" />
          PNG and PDF capture the dashboard exactly as shown — filters in the student register affect the
          exported image. CSV always contains all 154 students.
        </p>
      </main>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
