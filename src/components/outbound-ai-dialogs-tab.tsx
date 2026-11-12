"use client";

import * as React from "react";
import { Eye, Search, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DialogDetailModal, OUTCOME_BADGE } from "@/components/dialog-detail-modal";
import { cn } from "@/lib/utils";
import { outboundReports, type Dialog } from "@/lib/mock-data";
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
  if (f === "target") return o.outcomeTone === "target";
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

  // Сводка — из тех же агрегатов, что и отчёт по кампании (совпадает с воронкой);
  // таблица ниже — выборка последних разговоров.
  const t = periodTotals(period);
  const cost = Math.round(t.minutes * OUTBOUND_AI_RATE);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Разговоров" value={t.reached} />
        <Kpi
          label="Согласий"
          value={t.consents}
          tone="emerald"
          hint={`${fmt(t.consents - t.transferred)} промокод · ${fmt(t.transferred)} менеджеру`}
        />
        <Kpi label="Перезвонить" value={t.callbacks} tone="amber" hint="звонок назначен" />
        <Kpi label="Отказов" value={t.refused} tone="rose" />
        <Card className="p-4">
          <p className="text-xs text-navy/55">Минут разговора</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
            {fmt(t.minutes)}
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
          В таблице — последние разговоры: {filtered.length} из {fmt(t.reached)} за период
        </div>
      </Card>

      <DialogDetailModal open={selected !== null} onClose={() => setSelected(null)} dialog={selected} />
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("ru-RU");

// Итоги разговоров за период. «Вся кампания» и «Месяц» (кампания идёт 3 недели)
// — ровно цифры отчёта; «Неделя» — 3-я неделя из динамики отчёта;
// «Сегодня» — неполный день при темпе 850 контактов в сутки.
function periodTotals(period: Period) {
  const r = outboundReports["outbound-ai"];
  const avgMin = r.ai!.talkMinutes / r.funnel.reached; // 1,6 мин на разговор
  const share = (name: string) =>
    (r.outcomes!.find((o) => o.name.startsWith(name))?.count ?? 0) / r.funnel.reached;
  const promoShare = share("Согласие") / (share("Согласие") + share("Передан"));

  if (period === "all" || period === "month") {
    const by = (name: string) => r.outcomes!.find((o) => o.name.startsWith(name))?.count ?? 0;
    return {
      reached: r.funnel.reached,
      consents: r.funnel.targets,
      transferred: by("Передан"),
      callbacks: by("Попросил перезвонить"),
      refused: by("Отказ"),
      minutes: r.ai!.talkMinutes,
    };
  }
  const fact = r.weeklyDynamics.filter((w) => w.reached !== null);
  const lastWeek = fact[fact.length - 1];
  const reached = period === "week" ? lastWeek.reached! : 460;
  const consents = period === "week" ? lastWeek.targets! : 92;
  return {
    reached,
    consents,
    transferred: consents - Math.round(consents * promoShare),
    callbacks: Math.round(reached * share("Попросил перезвонить")),
    refused: Math.round(reached * share("Отказ")),
    minutes: Math.round(reached * avgMin),
  };
}

function Kpi({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "amber" | "rose";
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-navy/55">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "emerald" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : tone === "rose" ? "text-rose-600" : "text-navy"
        )}
      >
        {fmt(value)}
      </p>
      {hint && <p className="text-[11px] tabular-nums text-navy/50">{hint}</p>}
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
