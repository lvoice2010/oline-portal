"use client";

import * as React from "react";
import {
  Target,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  Calendar,
  PhoneCall,
  Wallet,
  Bot,
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
import { outboundReports, type OutboundReport } from "@/lib/mock-data";
import { outboundCampaignDates } from "@/lib/demo-clock";

const NAVY = "#1F5240";
const SAGE = "#7CB342";
const COPPER = "#C9633F";

// Демо-часы: сроки кампании, недели и «сегодня» — от реальной даты.
export function demoizeOutboundReport(report: OutboundReport, now: Date = new Date()): OutboundReport {
  const d = outboundCampaignDates(now, report.campaign.demoWindow);
  const fixEnd = (s: string) => s.replace("30 июня", d.endLabel);
  return {
    ...report,
    campaign: { ...report.campaign, startDate: d.startDate, endDate: d.endDate, today: d.today },
    weeklyDynamics: report.weeklyDynamics.map((w, i) => ({ ...w, week: d.weekLabels[i] ?? w.week })),
    forecast: report.forecast.map((f) => ({ ...f, label: fixEnd(f.label), value: fixEnd(f.value) })),
  };
}

export function OutboundReportTab({ serviceId }: { serviceId: string }) {
  const raw = outboundReports[serviceId];
  const report = React.useMemo(() => (raw ? demoizeOutboundReport(raw) : raw), [raw]);
  if (!report) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        Отчёт по этой кампании появится после первого закрытого периода.
      </Card>
    );
  }

  const basePct = Math.round(
    (report.campaign.baseProcessed / report.campaign.baseTotal) * 100
  );
  const remaining = report.campaign.baseTotal - report.campaign.baseProcessed;
  const reachedNum = report.funnel.reached;
  const notReachedNum = report.funnel.notReached;
  const reachedPct = report.funnel.reachedPct;
  const notReachedPct = report.funnel.notReachedPct;
  const targetsPct = (report.funnel.targets / report.funnel.reached) * 100;
  // Контакты в процессе — набраны, но статус ещё не финальный (уйдут на следующий круг).
  // «Обработано» = дозвон + нет дозвона (финал); шкала не доходит до 100%, пока идут круги.
  const inProgress = report.funnel.inProgress ?? 0;
  const processedNum = reachedNum + notReachedNum; // обработано (получен итог)
  const takenIntoWork = processedNum + inProgress; // взято в обзвон
  const processedPct = takenIntoWork > 0 ? Math.round((processedNum / takenIntoWork) * 100) : 0;
  const barReached = takenIntoWork > 0 ? (reachedNum / takenIntoWork) * 100 : 0;
  const barNotReached = takenIntoWork > 0 ? (notReachedNum / takenIntoWork) * 100 : 0;
  const barInProgress = takenIntoWork > 0 ? (inProgress / takenIntoWork) * 100 : 0;
  const inProgressPct = Math.round(barInProgress);
  const totalReachedByAttempt =
    report.funnel.reachedByAttempt.first +
    report.funnel.reachedByAttempt.second +
    report.funnel.reachedByAttempt.third;

  return (
    <div className="space-y-6">
      {/* 1. ПРОГРЕСС КАМПАНИИ — баннер сверху */}
      <Card className="overflow-hidden border-copper/25 bg-gradient-to-r from-copper/[0.08] via-white to-emerald-50/40 p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-copper">
              <Target size={13} /> Прогресс кампании
            </p>
            <h2 className="mt-1 text-xl font-semibold text-navy">
              {report.campaign.name}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/55">
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {report.campaign.startDate} →{" "}
                {report.campaign.endDate}
              </span>
              <span>сегодня · {report.campaign.today}</span>
            </p>
          </div>
          <div
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              report.campaign.onTrack
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            {report.campaign.onTrack ? "✓ Идём по плану" : "⚠ Отстаём от плана"}
          </div>
        </div>

        {/* Прогресс-бар базы */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm text-navy/70">
              Обработано:{" "}
              <span className="font-semibold tabular-nums text-navy">
                {report.campaign.baseProcessed.toLocaleString("ru-RU")}
              </span>{" "}
              из{" "}
              <span className="font-medium tabular-nums text-navy/85">
                {report.campaign.baseTotal.toLocaleString("ru-RU")}
              </span>{" "}
              контактов базы
            </p>
            <p className="text-sm font-semibold tabular-nums text-copper">
              {basePct}%
            </p>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-navy/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-copper transition-all"
              style={{ width: `${basePct}%` }}
            />
          </div>
        </div>

        {/* 6 ключевых метрик */}
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <ProgressMetric
            icon={<PhoneCall size={13} />}
            label="Осталось контактов"
            value={remaining.toLocaleString("ru-RU")}
            tone="navy"
          />
          <ProgressMetric
            icon={<Calendar size={13} />}
            label="Дней до финиша"
            value={String(report.campaign.daysLeft)}
            tone="navy"
          />
          <ProgressMetric
            icon={<TrendingUp size={13} />}
            label="Темп / день"
            value={String(report.campaign.pacePerDay)}
            tone="navy"
          />
          <ProgressMetric
            icon={<Target size={13} />}
            label="Целевых получено"
            value={report.campaign.leads.toLocaleString("ru-RU")}
            tone="emerald"
          />
          <ProgressMetric
            icon={<Wallet size={13} />}
            label="Стоимость лида"
            value={`${report.campaign.costPerLead.toLocaleString("ru-RU")} ₽`}
            tone="navy"
          />
          <ProgressMetric
            icon={<TrendingUp size={13} />}
            label="ROI"
            value={`${report.campaign.roi}%`}
            tone="emerald"
          />
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] text-navy/55">
          <ShieldCheck size={12} className="mt-0.5 shrink-0 text-emerald-600" />
          {report.campaign.statusNote}
        </p>
      </Card>

      {/* 2. ВОРОНКА ДОЗВОНА + КАЧЕСТВО — 2 блока */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Воронка */}
        <Card className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
            Воронка дозвона
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-navy">
              {takenIntoWork.toLocaleString("ru-RU")}
            </span>
            <span className="text-xs text-navy/55">контактов в работе</span>
          </p>
          <p className="mt-0.5 text-[11px] text-navy/55 tabular-nums">
            обработано {processedNum.toLocaleString("ru-RU")} ({processedPct}%) · в
            процессе {inProgress.toLocaleString("ru-RU")}
          </p>

          {/* Стек-бар: дозвон + нет дозвона + в процессе (ещё в кругах обзвона) */}
          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-navy-50">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${barReached}%` }}
              title={`Дозвон: ${reachedNum}`}
            />
            <div
              className="h-full bg-rose-400"
              style={{ width: `${barNotReached}%` }}
              title={`Нет дозвона (после 3 попыток): ${notReachedNum}`}
            />
            <div
              className="h-full bg-amber-400"
              style={{ width: `${barInProgress}%` }}
              title={`В процессе (уйдут на следующий круг): ${inProgress}`}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-navy/50">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> дозвон
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> нет дозвона
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> в процессе
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-card border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
                  Дозвон
                </p>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                {reachedPct}%
              </p>
              <p className="text-[11px] text-navy/55 tabular-nums">
                {reachedNum.toLocaleString("ru-RU")} · от обработанных
              </p>
            </div>
            <div className="rounded-card border border-rose-200 bg-rose-50/50 p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-rose-700">
                  Нет дозвона
                </p>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                {notReachedPct}%
              </p>
              <p className="text-[11px] text-navy/55 tabular-nums">
                {notReachedNum.toLocaleString("ru-RU")} · после 3 попыток
              </p>
            </div>
            <div className="rounded-card border border-amber-200 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">
                  В процессе
                </p>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                {inProgress.toLocaleString("ru-RU")}
              </p>
              <p className="text-[11px] text-navy/55 tabular-nums">
                ещё в обзвоне · {inProgressPct}%
              </p>
            </div>
          </div>

          {/* На какой попытке дозвонились */}
          <div className="mt-4 rounded-card border border-navy/[0.06] bg-navy-50/40 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
              Дозвон по попыткам
            </p>
            <div className="mt-2 space-y-1.5">
              {[
                {
                  label: "1-я попытка",
                  count: report.funnel.reachedByAttempt.first,
                },
                {
                  label: "2-я попытка",
                  count: report.funnel.reachedByAttempt.second,
                },
                {
                  label: "3-я попытка",
                  count: report.funnel.reachedByAttempt.third,
                },
              ].map((r) => {
                const pct = (r.count / totalReachedByAttempt) * 100;
                return (
                  <div key={r.label} className="space-y-0.5">
                    <div className="flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="text-navy/75">{r.label}</span>
                      <span className="tabular-nums text-navy/60">
                        <span className="font-semibold text-navy">
                          {r.count.toLocaleString("ru-RU")}
                        </span>{" "}
                        · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-navy-50">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Конверсия в цель */}
          <div className="mt-4 rounded-card border border-copper/30 bg-copper/[0.06] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-copper">
                Целевых действий
              </p>
              <span className="text-xs font-semibold tabular-nums text-copper">
                {report.funnel.conversionPct.toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
              {report.funnel.targets.toLocaleString("ru-RU")}
            </p>
            <p className="text-[11px] text-navy/55">
              {targetsPct.toFixed(1)}% от дозвонившихся
            </p>
          </div>
        </Card>

        {report.ai ? (
          <AiWorkCard report={report} />
        ) : (
        <Card className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
            Качество звонков
          </p>
          <div className="mt-3 space-y-3">
            <QualityRow
              label="Среднее время разговора"
              value={report.quality.avgTalkTime}
              hint="норма 2:30"
            />
            <QualityRow
              label="Время до результата"
              value={report.quality.timeToResult}
              hint="на целевом звонке"
            />
          </div>
        </Card>
        )}

      </div>

      {report.outcomes && <OutcomesCard report={report} />}

      {/* Динамика по неделям — на всю ширину после удаления теплокарты */}
      <div>
        <Card className="p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-navy">
              Динамика по неделям кампании
              <span className="ml-1.5 text-[11px] font-normal text-navy/45">
                · {weeksLabel(report.weeklyDynamics.length)}
              </span>
            </h3>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-700">
              Факт + прогноз
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={report.weeklyDynamics}
                margin={{ left: -12, right: 8, top: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" />
                <XAxis
                  dataKey="week"
                  stroke="#9AA4B8"
                  fontSize={9}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="#9AA4B8" fontSize={10} />
                <RTooltip />
                <Line
                  type="monotone"
                  dataKey="attempts"
                  name="Попыток"
                  stroke={NAVY}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="reached"
                  name="Дозвон"
                  stroke={SAGE}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="targets"
                  name="Целевых"
                  stroke={COPPER}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecastAttempts"
                  name="Прогноз попыток"
                  stroke={NAVY}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecastReached"
                  name="Прогноз дозвона"
                  stroke={SAGE}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecastTargets"
                  name="Прогноз целевых"
                  stroke={COPPER}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-navy/55">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: NAVY }} />
              Попыток
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: SAGE }} />
              Дозвон
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: COPPER }} />
              Целевых
            </span>
            <span className="inline-flex items-center gap-1 text-navy/45">
              ─ ─ прогноз
            </span>
          </div>
        </Card>

      </div>

      {/* 5. ГЛАВНЫЙ ВЫВОД ПЕРИОДА */}
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

      {/* 12. РЕКОМЕНДАЦИИ */}
      <Card className="p-5">
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
  );
}

function weeksLabel(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  const word =
    m10 === 1 && m100 !== 11
      ? "неделя"
      : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)
      ? "недели"
      : "недель";
  return `${n} ${word}`;
}

const rub = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;

// Работа нейроассистента: сам ли довёл разговор, сколько стоило и сколько
// операторов понадобилось бы на тот же темп.
function AiWorkCard({ report }: { report: OutboundReport }) {
  const ai = report.ai!;
  const cheaper = ai.operatorCostPerLead / report.campaign.costPerLead;
  return (
    <Card className="p-5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy/55">
        <Bot size={13} /> Работа нейроассистента
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-card border border-emerald-200 bg-emerald-50/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
            Без оператора
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
            {ai.closedByAiPct}%
          </p>
          <p className="text-[11px] text-navy/55">разговоров довёл до конца сам</p>
        </div>
        <div className="rounded-card border border-sky-200 bg-sky-50/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-sky-700">
            Передал менеджеру
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
            {ai.transferred.toLocaleString("ru-RU")}
          </p>
          <p className="text-[11px] text-navy/55">
            готовых к заказу · {ai.transferredPct}% разговоров
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <QualityRow
          label="Одновременных разговоров"
          value={`до ${ai.parallelLines}`}
          hint={`темп как у команды из ${ai.operatorsEquivalent} операторов`}
        />
        <QualityRow
          label="Среднее время разговора"
          value={report.quality.avgTalkTime}
          hint={`до согласия — ${report.quality.timeToResult}`}
        />
        <QualityRow
          label="Понял ответ клиента с первого раза"
          value={`${ai.understoodPct}%`}
          hint="в остальных случаях переспросил"
        />
        <QualityRow
          label="Назначил повторный звонок сам"
          value={ai.callbacksScheduled.toLocaleString("ru-RU")}
          hint="клиент попросил перезвонить в другое время"
        />
      </div>

      <div className="mt-4 rounded-card border border-copper/30 bg-copper/[0.06] p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-copper">
          Стоимость кампании
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-navy/55">Минут разговора</p>
            <p className="text-base font-semibold tabular-nums text-navy">
              {ai.talkMinutes.toLocaleString("ru-RU")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-navy/55">К оплате</p>
            <p className="text-base font-semibold tabular-nums text-navy">
              {rub(ai.totalCost)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-navy/55">Одно согласие</p>
            <p className="text-base font-semibold tabular-nums text-emerald-700">
              {rub(report.campaign.costPerLead)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-navy/60">
          Ставка {ai.ratePerMinute.toLocaleString("ru-RU")} ₽ за минуту разговора, гудки и
          недозвоны не оплачиваются. В операторской кампании согласие стоит{" "}
          {rub(ai.operatorCostPerLead)} — здесь в{" "}
          {cheaper.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} раза дешевле.
        </p>
      </div>
    </Card>
  );
}

const OUTCOME_COLOR: Record<NonNullable<OutboundReport["outcomes"]>[number]["tone"], string> = {
  target: "bg-emerald-500",
  warm: "bg-amber-400",
  neutral: "bg-navy/30",
  refuse: "bg-rose-400",
};

// Итоги разговоров + возражения: чем закончились разговоры и что мешает согласию.
function OutcomesCard({ report }: { report: OutboundReport }) {
  const outcomes = report.outcomes!;
  const max = Math.max(...outcomes.map((o) => o.count));
  const maxObj = Math.max(...report.objections.map((o) => o.count));
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
          Чем закончились разговоры
        </p>
        <p className="mt-1 text-[11px] text-navy/55">
          {report.funnel.reached.toLocaleString("ru-RU")} разговоров с клиентами
        </p>
        <div className="mt-4 space-y-3">
          {outcomes.map((o) => (
            <div key={o.name} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-navy/80">{o.name}</span>
                <span className="shrink-0 tabular-nums text-navy/60">
                  <span className="font-semibold text-navy">
                    {o.count.toLocaleString("ru-RU")}
                  </span>{" "}
                  · {o.pct.toLocaleString("ru-RU")}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                <div
                  className={cn("h-full rounded-full", OUTCOME_COLOR[o.tone])}
                  style={{ width: `${(o.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
          Причины отказов и как нейроассистент их отрабатывает
        </p>
        <p className="mt-1 text-[11px] text-navy/55">
          доля — от всех отказов · «переубедил» — сколько клиентов после ответа согласились
        </p>
        <div className="mt-4 space-y-3">
          {report.objections.map((o) => (
            <div key={o.name} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-navy/80">{o.name}</span>
                <span className="shrink-0 tabular-nums text-navy/60">
                  <span className="font-semibold text-navy">{o.pct}%</span>
                  {o.resolveRate > 0 && (
                    <span className="ml-2 text-emerald-700">
                      переубедил {o.resolveRate}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                <div
                  className="h-full rounded-full bg-rose-400"
                  style={{ width: `${(o.count / maxObj) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProgressMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "navy" | "emerald" | "amber";
}) {
  return (
    <div className="rounded-card bg-white/70 px-3 py-2 backdrop-blur">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-navy/55">
        {icon} {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums",
          tone === "emerald"
            ? "text-emerald-600"
            : tone === "amber"
            ? "text-amber-600"
            : "text-navy"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function QualityRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-navy/85">{label}</p>
        {hint && <p className="text-[10px] text-navy/45">{hint}</p>}
      </div>
      <p className="text-base font-semibold tabular-nums text-navy">{value}</p>
    </div>
  );
}
