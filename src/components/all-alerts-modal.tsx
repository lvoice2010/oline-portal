"use client";

import * as React from "react";
import { X, AlertTriangle, Info, CheckCircle2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertItem } from "@/lib/mock-data";

const ICON = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
} as const;

const ICON_COLOR = {
  warning: "text-amber-500",
  info: "text-sky-500",
  success: "text-emerald-500",
} as const;

type Period = "month" | "quarter" | "year" | "all";
const PERIODS: { id: Period; label: string; days: number | null }[] = [
  { id: "month", label: "Месяц", days: 31 },
  { id: "quarter", label: "Квартал", days: 92 },
  { id: "year", label: "Год", days: 365 },
  { id: "all", label: "Всё время", days: null },
];

// Парсинг даты вида "14.05.2026, 15:12"
function parseAlertDate(s: string): Date {
  const [datePart, timePart = "00:00"] = s.split(", ");
  const [d, m, y] = datePart.split(".").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function AllAlertsModal({
  open,
  onClose,
  alerts,
  dismissedIds,
}: {
  open: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  dismissedIds: Set<string>;
}) {
  const [period, setPeriod] = React.useState<Period>("year");

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const now = new Date();
  const days = PERIODS.find((p) => p.id === period)?.days ?? null;
  const cutoff = days !== null ? new Date(now.getTime() - days * 86400000) : null;

  const items = alerts
    .map((a) => ({
      ...a,
      parsedDate: parseAlertDate(a.date),
      isRead: !a.unread || dismissedIds.has(a.id),
    }))
    .filter((a) => (cutoff ? a.parsedDate >= cutoff : true))
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  const unreadCount = items.filter((a) => !a.isRead).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[78vh] w-full max-w-2xl flex-col rounded-card bg-white shadow-soft-lg">
        <div className="flex items-center justify-between border-b border-navy/[0.06] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper/15 text-copper">
              <Bell size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-navy">Все уведомления</h2>
              <p className="text-xs text-navy/55">
                В фильтре {items.length} · непрочитанных {unreadCount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-navy-50 hover:text-navy"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-navy/[0.06] px-6 py-3">
          <span className="text-xs text-navy/55">Период:</span>
          <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p.id
                    ? "bg-navy text-white"
                    : "text-navy/65 hover:bg-navy-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-navy/45">
              За выбранный период уведомлений нет
            </div>
          )}
          {items.map((a) => {
            const Icon = ICON[a.tone];
            return (
              <div
                key={a.id}
                className={cn(
                  "flex gap-3 border-b border-navy/[0.04] px-6 py-4 last:border-0",
                  !a.isRead && "bg-copper/[0.04]"
                )}
              >
                <Icon size={18} className={cn("mt-0.5 shrink-0", ICON_COLOR[a.tone])} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        a.isRead ? "text-navy/65" : "text-navy"
                      )}
                    >
                      {a.text}
                    </p>
                    {!a.isRead && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-copper"
                        title="Непрочитанное"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-navy/40">{a.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
