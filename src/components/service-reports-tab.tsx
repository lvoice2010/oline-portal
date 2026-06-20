"use client";

import * as React from "react";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  ShieldCheck,
  Bell,
  AlertTriangle,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  serviceReports,
  calls,
  dialogs,
  type ReportTone,
  type ServiceReport,
} from "@/lib/mock-data";
import { AiTopicsBreakdown } from "@/components/ai-topics-breakdown";

const NAVY = "#1F5240";
const SAGE = "#7CB342";
const AMBER = "#F59E0B";
const SKY = "#0EA5E9";

const TONE_TEXT: Record<ReportTone, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  ok: "text-emerald-600",
  warn: "text-amber-600",
  neutral: "text-navy/60",
};

function DeltaIcon({ tone, size = 12 }: { tone: ReportTone; size?: number }) {
  if (tone === "up" || tone === "ok")
    return <TrendingUp size={size} className="shrink-0" />;
  if (tone === "down" || tone === "warn")
    return <TrendingDown size={size} className="shrink-0" />;
  return <Minus size={size} className="shrink-0" />;
}

function heatColor(v: number, max: number) {
  if (v === 0) return "#F1F4F2";
  const t = Math.min(1, Math.max(0, v / max));
  // teal → blue → violet → pink
  const hue = 170 + t * 160;
  const sat = 65 + t * 15;
  const light = 72 - t * 26;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

type PeriodKey = "today" | "yesterday" | "week" | "month" | "custom";

const PERIOD_OPTIONS: { id: PeriodKey; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "yesterday", label: "Вчера" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
];


export function ServiceReportsTab({ serviceId }: { serviceId: string }) {
  const report = serviceReports[serviceId];
  const [momMode, setMomMode] = React.useState<"closed" | "mtd">("closed");
  const [period, setPeriod] = React.useState<PeriodKey>("month");
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState("2026-04-15");
  const [customTo, setCustomTo] = React.useState("2026-05-15");

  if (!report) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        Отчётность по этой услуге начнёт собираться после запуска. Сейчас
        накопленных данных недостаточно для аналитического отчёта.
      </Card>
    );
  }

  const heatMax = Math.max(...report.heatmap.data.flat());

  // Для нейроассистента темы считаются по диалогам, для голосовых линий — по звонкам.
  // Фильтрация по периоду живёт прямо в JSX-блоке ниже (разные типы — разные ветки).
  const isChatbot = serviceId === "chatbot";

  return (
    <div className="space-y-6">

      {/* Шапка периода + 3 блока KPI — единая зелёная зона */}
      {(() => {
        const snap = report.kpisByPeriod?.[period];
        const rangeLabel = snap?.rangeLabel ?? report.kpisCurrentMonthLabel ?? "";
        const compareLabel = snap?.compareLabel ?? "";
        return (
          <div className="rounded-card border border-copper/25 bg-copper/[0.06] p-5 space-y-4 shadow-soft">
            {/* Заголовок — описание периода + переключатель */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-copper">
                  Период просмотра
                </p>
                <p className="mt-0.5 text-sm font-medium text-navy">
                  {rangeLabel}
                </p>
                {compareLabel && (
                  <p className="mt-0.5 text-[11px] text-navy/55">
                    сравнение {compareLabel}
                  </p>
                )}
              </div>
              <div className="relative flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1 rounded-xl border border-navy/15 bg-white p-1">
                  {PERIOD_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPeriod(p.id);
                        if (p.id === "custom") setCustomOpen(true);
                        else setCustomOpen(false);
                      }}
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
                {customOpen && period === "custom" && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setCustomOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-navy/10 bg-white p-4 shadow-soft-lg">
                      <p className="mb-2 text-xs font-semibold text-navy">
                        Выберите свой период
                      </p>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-navy/60">
                          С
                          <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-navy/15 px-3 py-1.5 text-sm text-navy"
                          />
                        </label>
                        <label className="block text-[11px] text-navy/60">
                          По
                          <input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-navy/15 px-3 py-1.5 text-sm text-navy"
                          />
                        </label>
                        <button
                          onClick={() => setCustomOpen(false)}
                          className="mt-2 w-full rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-light"
                        >
                          Применить
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] text-navy/45">
                        Данные пересчитываются за выбранный диапазон
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Воронка + Качество + Переведённые — три блока внутри той же зоны */}
            <KpiFunnel
              kpis={snap?.kpis ?? report.kpis}
              transfers={snap?.transfers ?? report.transfers}
            />
          </div>
        );
      })()}

      {/* Часовая карта нагрузки + (опционально) Каналы / Текст-голос у нейроассистента */}
      <div
        className={cn(
          "grid grid-cols-1 gap-5",
          report.channels && report.channels.items.length > 0 && "xl:grid-cols-4"
        )}
      >
        {/* Текст vs голос — самый левый блок (для нейроассистента) */}
        {!report.operatorStats && report.channels && (() => {
          const phoneChannel = report.channels.items.find(
            (c) => c.name.toLowerCase() === "телефон"
          );
          const voiceCount = phoneChannel?.count ?? 0;
          const voicePct = phoneChannel?.pct ?? 0;
          const textCount = report.channels.total - voiceCount;
          const textPct = 100 - voicePct;
          return (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-navy">
                Текст и голос
                <span className="ml-1.5 text-[11px] font-normal text-navy/45">
                  · по типу
                </span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
                      Текстовые
                    </p>
                    <span className="text-xs font-semibold tabular-nums text-navy/75">
                      {textPct}%
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                    {textCount.toLocaleString("ru-RU")}
                  </p>
                  <p className="text-[11px] text-navy/45">диалогов</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${textPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
                      Голосовые
                    </p>
                    <span className="text-xs font-semibold tabular-nums text-navy/75">
                      {voicePct}%
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                    {voiceCount.toLocaleString("ru-RU")}
                  </p>
                  <p className="text-[11px] text-navy/45">
                    диалогов · ≈ {Math.round(voiceCount * 1.5).toLocaleString("ru-RU")} мин
                  </p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${voicePct}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Каналы обращений — рядом с текстом/голосом */}
        {!report.operatorStats && report.channels && (
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-navy">
              Каналы обращений
              <span className="ml-1.5 text-[11px] font-normal text-navy/45">
                · всего {report.channels.total.toLocaleString("ru-RU")}
              </span>
            </h3>
            <div className="space-y-3">
              {report.channels.items.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-navy">{c.name}</span>
                    <span className="text-xs tabular-nums text-navy/60">
                      <span className="font-semibold text-navy">
                        {c.count.toLocaleString("ru-RU")}
                      </span>{" "}
                      · {c.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                    <div
                      className="h-full rounded-full bg-copper"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Теплокарта (col-span-2 у нейроассистента, чтобы занять оставшуюся ширину) */}
        <Card
          className={cn(
            "p-5",
            !report.operatorStats && report.channels && "xl:col-span-2"
          )}
        >
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-navy/65">
              Нагрузка — почасовая карта
            </h3>
            <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-navy/65">
              Неделя
            </span>
          </div>
          <div>
            <div className="flex">
              <div className="w-6 shrink-0" />
              {report.heatmap.hours.map((h) => (
                <div
                  key={h}
                  className="flex-1 pb-1 text-center text-[9px] text-navy/45"
                >
                  {h}
                </div>
              ))}
            </div>
            {report.heatmap.data.map((row, d) => (
              <div key={d} className="flex items-center">
                <div className="w-6 shrink-0 pr-1 text-right text-[10px] font-medium text-navy/55">
                  {report.heatmap.days[d]}
                </div>
                {row.map((v, h) => (
                  <div
                    key={h}
                    title={`${report.heatmap.days[d]}, ${report.heatmap.hours[h]}:00 — ${v} звонков`}
                    className={cn(
                      "m-[1px] flex h-6 flex-1 items-center justify-center rounded-[3px] text-[9px] font-medium tabular-nums",
                      v >= heatMax * 0.4 ? "text-white" : "text-navy/65"
                    )}
                    style={{ background: heatColor(v, heatMax) }}
                  >
                    {v > 0 ? v : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-navy/55">
            <span>Мало звонков</span>
            <div
              className="h-2 w-32 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, hsl(170, 65%, 72%), hsl(210, 70%, 60%), hsl(260, 75%, 53%), hsl(330, 80%, 46%))",
              }}
            />
            <span>Пик</span>
            <span className="ml-auto text-navy/40">в ячейках — звонков</span>
          </div>
        </Card>

      </div>

      {/* Месяц к месяцу (компактно) + Динамика 12 месяцев */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-navy">Месяц к месяцу</h3>
            {report.monthOverMonthMtd && (
              <div className="flex gap-0.5 rounded-lg border border-navy/15 bg-white p-0.5">
                <button
                  onClick={() => setMomMode("closed")}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                    momMode === "closed"
                      ? "bg-navy text-white"
                      : "text-navy/60 hover:bg-navy-50"
                  )}
                  title="Сравнение полностью закрытых месяцев"
                >
                  Закрытые
                </button>
                <button
                  onClick={() => setMomMode("mtd")}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                    momMode === "mtd"
                      ? "bg-navy text-white"
                      : "text-navy/60 hover:bg-navy-50"
                  )}
                  title={`Текущий месяц на ${report.mtdDayCount} дней vs прошлый месяц за тот же диапазон`}
                >
                  Текущий MTD
                </button>
              </div>
            )}
          </div>
          {momMode === "mtd" && (
            <p className="mb-2 text-[10px] text-navy/55">
              Сравнение текущего месяца за {report.mtdDayCount} дней с тем же
              окном предыдущего месяца — чтобы числа были сопоставимы.
            </p>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-navy/[0.08] text-left text-[10px] uppercase tracking-wider text-navy/55">
                <th className="pb-1.5 font-medium">Показатель</th>
                <th className="pb-1.5 font-medium text-right">
                  {momMode === "mtd" ? report.mtdCurrentLabel : report.currentLabel.split(" ")[0]}
                </th>
                <th className="pb-1.5 font-medium text-right">
                  {momMode === "mtd" ? report.mtdPreviousLabel : report.previousLabel.split(" ")[0]}
                </th>
                <th className="pb-1.5 font-medium text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {(momMode === "mtd" && report.monthOverMonthMtd
                ? report.monthOverMonthMtd
                : report.monthOverMonth
              ).map((r) => (
                <tr
                  key={r.metric}
                  className="border-b border-navy/[0.04] last:border-0"
                >
                  <td className="py-1.5 text-navy/75">{r.metric}</td>
                  <td className="py-1.5 text-right font-medium text-navy tabular-nums">
                    {r.current}
                  </td>
                  <td className="py-1.5 text-right text-navy/55 tabular-nums">
                    {r.prev}
                  </td>
                  <td
                    className={cn(
                      "py-1.5 text-right text-[11px] font-medium",
                      TONE_TEXT[r.tone]
                    )}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      <DeltaIcon tone={r.tone} size={10} /> {r.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {report.monthlyDynamics12 && (() => {
          // У сервисов без понятия «пропущенный» (например, нейроассистент)
          // линию и легенду «Пропущенные» не показываем.
          const hasAbandoned = report.monthlyDynamics12.some(
            (p) => p.abandoned !== undefined || p.forecastAbandoned !== undefined
          );
          // Подписи для голосовых линий и для AI-чата отличаются по смыслу:
          //   голос: Входящие → Принятые → Пропущенные
          //   AI-чат: Принятых (= входящих) → Обработано с помощью ИИ
          const labelIncoming = hasAbandoned
            ? "Входящие"
            : "Принятых (= входящих)";
          const labelAnswered = hasAbandoned
            ? "Принятые"
            : "Обработано с помощью ИИ";
          return (
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-navy">
                Помесячная динамика
                <span className="ml-1.5 text-[11px] font-normal text-navy/45">
                  · 12 месяцев + прогноз
                </span>
              </h3>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-700">
                Тренд + прогноз
              </span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={report.monthlyDynamics12}
                  margin={{ left: -12, right: 8, top: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" />
                  <XAxis
                    dataKey="month"
                    stroke="#9AA4B8"
                    fontSize={10}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#9AA4B8" fontSize={10} />
                  <RTooltip />
                  {/* Фактические данные */}
                  <Line
                    type="monotone"
                    dataKey="incoming"
                    name={labelIncoming}
                    stroke={NAVY}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="answered"
                    name={labelAnswered}
                    stroke={SAGE}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls={false}
                  />
                  {hasAbandoned && (
                    <Line
                      type="monotone"
                      dataKey="abandoned"
                      name="Пропущенные"
                      stroke={AMBER}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      connectNulls={false}
                    />
                  )}
                  {/* Прогноз — пунктир */}
                  <Line
                    type="monotone"
                    dataKey="forecastIncoming"
                    name={`Прогноз: ${labelIncoming.toLowerCase()}`}
                    stroke={NAVY}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastAnswered"
                    name={`Прогноз: ${labelAnswered.toLowerCase()}`}
                    stroke={SAGE}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                    connectNulls={false}
                  />
                  {hasAbandoned && (
                    <Line
                      type="monotone"
                      dataKey="forecastAbandoned"
                      name="Прогноз пропущ."
                      stroke={AMBER}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-navy/55">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: NAVY }} />
                {labelIncoming}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: SAGE }} />
                {labelAnswered}
              </span>
              {hasAbandoned && (
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: AMBER }} />
                  Пропущенные
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-navy/45">
                ─ ─ прогноз
              </span>
            </div>
          </Card>
          );
        })()}
      </div>

      {/* Ключевой вывод месяца */}
      <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-amber-50/30 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Lightbulb size={18} className="text-amber-600" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">
              Ключевой вывод периода
            </p>
            <p className="mt-1 text-sm leading-relaxed text-navy">
              {report.insight}
            </p>
          </div>
        </div>
      </Card>

      {/* Темы обращений — распределение ИИ-карточек по категориям.
          У блока собственный селектор периода, не привязан к шапке услуги. */}
      {isChatbot ? (
        <AiTopicsBreakdown
          items={dialogs.filter((d) => d.serviceId === serviceId)}
          itemNoun="диалогов"
          getDate={(it) => it.date}
          getCategory={(it) => it.ai?.category}
          getSubcategory={(it) => it.ai?.subcategory}
        />
      ) : (
        <AiTopicsBreakdown
          items={calls.filter((c) => c.serviceId === serviceId)}
          itemNoun="звонков"
          getDate={(it) => it.date}
          getCategory={(it) => it.ai?.category}
          getSubcategory={(it) => it.ai?.subcategory}
        />
      )}

      {/* Отчёт за год */}
      {report.yearlyReports && <YearlyReportTable yearlyReports={report.yearlyReports} />}

      {/* Прогноз + Рекомендации */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Activity size={14} />
            </span>
            <h3 className="text-sm font-semibold text-navy">
              Прогноз на следующий месяц
            </h3>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-700">
              AI
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {report.forecast.map((f) => {
              const tone =
                f.tone === "ok"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : f.tone === "warn"
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-navy/[0.06] bg-navy-50/40";
              return (
                <div
                  key={f.label}
                  className={cn("rounded-card border p-3", tone)}
                >
                  <p className="text-[11px] uppercase tracking-wider text-navy/55">
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold text-navy">
                    {f.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-navy/60">
                    {f.note}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-copper/15 text-copper">
              <Lightbulb size={14} />
            </span>
            <h3 className="text-sm font-semibold text-navy">Рекомендации</h3>
          </div>
          <div className="space-y-3">
            {report.recommendations.map((r, i) => (
              <div
                key={i}
                className="rounded-card border border-navy/[0.06] bg-white p-3 shadow-soft"
              >
                <p className="text-sm font-semibold text-navy">{r.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-navy/70">
                  {r.body}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-copper/10 px-2 py-0.5 text-[11px] font-medium text-copper">
                  <ShieldCheck size={11} /> {r.effect}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────── Воронка обработки + качество обслуживания ───────────

function parseNum(s: string): number {
  return Number(s.replace(/\D/g, ""));
}

function KpiFunnel({
  kpis,
  transfers,
}: {
  kpis: { label: string; value: string; delta: string; tone: ReportTone }[];
  transfers?: ServiceReport["transfers"];
}) {
  const byLabel = (l: string) => kpis.find((k) => k.label === l);
  const incoming = byLabel("Входящие");
  const accepted = byLabel("Принято");
  const missed = byLabel("Пропущено");
  const sl = byLabel("Service Level");
  const asa = byLabel("Ср. ответ (ASA)");
  const aht = byLabel("Ср. обработка (AHT)");

  if (!incoming || !accepted) return null;

  const incNum = parseNum(incoming.value);
  const accNum = parseNum(accepted.value);
  const missNum = missed ? parseNum(missed.value) : 0;

  const accPct = (accNum / incNum) * 100;
  const missPct = missed ? (missNum / incNum) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Воронка */}
      <Card className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
              Воронка обработки
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums text-navy">
                {incoming.value}
              </span>
              <span className="text-xs text-navy/55">входящих за период</span>
            </p>
            <p
              className={cn(
                "mt-0.5 inline-flex items-center gap-1 text-xs",
                TONE_TEXT[incoming.tone]
              )}
            >
              <DeltaIcon tone={incoming.tone} /> {incoming.delta}
            </p>
          </div>
        </div>

        {/* Стэк-бар: принято + пропущено (если пропущено есть) */}
        <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${accPct}%` }}
            title={`Принято: ${accNum}`}
          />
          {missed && (
            <div
              className="h-full bg-amber-500"
              style={{ width: `${missPct}%` }}
              title={`Пропущено: ${missNum}`}
            />
          )}
        </div>

        {/* Колонки — принято всегда, пропущено по наличию */}
        <div
          className={cn(
            "mt-4 grid gap-3",
            missed ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          <div className="rounded-card border border-emerald-200 bg-emerald-50/50 p-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
                Принято
              </p>
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
              {accPct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-navy/55 tabular-nums">
              {accepted.value} из {incoming.value}
            </p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-xs",
                TONE_TEXT[accepted.tone]
              )}
            >
              <DeltaIcon tone={accepted.tone} /> {accepted.delta}
            </p>
          </div>

          {missed && (
            <div className="rounded-card border border-amber-200 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">
                  Пропущено
                </p>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                {missPct.toFixed(1)}%
              </p>
              <p className="text-[11px] text-navy/55 tabular-nums">
                {missed.value} из {incoming.value}
              </p>
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-xs",
                  TONE_TEXT[missed.tone]
                )}
              >
                <DeltaIcon tone={missed.tone} /> {missed.delta}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Качество обслуживания */}
      <Card className="p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
          Качество обслуживания
        </p>
        <div className="mt-3 space-y-3">
          {sl && (
            <QualityRow
              label="Service Level"
              hint="доля звонков в нормативе"
              value={sl.value}
              delta={sl.delta}
              tone={sl.tone}
            />
          )}
          {asa && (
            <QualityRow
              label="Скорость ответа"
              hint="среднее время до ответа"
              value={asa.value}
              delta={asa.delta}
              tone={asa.tone}
            />
          )}
          {aht && (
            <QualityRow
              label="Время обработки"
              hint="на одно обращение"
              value={aht.value}
              delta={aht.delta}
              tone={aht.tone}
            />
          )}
        </div>
      </Card>

      {/* Переведённые вызовы */}
      {transfers && <TransfersBlock transfers={transfers} />}
    </div>
  );
}

const RU_MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const CURRENT_MONTH_IDX = 5; // 20 июня 2026 → текущий (незавершённый) месяц = Июн (индекс 5)

function YearlyReportTable({
  yearlyReports,
}: {
  yearlyReports: NonNullable<ServiceReport["yearlyReports"]>;
}) {
  const years = Object.keys(yearlyReports).sort().reverse();
  const [year, setYear] = React.useState(years[0]);
  const data = yearlyReports[year];
  const monthsFilled = data.rows[0]?.values.filter((v) => v !== null).length ?? 12;
  const isCurrent = year === "2026";

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-navy">
          Годовой отчёт по месяцам
        </h3>
        <div className="flex gap-1 rounded-lg border border-navy/15 bg-white p-0.5">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                year === y
                  ? "bg-navy text-white"
                  : "text-navy/65 hover:bg-navy-50"
              )}
            >
              {y}
              {y === "2026" && (
                <span className="ml-1 text-[9px] opacity-70">тек.</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-navy/[0.08] text-[10px] uppercase tracking-wider text-navy/55">
              <th className="sticky left-0 bg-white pb-1.5 pr-3 text-left font-medium">
                Показатель
              </th>
              {RU_MONTHS.map((m, i) => (
                <th
                  key={m}
                  className={cn(
                    "pb-1.5 pl-2 pr-1 text-right font-medium",
                    isCurrent && i === CURRENT_MONTH_IDX && "text-copper"
                  )}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.metric} className="border-b border-navy/[0.04] last:border-0">
                <td className="sticky left-0 bg-white py-1.5 pr-3 text-navy/75">
                  {row.metric}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      "py-1.5 pl-2 pr-1 text-right tabular-nums",
                      v === null && "text-navy/25",
                      v !== null && "text-navy/80",
                      isCurrent && i === CURRENT_MONTH_IDX && "font-semibold text-copper"
                    )}
                  >
                    {v === null ? "—" : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-card border border-emerald-200 bg-emerald-50/50 p-3">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
              Вывод по {year} году
              {isCurrent && (
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] uppercase">
                  тек. · {monthsFilled} мес
                </span>
              )}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-navy/80">
              {data.insight}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TransfersBlock({
  transfers,
}: {
  transfers: NonNullable<ServiceReport["transfers"]>;
}) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
        Переведённые вызовы
      </p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-navy">
          {transfers.total}
        </span>
        <span className="text-xs font-medium text-sky-700">
          {transfers.pctOfIncoming.toFixed(1)}% от входящих
        </span>
      </p>
      <p
        className={cn(
          "mt-0.5 inline-flex items-center gap-1 text-xs",
          TONE_TEXT[transfers.deltaTone]
        )}
      >
        <DeltaIcon tone={transfers.deltaTone} /> {transfers.deltaLabel}
      </p>

      <p className="mt-4 text-[10px] uppercase tracking-wider text-navy/45">
        Куда уходят звонки 2-й линии
      </p>
      <ul className="mt-2 space-y-1.5">
        {transfers.destinations.map((d) => (
          <li key={d.name}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-navy/80">
                {d.name}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-navy">
                {d.count}
              </span>
              <span className="shrink-0 w-8 text-right text-[11px] font-medium tabular-nums text-sky-700">
                {d.pct}%
              </span>
            </div>
            <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-navy-50">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${d.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function QualityRow({
  label,
  hint,
  value,
  delta,
  tone,
}: {
  label: string;
  hint: string;
  value: string;
  delta: string;
  tone: ReportTone;
}) {
  return (
    <div className="border-b border-navy/[0.06] pb-3 last:border-0 last:pb-0">
      <p className="text-[11px] uppercase tracking-wider text-navy/45">
        {label}
      </p>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold tabular-nums text-navy">{value}</p>
        <p
          className={cn(
            "inline-flex items-center gap-0.5 text-xs",
            TONE_TEXT[tone]
          )}
        >
          <DeltaIcon tone={tone} size={11} /> {delta}
        </p>
      </div>
      <p className="text-[10px] text-navy/40">{hint}</p>
    </div>
  );
}
