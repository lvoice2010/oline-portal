"use client";

import * as React from "react";
import {
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { outboundAnalytics, type ReportTone } from "@/lib/mock-data";

const SEVERITY_STYLE = {
  high: {
    bg: "bg-rose-50/60",
    border: "border-rose-200",
    icon: AlertTriangle,
    iconColor: "text-rose-600",
    badgeBg: "bg-rose-500",
  },
  med: {
    bg: "bg-amber-50/60",
    border: "border-amber-200",
    icon: Flame,
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-500",
  },
  low: {
    bg: "bg-sky-50/60",
    border: "border-sky-200",
    icon: Info,
    iconColor: "text-sky-600",
    badgeBg: "bg-sky-500",
  },
  ok: {
    bg: "bg-emerald-50/60",
    border: "border-emerald-200",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-500",
  },
} as const;

const SEVERITY_LABEL = {
  high: "Критично",
  med: "Внимание",
  low: "Заметно",
  ok: "Позитивно",
} as const;

const TREND_TEXT: Record<ReportTone, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  ok: "text-emerald-600",
  warn: "text-amber-600",
  neutral: "text-navy/60",
};

function TrendIcon({ tone, size = 12 }: { tone: ReportTone; size?: number }) {
  if (tone === "up" || tone === "ok")
    return <TrendingUp size={size} className="shrink-0" />;
  if (tone === "down" || tone === "warn")
    return <TrendingDown size={size} className="shrink-0" />;
  return <Minus size={size} className="shrink-0" />;
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

export function OutboundAnalyticsTab({ serviceId }: { serviceId: string }) {
  const a = outboundAnalytics[serviceId];
  if (!a) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        Аналитика по этой кампании появится после накопления данных.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Бейдж AI Analytics */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-sky-700">
          <Sparkles size={11} /> AI Analytics
        </div>
        <h2 className="mt-2 text-lg font-semibold text-navy">
          Аналитика кампании
        </h2>
        <p className="mt-0.5 text-xs text-navy/55">
          {a.period} · автоматически обновляется каждую неделю
        </p>
      </div>

      {/* 1. AI INSIGHTS — 4 карточки */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {a.insights.map((ins, i) => {
          const style = SEVERITY_STYLE[ins.severity];
          const Icon = style.icon;
          return (
            <Card
              key={i}
              className={cn("border p-5", style.bg, style.border)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-soft",
                    style.iconColor
                  )}
                >
                  <Icon size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white",
                        style.badgeBg
                      )}
                    >
                      {SEVERITY_LABEL[ins.severity]}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-navy">
                    {ins.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-navy/75">
                    {ins.body}
                  </p>
                  {ins.suggestion && (
                    <p className="mt-2 rounded-card border border-white/60 bg-white/60 px-3 py-2 text-xs leading-relaxed text-navy">
                      <span className="font-semibold">→ </span>
                      {ins.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 2. ВОЗРАЖЕНИЯ С ТРЕНДОМ */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-navy">
          Карта возражений с трендом
          <span className="ml-1.5 text-[11px] font-normal text-navy/45">
            · что меняется в поведении рынка
          </span>
        </h3>
        <div className="mt-4 space-y-3">
          {a.objectionsTrend.map((o) => (
            <div
              key={o.name}
              className="grid grid-cols-1 gap-2 rounded-card border border-navy/[0.06] bg-navy-50/30 p-3 md:grid-cols-4"
            >
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-navy">{o.name}</p>
                <p className="text-[11px] tabular-nums text-navy/55">
                  {o.count} диалогов · {o.pct}% от всех возражений
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-navy/45">
                  Отработка
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    o.resolveRate >= 50
                      ? "text-emerald-600"
                      : o.resolveRate >= 30
                      ? "text-amber-600"
                      : "text-rose-600"
                  )}
                >
                  {o.resolveRate}%
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-navy/45">
                  Тренд за квартал
                </p>
                <p
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    TREND_TEXT[o.trendTone]
                  )}
                >
                  <TrendIcon tone={o.trendTone} /> {o.trendLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. БЕНЧМАРК С РЫНКОМ */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-navy">Сравнение с отраслью</h3>
        <p className="mt-0.5 text-xs text-navy/55">{a.benchmarks.industry}</p>
        <div className="mt-4 space-y-4">
          {a.benchmarks.items.map((b) => {
            const beatMedian = b.higherIsBetter
              ? b.you >= b.median
              : b.you <= b.median;
            const beatTop10 = b.higherIsBetter
              ? b.you >= b.top10
              : b.you <= b.top10;
            const maxValue = Math.max(b.you, b.median, b.top10);
            const youPct = (b.you / maxValue) * 100;
            const medianPct = (b.median / maxValue) * 100;
            return (
              <div key={b.metric}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <p className="font-medium text-navy" title={b.tooltip}>
                    {b.metric}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        beatTop10
                          ? "bg-emerald-100 text-emerald-700"
                          : beatMedian
                          ? "bg-sky-100 text-sky-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {beatTop10 ? "Топ-10%" : beatMedian ? "Выше рынка" : "Ниже рынка"}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-16 shrink-0 text-[10px] text-navy/55">
                      Вы
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${youPct}%` }}
                      />
                    </div>
                    <div className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums text-navy">
                      {b.you}{b.unit === "%" ? "%" : ` ${b.unit}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 shrink-0 text-[10px] text-navy/55">
                      Медиана
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                      <div
                        className="h-full rounded-full bg-navy/40"
                        style={{ width: `${medianPct}%` }}
                      />
                    </div>
                    <div className="w-20 shrink-0 text-right text-xs tabular-nums text-navy/60">
                      {b.median}{b.unit === "%" ? "%" : ` ${b.unit}`}
                    </div>
                  </div>
                  <p className="text-[10px] text-navy/45">
                    Топ-10%: {b.top10}{b.unit === "%" ? "%" : ` ${b.unit}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 6. WHAT-IF СИМУЛЯТОР */}
      <WhatIfSimulatorOutbound
        baseContacts={a.whatIfBase.contacts}
        baseOperators={a.whatIfBase.operators}
        baseHotShare={a.whatIfBase.hotShare}
      />
    </div>
  );
}

// ───────────── What-if симулятор (исход) ─────────────

const BASE_RATES = {
  reachedPct: 68,            // дозвон
  hotConversion: 38,         // конверсия тёплой
  coldConversion: 8,         // конверсия холодной
  revenuePerTarget: 1500,    // ₽ выручки с одного целевого
  costPerOperator: 95000,    // ₽/мес на оператора
  contactPerOperatorMax: 4500, // макс контактов на оператора в месяц
};

function WhatIfSimulatorOutbound({
  baseContacts,
  baseOperators,
  baseHotShare,
}: {
  baseContacts: number;
  baseOperators: number;
  baseHotShare: number;
}) {
  const [contacts, setContacts] = React.useState(baseContacts);
  const [operators, setOperators] = React.useState(baseOperators);
  const [hotShare, setHotShare] = React.useState(baseHotShare);

  const isReset =
    contacts === baseContacts &&
    operators === baseOperators &&
    hotShare === baseHotShare;

  // Расчёт прогноза
  const capacity = operators * BASE_RATES.contactPerOperatorMax;
  const actualContacts = Math.min(contacts, capacity);
  const overCapacity = contacts > capacity;
  const reached = Math.round(actualContacts * (BASE_RATES.reachedPct / 100));
  const hotContacts = (actualContacts * hotShare) / 100;
  const coldContacts = actualContacts - hotContacts;
  const hotTargets =
    (hotContacts * BASE_RATES.reachedPct * BASE_RATES.hotConversion) / 10000;
  const coldTargets =
    (coldContacts * BASE_RATES.reachedPct * BASE_RATES.coldConversion) / 10000;
  const targets = Math.round(hotTargets + coldTargets);
  const conversion = reached > 0 ? (targets / reached) * 100 : 0;
  const spend = operators * BASE_RATES.costPerOperator;
  const revenue = targets * BASE_RATES.revenuePerTarget;
  const cpl = targets > 0 ? Math.round(spend / targets) : 0;
  const roi = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0;

  const cplTone = cpl <= 900 ? "ok" : cpl <= 1200 ? "warn" : "bad";
  const roiTone = roi >= 200 ? "ok" : roi >= 100 ? "warn" : "bad";

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <SlidersHorizontal size={16} className="text-copper" />
            Симулятор следующей кампании
          </h3>
          <p className="mt-0.5 text-xs text-navy/55">
            Прикиньте, что получится при разной базе, команде и доле горячих
            контактов.
          </p>
        </div>
        <button
          onClick={() => {
            setContacts(baseContacts);
            setOperators(baseOperators);
            setHotShare(baseHotShare);
          }}
          disabled={isReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={12} /> Сбросить
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SliderInput
          label="База контактов"
          unit="контактов"
          min={3000}
          max={20000}
          step={500}
          value={contacts}
          baseValue={baseContacts}
          onChange={setContacts}
        />
        <SliderInput
          label="Состав команды"
          unit="операторов"
          min={2}
          max={10}
          step={1}
          value={operators}
          baseValue={baseOperators}
          onChange={setOperators}
        />
        <SliderInput
          label="Доля горячих контактов"
          unit="%"
          min={10}
          max={60}
          step={5}
          value={hotShare}
          baseValue={baseHotShare}
          onChange={setHotShare}
        />
      </div>

      {overCapacity && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-card border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={13} />
          Команда из {operators} человек не успеет прозвонить всю базу — макс.
          возможно {capacity.toLocaleString("ru-RU")} контактов в месяц.
        </p>
      )}

      {/* Output */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ResultCard
          label="Прозвоним"
          value={`${actualContacts.toLocaleString("ru-RU")}`}
          hint={`${reached.toLocaleString("ru-RU")} дозвон`}
        />
        <ResultCard
          label="Целевых"
          value={`${targets.toLocaleString("ru-RU")}`}
          hint={`конверсия ${conversion.toFixed(1)}%`}
          tone="emerald"
        />
        <ResultCard
          label="Стоимость лида"
          value={`${cpl.toLocaleString("ru-RU")} ₽`}
          hint="расчёт по нагрузке команды"
          tone={cplTone === "ok" ? "emerald" : cplTone === "warn" ? "amber" : "rose"}
        />
        <ResultCard
          label="ROI"
          value={`${roi}%`}
          hint={`выручка ≈ ${(revenue / 1000).toFixed(0)} тыс ₽`}
          tone={roiTone === "ok" ? "emerald" : roiTone === "warn" ? "amber" : "rose"}
        />
      </div>

      {/* Рекомендация */}
      {!isReset && (
        <div
          className={cn(
            "mt-4 flex items-start gap-2 rounded-card border p-3 text-xs leading-relaxed",
            roi >= 200
              ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
              : roi >= 100
              ? "border-amber-200 bg-amber-50/60 text-amber-800"
              : "border-rose-200 bg-rose-50/60 text-rose-800"
          )}
        >
          <Info size={14} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            {roi >= 200 ? (
              <p>
                <strong>Сильный сценарий.</strong> ROI {roi}% — выше Q2 2026 (285%).
                {hotShare >= 30 &&
                  " Доля горячих ≥30% — это правильное направление."}
                {overCapacity &&
                  " Однако команда не успевает: либо ограничьте базу до " +
                    capacity.toLocaleString("ru-RU") +
                    ", либо добавьте операторов."}
              </p>
            ) : roi >= 100 ? (
              <p>
                <strong>Окупается, но есть запас.</strong> ROI {roi}% — приемлемо,
                но можно лучше. Попробуйте увеличить долю горячих контактов до
                30–40% или добавить 1 оператора для большего охвата.
              </p>
            ) : (
              <p>
                <strong>Сценарий рискованный.</strong> ROI {roi}% — экономика
                почти не окупается. Главная причина: слишком высокая доля
                холодной базы ({100 - hotShare}%) с конверсией 8%. Снизьте холод
                или прогрейте её email-цепочкой перед обзвоном.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function SliderInput({
  label,
  unit,
  min,
  max,
  step,
  value,
  baseValue,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  baseValue: number;
  onChange: (v: number) => void;
}) {
  const changePct = clamp(
    Math.round(((value - baseValue) / baseValue) * 100),
    -100,
    1000
  );
  return (
    <div className="rounded-card border border-navy/[0.06] bg-navy-50/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-navy/65">{label}</label>
        <div className="text-right">
          <span className="text-sm font-semibold tabular-nums text-navy">
            {value.toLocaleString("ru-RU")}
            {unit === "%" ? "%" : ""}
          </span>
          {changePct !== 0 && (
            <span
              className={cn(
                "ml-1.5 text-[11px] font-medium tabular-nums",
                changePct > 0 ? "text-emerald-600" : "text-amber-600"
              )}
            >
              ({changePct > 0 ? "+" : ""}
              {changePct}%)
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-copper"
      />
      <div className="mt-1 flex justify-between text-[10px] text-navy/45">
        <span>{min.toLocaleString("ru-RU")}</span>
        <span>{baseValue.toLocaleString("ru-RU")} (сейчас)</span>
        <span>{max.toLocaleString("ru-RU")}</span>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "emerald" | "amber" | "rose";
}) {
  const colorClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "amber"
      ? "text-amber-600"
      : tone === "rose"
      ? "text-rose-600"
      : "text-navy";
  return (
    <div className="rounded-card border border-navy/[0.06] bg-white p-3 shadow-soft">
      <p className="text-[11px] uppercase tracking-wider text-navy/55">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          colorClass
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-navy/45">{hint}</p>
    </div>
  );
}
