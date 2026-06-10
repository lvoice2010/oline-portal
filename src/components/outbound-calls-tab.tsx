"use client";

import * as React from "react";
import { Search, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  outboundCalls,
  OUTBOUND_STATUS_LABEL,
  type OutboundCall,
  type OutboundCallStatus,
} from "@/lib/mock-data";
import { OutboundCallDetailModal } from "@/components/outbound-call-detail-modal";

const PERIODS = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
] as const;
type Period = (typeof PERIODS)[number]["id"];

const STATUS_COLOR: Record<OutboundCallStatus, string> = {
  target: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  reached: "bg-sky-50 text-sky-700 border border-sky-200",
  not_reached: "bg-rose-50 text-rose-700 border border-rose-200",
};

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} мин` : `${m} мин ${String(s).padStart(2, "0")} сек`;
}

export function OutboundCallsTab({ serviceId }: { serviceId: string }) {
  const [period, setPeriod] = React.useState<Period>("month");
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");
  const [customOpen, setCustomOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] =
    React.useState<"all" | OutboundCallStatus>("all");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<OutboundCall | null>(null);

  const serviceCalls = outboundCalls.filter((c) => c.serviceId === serviceId);
  const now = new Date();
  const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 31 : null;
  const cutoff = days !== null ? new Date(now.getTime() - days * 86400000) : null;
  const fromDate = period === "custom" && customFrom ? new Date(customFrom) : null;
  const toDate = period === "custom" && customTo ? new Date(`${customTo}T23:59:59`) : null;

  const inPeriod = serviceCalls.filter((c) => {
    const [d, m, y] = c.date.split(".").map(Number);
    const callDate = new Date(y, m - 1, d);
    if (cutoff && callDate < cutoff) return false;
    if (fromDate && callDate < fromDate) return false;
    if (toDate && callDate > toDate) return false;
    return true;
  });

  const filtered = inPeriod.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !c.contactNumber.toLowerCase().includes(q) &&
        !c.operator.name.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const total = inPeriod.length;
  const targets = inPeriod.filter((c) => c.status === "target").length;
  const reached = inPeriod.filter((c) => c.status === "reached" || c.status === "target").length;
  const notReached = inPeriod.filter((c) => c.status === "not_reached").length;
  const reachedPct = total > 0 ? Math.round((reached / total) * 100) : 0;
  const conversionPct = reached > 0 ? Math.round((targets / reached) * 100) : 0;

  if (serviceCalls.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        По этой кампании журнал звонков ещё не накоплен.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Сводка */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-navy/55">Всего звонков</p>
          <p className="mt-1 text-2xl font-semibold text-navy">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Дозвон</p>
          <p className="mt-1 text-2xl font-semibold text-sky-600">{reached}</p>
          <p className="text-[10px] text-navy/45">{reachedPct}% от попыток</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Нет дозвона</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold",
              notReached > 0 ? "text-rose-600" : "text-navy"
            )}
          >
            {notReached}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Целевых действий</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{targets}</p>
          <p className="text-[10px] text-navy/45">конверсия {conversionPct}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Средняя длительность</p>
          <p className="mt-1 text-2xl font-semibold text-navy">
            {fmtDuration(
              total > 0
                ? Math.round(inPeriod.reduce((s, c) => s + c.durationSec, 0) / total)
                : 0
            )}
          </p>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === "custom") {
                    if (period === "custom") setCustomOpen((v) => !v);
                    else {
                      setPeriod("custom");
                      setCustomOpen(true);
                    }
                  } else {
                    setPeriod(p.id);
                    setCustomOpen(false);
                  }
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  period === p.id
                    ? "bg-navy text-white"
                    : "text-navy/65 hover:bg-navy-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {customOpen && period === "custom" && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCustomOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-card border border-navy/10 bg-white p-4 shadow-soft-lg">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                  Выберите период
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-navy/55">От</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-copper"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-navy/55">До</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-copper"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
          {(
            [
              { id: "all" as const, label: "Все" },
              { id: "target" as const, label: "Целевые" },
              { id: "reached" as const, label: "Дозвон" },
              { id: "not_reached" as const, label: "Нет дозвона" },
            ] as { id: "all" | OutboundCallStatus; label: string }[]
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => setStatusFilter(o.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                statusFilter === o.id
                  ? "bg-navy text-white"
                  : "text-navy/65 hover:bg-navy-50"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Номер или оператор"
            className="w-72 rounded-xl border border-navy/15 bg-white py-2 pl-9 pr-3 text-sm text-navy outline-none focus:border-copper"
          />
        </div>
      </div>

      {/* Таблица */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-[11px] uppercase tracking-wider text-navy/55">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Оператор</th>
                <th className="px-4 py-3 font-medium">Контакт</th>
                <th className="px-4 py-3 font-medium text-center">Попытка</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium text-right">Длительность</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-navy/45">
                    По текущему фильтру звонков нет
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer border-b border-navy/[0.04] transition-colors hover:bg-navy-50/40 last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-navy/80">
                    <div>{c.date}</div>
                    <div className="text-[11px] text-navy/45">{c.time}</div>
                  </td>
                  <td className="px-4 py-3 text-navy/80">
                    <span className="text-[11px] text-navy/45">
                      [{c.operator.id}]{" "}
                    </span>
                    {c.operator.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-navy">
                    {c.contactNumber}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                        c.attempt === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : c.attempt === 2
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {c.attempt}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        STATUS_COLOR[c.status]
                      )}
                    >
                      {OUTBOUND_STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-navy">
                    {c.durationSec > 0 ? fmtDuration(c.durationSec) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(c);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy/15 bg-white px-2.5 py-1 text-[11px] font-medium text-navy hover:border-copper hover:text-copper"
                    >
                      <Eye size={11} /> Открыть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-navy/[0.06] bg-white px-4 py-3 text-xs text-navy/55">
          <span>
            Показано {filtered.length} из {total} звонков за период
          </span>
        </div>
      </Card>

      <OutboundCallDetailModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        call={selected}
      />
    </div>
  );
}
