'use client';

import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid={`toast-${toast.type}`}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-sm',
            'animate-in slide-in-from-right-5',
            toast.type === 'success' && 'bg-green-600 text-white',
            toast.type === 'error' && 'bg-red-600 text-white',
            toast.type === 'info' && 'bg-blue-600 text-white'
          )}
        >
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
          {toast.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 flex-shrink-0" />}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-75 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
