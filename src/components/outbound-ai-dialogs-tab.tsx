"use client";

import * as React from "react";
import { Eye, Search, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DialogDetailModal, OUTCOME_BADGE } from "@/components/dialog-detail-modal";
import { cn } from "@/lib/utils";
import type { Dialog } from "@/lib/mock-data";
import { buildOutboundAiDialogs, OUTBOUND_AI_RATE } from "@/lib/outbound-ai-dialogs";

type Period = "today" | "week" | "month" | "all";
const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "all", label: "Вся кампания" },
];

type OutcomeFilter = "all" | "target" | "transfer" | "warm" | "refuse" | "neutral";
const OUTCOME_FILTERS: { id: OutcomeFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "target", label: "Согласие" },
  { id: "transfer", label: "Передан менеджеру" },
  { id: "warm", label: "Перезвонить" },
  { id: "refuse", label: "Отказ" },
  { id: "neutral", label: "Прочее" },
];

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function matches(d: Dialog, f: OutcomeFilter) {
  const o = d.outbound!;
  if (f === "all") return true;
  if (f === "transfer") return d.escalated;
  if (f === "target") return o.outcomeTone === "target" && !d.escalated;
  return o.outcomeTone === f;
}

export function OutboundAiDialogsTab() {
  const [period, setPeriod] = React.useState<Period>("all");
  const [outcome, setOutcome] = React.useState<OutcomeFilter>("all");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Dialog | null>(null);

  const all = React.useMemo(() => buildOutboundAiDialogs(), []);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = period === "today" ? 0 : period === "week" ? 6 : period === "month" ? 30 : null;
  const cutoff = days !== null ? new Date(today.getTime() - days * 86400000) : null;

  const inPeriod = all.filter((d) => {
    if (!cutoff) return true;
    const [dd, mm, yy] = d.date.split(".").map(Number);
    return new Date(yy, mm - 1, dd) >= cutoff;
  });

  const filtered = inPeriod.filter((d) => {
    if (!matches(d, outcome)) return false;
    if (search) {
      const q = search.toLowerCase().replace(/\D/g, "") || search.toLowerCase();
      const o = d.outbound!;
      const hay = `${o.contactNumber.replace(/\D/g, "")} ${o.segment} ${o.outcome} ${d.topic}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const consents = inPeriod.filter((d) => d.outbound!.outcomeTone === "target" && !d.escalated).length;
  const transferred = inPeriod.filter((d) => d.escalated).length;
  const refused = inPeriod.filter((d) => d.outbound!.outcomeTone === "refuse").length;
  const totalSec = inPeriod.reduce((s, d) => s + d.durationSec, 0);
  const minutes = Math.round((totalSec / 60) * 10) / 10;
  const cost = Math.round(minutes * OUTBOUND_AI_RATE);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Разговоров" value={inPeriod.length} />
        <Kpi label="Согласий" value={consents} tone="emerald" />
        <Kpi label="Передано менеджеру" value={transferred} tone="sky" />
        <Kpi label="Отказов" value={refused} tone="rose" />
        <Card className="p-4">
          <p className="text-xs text-navy/55">Минут разговора</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
            {minutes.toLocaleString("ru-RU")}
          </p>
          <p className="text-[11px] tabular-nums text-navy/50">
            ≈ {cost.toLocaleString("ru-RU")} ₽ · {OUTBOUND_AI_RATE.toLocaleString("ru-RU")} ₽/мин
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
        <Segmented options={OUTCOME_FILTERS} value={outcome} onChange={setOutcome} />
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Номер, сегмент или итог"
            className="w-60 rounded-xl border border-navy/15 bg-white py-2 pl-9 pr-3 text-sm text-navy outline-none focus:border-copper"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-[11px] uppercase tracking-wider text-navy/55">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Номер клиента</th>
                <th className="px-4 py-3 font-medium">Сегмент базы</th>
                <th className="px-4 py-3 font-medium">Итог разговора</th>
                <th className="px-4 py-3 font-medium text-center">Попытка</th>
                <th className="px-4 py-3 font-medium text-right">Длительность</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-navy/45">
                    По текущему фильтру разговоров нет
                  </td>
                </tr>
              )}
              {filtered.map((d) => {
                const o = d.outbound!;
                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(d)}
                    className="cursor-pointer border-b border-navy/[0.04] transition-colors last:border-0 hover:bg-navy-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-navy/80">
                      <div>{d.date}</div>
                      <div className="text-[11px] text-navy/45">{d.time}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-navy/85">
                      {o.contactNumber}
                    </td>
                    <td className="px-4 py-3 text-navy/70">{o.segment}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", OUTCOME_BADGE[o.outcomeTone])}>
                        {o.outcome}
                      </span>
                      <div className="mt-1 text-[11px] text-navy/50">{d.topic}</div>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-navy/70">{o.attempt}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-navy">{fmtDuration(d.durationSec)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(d);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-navy/15 bg-white px-2.5 py-1 text-[11px] font-medium text-navy hover:border-copper hover:text-copper"
                      >
                        <Headphones size={11} /> Слушать
                        <Eye size={11} className="ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-navy/[0.06] bg-white px-4 py-3 text-xs text-navy/55">
          Показано {filtered.length} из {inPeriod.length} разговоров за период · в демо-журнале
          выборка разговоров кампании
        </div>
      </Card>

      <DialogDetailModal open={selected !== null} onClose={() => setSelected(null)} dialog={selected} />
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "sky" | "rose" }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-navy/55">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "emerald" ? "text-emerald-600" : tone === "sky" ? "text-sky-700" : tone === "rose" ? "text-rose-600" : "text-navy"
        )}
      >
        {value}
      </p>
    </Card>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-navy/15 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition-colors",
            value === o.id ? "bg-navy text-white" : "text-navy/65 hover:bg-navy-50"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
