import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-500/40 shadow-emerald-500/20'
            : isError
            ? 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-500/40 shadow-rose-500/20'
            : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-teal-500/40 shadow-teal-500/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
        )}

        <span>{toast.text}</span>

        <button
          onClick={onDismiss}
          type="button"
          className="p-1 hover:opacity-80 transition-opacity ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
