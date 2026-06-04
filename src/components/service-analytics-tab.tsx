"use client";

import * as React from "react";
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Trophy,
  Target,
  Plus,
  X as XIcon,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  serviceAnalytics,
  type AiInsight,
  type TopTopic,
} from "@/lib/mock-data";

const SAGE = "#7CB342";
const NAVY = "#1F5240";
const COPPER = "#C9633F";
const AMBER = "#F59E0B";
const ROSE = "#EF4444";
const SKY = "#0EA5E9";

const INSIGHT_STYLE: Record<
  AiInsight["severity"],
  { icon: typeof AlertTriangle; bg: string; iconColor: string; border: string }
> = {
  high: {
    icon: AlertTriangle,
    bg: "bg-rose-50/60",
    iconColor: "text-rose-600",
    border: "border-rose-200",
  },
  med: {
    icon: AlertCircle,
    bg: "bg-amber-50/60",
    iconColor: "text-amber-600",
    border: "border-amber-200",
  },
  low: {
    icon: Info,
    bg: "bg-sky-50/60",
    iconColor: "text-sky-600",
    border: "border-sky-200",
  },
  ok: {
    icon: CheckCircle2,
    bg: "bg-emerald-50/60",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
  },
};

const TREND_STYLE: Record<TopTopic["trend"], { Icon: typeof TrendingUp; color: string; bg: string }> = {
  up: { Icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-100" },
  down: { Icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-100" },
  stable: { Icon: Minus, color: "text-navy/55", bg: "bg-navy-50" },
};

export function ServiceAnalyticsTab({ serviceId }: { serviceId: string }) {
  const a = serviceAnalytics[serviceId];
  if (!a) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        Аналитика по этой услуге появится после накопления данных за 30 дней.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-sky-700">
          <Sparkles size={11} /> AI Analytics
        </div>
        <h2 className="mt-2 text-lg font-semibold text-navy">
          Аналитика и прогноз
        </h2>
        <p className="mt-0.5 text-xs text-navy/55">{a.period}</p>
      </div>

      {/* ИИ-инсайты */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
          <Sparkles size={16} className="text-copper" />
          ИИ-инсайты
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {a.insights.map((ins, i) => {
            const s = INSIGHT_STYLE[ins.severity];
            const Icon = s.icon;
            return (
              <Card
                key={i}
                className={cn("border p-4", s.border, s.bg)}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    <Icon size={18} className={s.iconColor} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy">{ins.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-navy/70">
                      {ins.body}
                    </p>
                    {ins.suggestion && (
                      <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white/80 px-2.5 py-2 text-xs leading-relaxed text-navy/80">
                        <Lightbulb size={13} className="mt-0.5 shrink-0 text-copper" />
                        <span>{ins.suggestion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Прогноз нагрузки */}
      <section>
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
              <TrendingUp size={16} className="text-copper" />
              Прогноз нагрузки на 6 месяцев
            </h3>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-700">
              AI Forecast
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={a.forecast.points} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" />
                <XAxis dataKey="month" stroke="#9AA4B8" fontSize={11} />
                <YAxis stroke="#9AA4B8" fontSize={11} />
                <RTooltip />
                {/* Доверительный интервал */}
                <Area
                  type="monotone"
                  dataKey="high"
                  stroke="none"
                  fill={SKY}
                  fillOpacity={0.1}
                  name="Верхняя граница прогноза"
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  stroke="none"
                  fill="white"
                  name="Нижняя граница прогноза"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Факт"
                  stroke={NAVY}
                  strokeWidth={3}
                  dot={{ r: 4, fill: NAVY }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Прогноз"
                  stroke={SKY}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: SKY }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
              Что это значит
            </p>
            <ul className="space-y-1.5">
              {a.forecast.implications.map((imp, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm leading-relaxed text-navy/75"
                >
                  <Target size={13} className="mt-0.5 shrink-0 text-copper" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      {/* Тематический анализ — три колонки */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
          <Lightbulb size={16} className="text-copper" />
          Тематический анализ
        </h3>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Топ-5 тематик */}
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-navy">
              Топ-5 тематик
            </p>
            <ul className="space-y-2">
              {a.topics.top.map((t) => {
                const ts = TREND_STYLE[t.trend];
                const TrendIcon = ts.Icon;
                return (
                  <li
                    key={t.name}
                    className="flex items-center gap-2 rounded-lg bg-navy-50/40 px-2.5 py-1.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-navy">
                      {t.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-navy">
                      {t.currentShare}%
                    </span>
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center gap-0.5 text-[11px]",
                        ts.color
                      )}
                    >
                      <TrendIcon size={11} />
                      {t.delta30d}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Новые тематики */}
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-navy">
              <Plus size={14} className="text-sky-600" />
              Новые тематики
            </p>
            {a.topics.new.length === 0 ? (
              <p className="text-xs text-navy/45">Новых за месяц нет.</p>
            ) : (
              <ul className="space-y-2">
                {a.topics.new.map((n) => (
                  <li
                    key={n.name}
                    className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/40 px-2.5 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-navy">
                        {n.name}
                      </p>
                      <p className="text-[10px] text-navy/55">
                        с {n.appearedAt} · {n.count}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-sky-700">
                      {n.share}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Уходящие тематики */}
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-navy">
              <XIcon size={14} className="text-emerald-600" />
              Уходящие тематики
            </p>
            {a.topics.lost.length === 0 ? (
              <p className="text-xs text-navy/45">Уходящих нет.</p>
            ) : (
              <ul className="space-y-2">
                {a.topics.lost.map((l) => (
                  <li
                    key={l.name}
                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/40 px-2.5 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-navy">
                        {l.name}
                      </p>
                      <p className="text-[10px] text-navy/55">
                        последнее: {l.lastSeen}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-navy/55">
                      {l.previousShare}→{l.currentShare}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>

      {/* Бенчмарки отрасли — сетка карточек по метрикам */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
              <Trophy size={16} className="text-copper" />
              Сравнение с отраслью
            </h3>
            <p className="mt-0.5 text-xs text-navy/55">{a.benchmarks.industry}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {a.benchmarks.items.map((b) => {
            const beatMedian = b.higherIsBetter
              ? b.you >= b.median
              : b.you <= b.median;
            const positionLabel = beatMedian
              ? "Выше медианы"
              : "Ниже медианы";
            const positionCls = beatMedian
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-amber-100 text-amber-700 border-amber-200";
            const youBarColor = beatMedian ? "bg-copper" : "bg-amber-500";

            const max = Math.max(b.you, b.median);
            const youW = (b.you / max) * 100;
            const medianW = (b.median / max) * 100;

            const diff = b.higherIsBetter ? b.you - b.median : b.median - b.you;
            const diffLabel =
              diff > 0
                ? `Лучше медианы на ${Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 1)}${b.unit}`
                : diff < 0
                ? `Хуже медианы на ${Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 1)}${b.unit}`
                : "На уровне медианы";

            return (
              <Card key={b.metric} className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy">{b.metric}</p>
                    {b.tooltip && (
                      <p className="mt-0.5 text-[10px] leading-snug text-navy/45">
                        {b.tooltip}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      positionCls
                    )}
                  >
                    {positionLabel}
                  </span>
                </div>

                {/* Два бара: Вы и Медиана */}
                <div className="space-y-2">
                  <BenchmarkBar
                    label="Вы"
                    value={b.you}
                    unit={b.unit}
                    width={youW}
                    color={youBarColor}
                    bold
                  />
                  <BenchmarkBar
                    label="Медиана"
                    value={b.median}
                    unit={b.unit}
                    width={medianW}
                    color="bg-navy/25"
                  />
                </div>

                <p
                  className={cn(
                    "mt-3 text-xs font-medium",
                    diff > 0 ? "text-emerald-700" : diff < 0 ? "text-amber-700" : "text-navy/55"
                  )}
                >
                  {diffLabel}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* What-if симулятор */}
      {serviceId === "hotline-fte" && <WhatIfSimulator />}
      {serviceId === "hotline-247" && <WhatIfSimulatorMulti />}
    </div>
  );
}

function BenchmarkBar({
  label,
  value,
  unit,
  width,
  color,
  bold,
}: {
  label: string;
  value: number;
  unit: string;
  width: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-14 shrink-0 text-[11px] tabular-nums",
          bold ? "font-semibold text-navy" : "text-navy/55"
        )}
      >
        {label}
      </span>
      <div className="relative h-5 flex-1 rounded-md bg-navy-50/60">
        <div
          className={cn("h-full rounded-md transition-all", color)}
          style={{ width: `${Math.max(width, 8)}%` }}
        />
      </div>
      <span
        className={cn(
          "w-16 shrink-0 text-right text-xs tabular-nums",
          bold ? "font-semibold text-navy" : "text-navy/70"
        )}
      >
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-navy/45">
          {unit}
        </span>
      </span>
    </div>
  );
}

// ───────────────── What-if симулятор (FTE) ─────────────────

const BASE = {
  fte: 4,
  utilization: 0.78,
  sl: 92,
  asa: 22,
  ar: 8.0,
  monthlyVolume: 14320, // принято за месяц по hotline-fte
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function simulate(volumeChangePct: number, fte: number) {
  const baseFte = BASE.fte;
  const newUtil = (BASE.utilization * (1 + volumeChangePct / 100) * baseFte) / fte;
  const deltaUtil = newUtil - BASE.utilization;

  let sl = clamp(BASE.sl - deltaUtil * 250, 0, 100);
  let asa = clamp(BASE.asa + deltaUtil * 150, 2, 600);
  let ar = clamp(BASE.ar + deltaUtil * 80, 0, 100);

  if (newUtil > 0.95) {
    const k = (newUtil - 0.95) * 5;
    sl = clamp(sl * (1 - k), 0, 100);
    asa = clamp(asa + k * 200, 2, 600);
    ar = clamp(ar + k * 30, 0, 100);
  }

  return {
    util: clamp(newUtil * 100, 0, 200),
    sl: Math.round(sl),
    asa: Math.round(asa),
    ar: Number(ar.toFixed(1)),
  };
}

function WhatIfSimulator() {
  // Слайдер хранит абсолютное число обращений в месяц
  const [volAbs, setVolAbs] = React.useState(BASE.monthlyVolume);
  const [fte, setFte] = React.useState(BASE.fte);

  const volChangePct = Math.round(
    ((volAbs - BASE.monthlyVolume) / BASE.monthlyVolume) * 100
  );

  const r = simulate(volChangePct, fte);
  const isReset = volAbs === BASE.monthlyVolume && fte === BASE.fte;

  // Цветовая оценка результата
  const slTone =
    r.sl >= 90 ? "ok" : r.sl >= 80 ? "warn" : "bad";
  const arTone =
    r.ar <= 8 ? "ok" : r.ar <= 15 ? "warn" : "bad";
  const asaTone =
    r.asa <= 25 ? "ok" : r.asa <= 45 ? "warn" : "bad";

  const toneClasses = {
    ok: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-rose-600",
  } as const;

  return (
    <section>
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
              <SlidersHorizontal size={16} className="text-copper" />
              Симулятор сценариев
            </h3>
            <p className="mt-0.5 text-xs text-navy/55">
              Прикиньте, как изменятся показатели при изменении потока или состава команды.
            </p>
          </div>
          <button
            onClick={() => {
              setVolAbs(BASE.monthlyVolume);
              setFte(BASE.fte);
            }}
            disabled={isReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={12} /> Сбросить
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-card border border-navy/[0.06] bg-navy-50/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-navy/65">
                Поток обращений в месяц
              </label>
              <div className="text-right">
                <span className="text-sm font-semibold tabular-nums text-navy">
                  {volAbs.toLocaleString("ru-RU")}
                </span>
                {volChangePct !== 0 && (
                  <span
                    className={cn(
                      "ml-1.5 text-[11px] font-medium tabular-nums",
                      volChangePct > 0 ? "text-rose-600" : "text-emerald-600"
                    )}
                  >
                    ({volChangePct > 0 ? "+" : ""}
                    {volChangePct}%)
                  </span>
                )}
              </div>
            </div>
            <input
              type="range"
              min={8000}
              max={25000}
              step={200}
              value={volAbs}
              onChange={(e) => setVolAbs(Number(e.target.value))}
              className="w-full accent-copper"
            />
            <div className="mt-1 flex justify-between text-[10px] text-navy/45">
              <span>8 000</span>
              <span>{BASE.monthlyVolume.toLocaleString("ru-RU")} (сейчас)</span>
              <span>25 000</span>
            </div>
          </div>

          <div className="rounded-card border border-navy/[0.06] bg-navy-50/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-navy/65">
                Состав команды (FTE)
              </label>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  fte > BASE.fte ? "text-emerald-600" : fte < BASE.fte ? "text-amber-600" : "text-navy"
                )}
              >
                {fte} {fte > BASE.fte && `(+${fte - BASE.fte})`}
                {fte < BASE.fte && `(−${BASE.fte - fte})`}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={fte}
              onChange={(e) => setFte(Number(e.target.value))}
              className="w-full accent-copper"
            />
            <div className="mt-1 flex justify-between text-[10px] text-navy/45">
              <span>2</span>
              <span>3</span>
              <span>4 (сейчас)</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="mt-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-navy/55">
            Прогноз результатов · сейчас vs смоделированный сценарий
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultCard
              label="Service Level"
              baseValue={`${BASE.sl}%`}
              newValue={`${r.sl}%`}
              tone={slTone}
              diff={r.sl - BASE.sl}
              unit="п.п."
              hint="Доля звонков, принятых в нормативе"
            />
            <ResultCard
              label="ASA"
              baseValue={`${BASE.asa} сек`}
              newValue={`${r.asa} сек`}
              tone={asaTone}
              diff={r.asa - BASE.asa}
              unit="сек"
              hint="Среднее время ответа"
              lowerIsBetter
            />
            <ResultCard
              label="AR (пропущ.)"
              baseValue={`${BASE.ar}%`}
              newValue={`${r.ar}%`}
              tone={arTone}
              diff={Number((r.ar - BASE.ar).toFixed(1))}
              unit="п.п."
              hint="Доля брошенных звонков"
              lowerIsBetter
            />
          </div>
        </div>

        {/* Verdict */}
        {!isReset && (
          <div
            className={cn(
              "mt-4 flex items-start gap-2 rounded-card border p-3 text-xs leading-relaxed",
              r.sl >= 90 && r.util <= 90
                ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                : r.sl >= 80
                ? "border-amber-200 bg-amber-50/60 text-amber-800"
                : "border-rose-200 bg-rose-50/60 text-rose-800"
            )}
          >
            <Info size={14} className="mt-0.5 shrink-0" />
            <span className={toneClasses[r.sl >= 90 && r.util <= 90 ? "ok" : r.sl >= 80 ? "warn" : "bad"]}>
              {r.sl >= 90 && r.util <= 90
                ? "Сценарий устойчив: SL держится в норме, команда справляется без рисков."
                : r.sl >= 80 && r.util <= 95
                ? "Сценарий на грани: SL приближается к нижней границе. Стоит подключить дополнительного оператора."
                : "Сценарий не выдерживает: нужны изменения — увеличить FTE, перенаправить часть потока или подключить дополнительные каналы (чат / нейроассистент)."}
            </span>
          </div>
        )}
      </Card>
    </section>
  );
}

// ───────────── What-if симулятор (Мульти / поминутка) ─────────────

const BASE_MULTI = {
  monthlyVolume: 1430, // принято звонков в месяц при текущем пакете
  packageMinutes: 3500, // текущий пакет
  ahtSec: 90, // среднее время разговора на обращение — 1,5 минуты
  baseRho: 0.61, // утилизация пакета сейчас (1 430 × 90 / 60 ≈ 2 145 / 3 500)
  sl: 96, // совпадает с реальным KPI
  asa: 10, // совпадает с реальным KPI
  ar: 3.5,
};

const RATE_PER_MIN = 19.8;
// Возможные пакеты для быстрого выбора через пилюли
const PACKAGE_OPTIONS = [2500, 3000, 3500, 4000, 4500, 5000, 6000, 7500].map(
  (minutes) => ({
    minutes,
    rate: RATE_PER_MIN,
    total: Math.round(minutes * RATE_PER_MIN),
  })
);

// Калибровка: при ρ = 1.0 (использован весь пакет) даём
//   SL ≈ 80/20 (норматив договора), ASA ≈ 12 сек, AR ≈ 10%.
// Выше 1.0 — резкая деградация (перерасход пакета).
function simulateMulti(vol: number, packageMin: number) {
  const usedMin = (vol * BASE_MULTI.ahtSec) / 60;
  const rho = usedMin / packageMin;
  const deltaRho = rho - BASE_MULTI.baseRho; // от 0 в базе

  // Целевые точки на ρ = 1.0:
  //   SL: 96 → 80 за ∆ρ 0.39 ⇒ −41 п.п. за 1 ρ
  //   ASA: 10 → 12 за ∆ρ 0.39 ⇒ +5 сек за 1 ρ
  //   AR: 3.5 → 10 за ∆ρ 0.39 ⇒ +16.7 п.п. за 1 ρ
  let sl = clamp(BASE_MULTI.sl - deltaRho * 41, 0, 100);
  let asa = clamp(BASE_MULTI.asa + deltaRho * 5, 2, 600);
  let ar = clamp(BASE_MULTI.ar + deltaRho * 16.7, 0, 100);

  // Перерасход — дополнительная деградация выше ρ = 1.0
  if (rho > 1.0) {
    const k = rho - 1.0;
    sl = clamp(sl - k * 30, 0, 100);
    asa = clamp(asa + k * 40, 2, 600);
    ar = clamp(ar + k * 20, 0, 100);
  }

  return {
    usedMin: Math.round(usedMin),
    rho,
    overflow: usedMin > packageMin,
    overflowMin: Math.max(0, Math.round(usedMin - packageMin)),
    sl: Math.round(sl),
    asa: Math.round(asa),
    ar: Number(ar.toFixed(1)),
  };
}

function findRecommendedPackage(usedMin: number) {
  // Размер пакета с запасом ≥10%, округлённый вверх до кратного 100 минут
  const target = usedMin / 0.9;
  const minutes = Math.max(100, Math.ceil(target / 100) * 100);
  return {
    minutes,
    rate: RATE_PER_MIN,
    total: Math.round(minutes * RATE_PER_MIN),
  };
}

function describeCurrentPackage(minutes: number) {
  return {
    minutes,
    rate: RATE_PER_MIN,
    total: Math.round(minutes * RATE_PER_MIN),
  };
}

function WhatIfSimulatorMulti() {
  const [volAbs, setVolAbs] = React.useState(BASE_MULTI.monthlyVolume);
  const [pkgMin, setPkgMin] = React.useState(BASE_MULTI.packageMinutes);

  const r = simulateMulti(volAbs, pkgMin);
  const isReset =
    volAbs === BASE_MULTI.monthlyVolume && pkgMin === BASE_MULTI.packageMinutes;

  const currentPackage = describeCurrentPackage(pkgMin);
  const recommendedPkg = findRecommendedPackage(r.usedMin);
  const needsUpgrade = recommendedPkg.minutes > pkgMin;

  const volChangePct = Math.round(
    ((volAbs - BASE_MULTI.monthlyVolume) / BASE_MULTI.monthlyVolume) * 100
  );

  const slTone = r.sl >= 90 ? "ok" : r.sl >= 80 ? "warn" : "bad";
  const arTone = r.ar <= 5 ? "ok" : r.ar <= 10 ? "warn" : "bad";
  const asaTone = r.asa <= 25 ? "ok" : r.asa <= 45 ? "warn" : "bad";

  return (
    <section>
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
              <SlidersHorizontal size={16} className="text-copper" />
              Симулятор сценариев
            </h3>
            <p className="mt-0.5 text-xs text-navy/55">
              Прикиньте, хватит ли вашего пакета минут при изменении потока обращений и какой нужен пакет на вырост.
            </p>
          </div>
          <button
            onClick={() => {
              setVolAbs(BASE_MULTI.monthlyVolume);
              setPkgMin(BASE_MULTI.packageMinutes);
            }}
            disabled={isReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={12} /> Сбросить
          </button>
        </div>

        {/* Input: поток */}
        <div className="rounded-card border border-navy/[0.06] bg-navy-50/30 p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <label className="text-xs font-medium text-navy/65">
              Поток обращений в месяц
            </label>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-sm font-semibold tabular-nums text-navy">
                  {volAbs.toLocaleString("ru-RU")}
                </span>
                {volChangePct !== 0 && (
                  <span
                    className={cn(
                      "text-[11px] font-medium tabular-nums",
                      volChangePct > 0 ? "text-rose-600" : "text-emerald-600"
                    )}
                  >
                    ({volChangePct > 0 ? "+" : ""}
                    {volChangePct}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] tabular-nums text-navy/55">
                ≈ {r.usedMin.toLocaleString("ru-RU")} мин
              </p>
            </div>
          </div>
          <input
            type="range"
            min={200}
            max={5500}
            step={25}
            value={volAbs}
            onChange={(e) => setVolAbs(Number(e.target.value))}
            className="w-full accent-copper"
          />
          <div className="mt-1 flex justify-between text-[10px] text-navy/45">
            <span>200</span>
            <span>{BASE_MULTI.monthlyVolume.toLocaleString("ru-RU")} (сейчас)</span>
            <span>5 500</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-navy/45">
            Минуты считаются как «обращения × ваше среднее время разговора»
            (1 мин 30 сек на обращение по статистике мая 2026).
          </p>
        </div>

        {/* Input: пакет минут — пилюли для прикидки нового пакета */}
        <div className="mt-4 rounded-card border border-navy/[0.06] bg-navy-50/30 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-medium text-navy/65">
              Пакет минут
            </label>
            <span className="text-sm font-semibold tabular-nums text-navy">
              {currentPackage.rate} ₽/мин ·{" "}
              {currentPackage.total.toLocaleString("ru-RU")} ₽/мес
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {PACKAGE_OPTIONS.map((p) => {
              const isCurrent = p.minutes === pkgMin;
              const isBase = p.minutes === BASE_MULTI.packageMinutes;
              return (
                <button
                  key={p.minutes}
                  onClick={() => setPkgMin(p.minutes)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isCurrent
                      ? "bg-navy text-white"
                      : "border border-navy/15 bg-white text-navy/65 hover:bg-navy-50"
                  )}
                >
                  {p.minutes.toLocaleString("ru-RU")} мин
                  {isBase && !isCurrent && (
                    <span className="ml-1 text-[9px] text-navy/40">
                      (сейчас)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-navy/45">
            Изменяете поток слева — справа подсказка про размер пакета. Можно
            и наоборот: выбрать пакет здесь и посмотреть показатели при текущем
            потоке.
          </p>
        </div>

        {/* Output */}
        <div className="mt-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-navy/55">
            Прогноз результатов
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultCard
              label="Service Level"
              baseValue={`${BASE_MULTI.sl}/20`}
              newValue={`${r.sl}/20`}
              tone={slTone}
              diff={r.sl - BASE_MULTI.sl}
              unit="п.п."
              hint="Доля звонков в нормативе (цель по договору 80/20)"
            />
            <ResultCard
              label="Скорость ответа"
              baseValue={`${BASE_MULTI.asa} сек`}
              newValue={`${r.asa} сек`}
              tone={asaTone}
              diff={r.asa - BASE_MULTI.asa}
              unit="сек"
              hint="Среднее время до ответа оператора"
              lowerIsBetter
            />
            <ResultCard
              label="Доля пропущенных"
              baseValue={`${BASE_MULTI.ar}%`}
              newValue={`${r.ar}%`}
              tone={arTone}
              diff={Number((r.ar - BASE_MULTI.ar).toFixed(1))}
              unit="п.п."
              hint="Доля звонков, на которые клиент не дождался ответа"
              lowerIsBetter
            />
          </div>
        </div>

        {/* Verdict */}
        {!isReset && (
          <div
            className={cn(
              "mt-4 flex items-start gap-2 rounded-card border p-3 text-xs leading-relaxed",
              r.overflow
                ? "border-rose-200 bg-rose-50/60 text-rose-800"
                : r.rho > 0.85
                ? "border-amber-200 bg-amber-50/60 text-amber-800"
                : "border-emerald-200 bg-emerald-50/60 text-emerald-800"
            )}
          >
            <Info size={14} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              {r.overflow ? (
                <>
                  <p>
                    <strong>Превышение пакета на {r.overflowMin.toLocaleString("ru-RU")} минут.</strong>{" "}
                    Перерасход тарифицируется по повышенной ставке. Рекомендуем
                    заранее перейти на пакет{" "}
                    <strong>{recommendedPkg.minutes.toLocaleString("ru-RU")} мин</strong> —{" "}
                    {recommendedPkg.total.toLocaleString("ru-RU")} ₽/мес
                    {recommendedPkg.total > currentPackage.total &&
                      ` (+${(recommendedPkg.total - currentPackage.total).toLocaleString("ru-RU")} ₽ к текущему)`}
                    .
                  </p>
                </>
              ) : r.rho > 0.85 ? (
                <>
                  <p>
                    <strong>Близко к лимиту пакета.</strong> Если поток
                    продолжит расти, заранее перейдите на пакет{" "}
                    <strong>{recommendedPkg.minutes.toLocaleString("ru-RU")} мин</strong> —{" "}
                    {recommendedPkg.total.toLocaleString("ru-RU")} ₽/мес.
                  </p>
                </>
              ) : (
                <p>
                  Сценарий укладывается в текущий пакет. Service Level держится
                  в норме. {needsUpgrade && "При устойчивом росте — обсудите расширение пакета с менеджером."}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

function ResultCard({
  label,
  baseValue,
  newValue,
  tone,
  diff,
  unit,
  hint,
  lowerIsBetter = false,
}: {
  label: string;
  baseValue: string;
  newValue: string;
  tone: "ok" | "warn" | "bad";
  diff: number;
  unit: string;
  hint: string;
  lowerIsBetter?: boolean;
}) {
  const isImproved = lowerIsBetter ? diff < 0 : diff > 0;
  const isSame = diff === 0;
  const diffColor = isSame
    ? "text-navy/45"
    : isImproved
    ? "text-emerald-600"
    : "text-rose-600";
  const toneClasses = {
    ok: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-rose-600",
  } as const;

  return (
    <div className="rounded-card border border-navy/[0.06] bg-white p-3">
      <p className="text-[11px] uppercase tracking-wider text-navy/55">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneClasses[tone])}>
        {newValue}
      </p>
      <div className="mt-1 flex items-center justify-between text-[11px]">
        <span className="text-navy/45">было {baseValue}</span>
        <span className={diffColor}>
          {isSame ? "—" : `${diff > 0 ? "+" : ""}${diff} ${unit}`}
        </span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-navy/40">{hint}</p>
    </div>
  );
}
