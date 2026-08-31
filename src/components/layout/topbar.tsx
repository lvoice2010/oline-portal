"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronRight, Coins, AlertTriangle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications, documents } from "@/lib/mock-data";
import { demoizeDeep, monthShift } from "@/lib/demo-clock";

const LABELS: Record<string, string> = {
  dashboard: "Главная",
  reports: "Отчёты",
  analytics: "Аналитика и прогноз",
  catalog: "Витрина услуг",
  services: "Услуга",
  calls: "Вызовы",
  documents: "Финансовые документы",
  "reports-archive": "Архив отчётов",
  messages: "Отправить сообщение",
};

function parseAmount(a: string): number {
  return Number(a.replace(/[^\d]/g, ""));
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const [bellOpen, setBellOpen] = React.useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const lastSeg = segments[segments.length - 1];
  const currentLabel = lastSeg
    ? LABELS[lastSeg] ?? `№ ${lastSeg}`
    : "Главная";

  // Баланс = − сумма неоплаченных счетов (как у Mango Office: отрицательный = долг)
  const unpaid = documents
    .filter((d) => d.type === "Счёт" && d.status === "К оплате")
    .reduce((s, d) => s + parseAmount(d.amount), 0);
  const balance = -unpaid;
  const isDebt = balance < 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-navy/[0.06] bg-canvas/80 px-4 backdrop-blur lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {/* Гамбургер — только на мобиле */}
        <button
          onClick={onMenuClick}
          className="-ml-1 shrink-0 rounded-xl border border-navy/15 bg-white p-2 text-navy/70 hover:bg-navy-50 lg:hidden"
          aria-label="Открыть меню"
        >
          <Menu size={18} />
        </button>

        {/* Хлебные крошки — со планшета и шире */}
        <nav className="hidden items-center gap-1.5 text-sm text-navy/55 sm:flex">
          <Link href="/dashboard" className="hover:text-navy">
            Портал
          </Link>
          {segments.map((seg, i) => {
            const isId = !LABELS[seg];
            return (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={14} className="text-navy/30" />
                <span className={cn(i === segments.length - 1 && "font-medium text-navy")}>
                  {isId ? `№ ${seg}` : LABELS[seg]}
                </span>
              </span>
            );
          })}
        </nav>

        {/* Только текущий раздел — на мобиле */}
        <span className="truncate text-sm font-medium text-navy sm:hidden">
          {currentLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Баланс */}
        <Link
          href="/documents"
          title={
            isDebt
              ? `К оплате: ${(-balance).toLocaleString("ru-RU")} ₽. Открыть документы.`
              : "Баланс по договору"
          }
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
            isDebt
              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "border-navy/15 bg-white text-navy hover:bg-navy-50"
          )}
        >
          <Coins size={16} className={isDebt ? "text-amber-600" : "text-navy/50"} />
          <span className="tabular-nums">
            {balance < 0 ? "−" : ""}
            {Math.abs(balance).toLocaleString("ru-RU")} ₽
          </span>
          {isDebt && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white"
              aria-label="Есть задолженность"
            >
              <AlertTriangle size={11} strokeWidth={3} />
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative rounded-xl border border-navy/15 bg-white p-2.5 text-navy/70 hover:bg-navy-50"
            aria-label="Уведомления"
          >
            <Bell size={18} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-copper text-[11px] font-semibold text-white">
            3
          </span>
        </button>
        {bellOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-80 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-soft-lg">
              <p className="border-b border-navy/[0.06] px-4 py-3 text-sm font-semibold text-navy">
                Уведомления
              </p>
              {demoizeDeep(notifications, monthShift()).map((n, i) => (
                <div
                  key={i}
                  className="border-b border-navy/[0.04] px-4 py-3 text-sm text-navy/75 last:border-0"
                >
                  {n}
                </div>
              ))}
            </div>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
