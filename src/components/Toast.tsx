import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-[#7DB9DD] flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        };

        const bgStyles = {
          success: 'bg-white border-emerald-100 text-[#0B1833]',
          info: 'bg-white border-[#7DB9DD]/20 text-[#0B1833]',
          warning: 'bg-white border-amber-100 text-[#0B1833]',
          error: 'bg-white border-red-100 text-[#0B1833]'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-xl border ${bgStyles[toast.type]} animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <span className="text-xs font-semibold leading-snug">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

