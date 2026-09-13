import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showSnackbar = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-500 flex-shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/95 dark:bg-[#0F172A] text-emerald-900 dark:text-emerald-300 dark:shadow-emerald-950/40',
    warning: 'border-amber-200 dark:border-amber-500/30 bg-amber-50/95 dark:bg-[#0F172A] text-amber-900 dark:text-amber-300 dark:shadow-amber-950/40',
    error: 'border-rose-200 dark:border-rose-500/30 bg-rose-50/95 dark:bg-[#0F172A] text-rose-900 dark:text-rose-300 dark:shadow-rose-950/40',
    info: 'border-sky-200 dark:border-sky-500/30 bg-sky-50/95 dark:bg-[#0F172A] text-sky-900 dark:text-sky-300 dark:shadow-sky-950/40',
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {/* Floating Snackbar / Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              borderMap[toast.type] || borderMap.info
            }`}
          >
            <div className="flex items-center gap-2.5">
              {iconMap[toast.type] || iconMap.info}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
