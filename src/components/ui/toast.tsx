"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

type Toast = { id: number; message: string };
const ToastCtx = React.createContext<(message: string) => void>(() => {});

export function useToast() {
  return React.useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex max-w-sm items-start gap-3 rounded-card border border-navy/[0.06] bg-white px-4 py-3 shadow-soft-lg"
          >
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={20} />
            <p className="text-sm text-navy">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
