import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[2000] flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`bg-white border rounded-xl p-3.5 flex items-center gap-3 shadow-lg text-xs font-medium min-w-[280px] animate-slideInRight ${
            toast.type === 'success' ? 'border-emerald-300 text-emerald-900 bg-emerald-50/20' :
            toast.type === 'error' ? 'border-red-300 text-red-900 bg-red-50/20' :
            'border-slate-300 text-slate-900 bg-slate-50'
          }`}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-red-600" />}
            {toast.type === 'info' && <Info size={16} className="text-slate-600" />}
          </div>
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button className="text-slate-400 hover:text-slate-700 p-0.5" onClick={() => onDismiss(toast.id)}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
