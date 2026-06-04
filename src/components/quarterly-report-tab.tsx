"use client";

import * as React from "react";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Calendar,
  Database,
  Download,
  Square,
  CheckSquare,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { quarterlyReport } from "@/lib/mock-data";

const TODAY = "Сегодня";

export function QuarterlyReportTab() {
  const r = quarterlyReport;
  const [checked, setChecked] = React.useState<Record<string, string>>({});

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = TODAY;
      return next;
    });
  };

  const totalActions = r.recommendations.reduce(
    (s, rec) => s + rec.actions.length,
    0
  );
  const doneActions = Object.keys(checked).length;
  const overallPct = Math.round((doneActions / totalActions) * 100);

  return (
    <div className="space-y-6">
      {/* Шапка отчёта */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-copper">
              Ежеквартальный ИИ-отчёт
            </p>
            <h2 className="mt-0.5 text-xl font-semibold text-navy">
              Рекомендации по улучшению сервиса · {r.period}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-navy/55">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={12} /> Период анализа: {r.dateRange}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Database size={12} /> Проанализировано:{" "}
                <span className="font-semibold text-navy">
                  {r.totalAnalyzed.toLocaleString("ru-RU")}
                </span>{" "}
                обращений
              </span>
              <span className="inline-flex items-center gap-1.5 text-navy/55">
                {r.analyzedSegment}
              </span>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-navy-50">
            <Download size={13} /> Скачать PDF
          </button>
        </div>

        <p className="mt-5 border-t border-navy/[0.06] pt-4 text-sm leading-relaxed text-navy/75">
          {r.intro}
        </p>
      </Card>

      {/* Сводный прогноз эффекта */}
      <Card className="border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-50/30 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <TrendingUp size={20} className="text-emerald-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
              Прогноз эффекта при выполнении всех рекомендаций
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">
              рост продаж +{r.totalPotentialGrowth.min}–{r.totalPotentialGrowth.max}%
            </p>
            <p className="mt-1 text-xs text-navy/70">
              Сумма потенциального эффекта по 5 направлениям. Реальный результат
              зависит от приоритизации и скорости внедрения изменений.
            </p>
          </div>
        </div>
      </Card>

      {/* Основные проблемы */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
          <AlertTriangle size={18} className="text-amber-500" />
          Основные проблемы
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {r.problems.map((p, i) => (
            <Card key={p.title} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-navy">{p.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-semibold tabular-nums text-navy">
                    {p.count.toLocaleString("ru-RU")}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-navy/45">
                    обращений
                  </p>
                </div>
              </div>

              {/* Доля в общем потоке */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-navy/55">
                  <span>Доля от всех обращений</span>
                  <span className="font-semibold text-navy">{p.share}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${p.share}%` }}
                  />
                </div>
              </div>

              <p className="mt-3 border-t border-navy/[0.06] pt-3 text-sm leading-relaxed text-navy/70">
                {p.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Рекомендации — чек-лист */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <Lightbulb size={18} className="text-copper" />
            Рекомендации по улучшению
          </h3>
          <span className="text-xs text-navy/55">
            Выполнено:{" "}
            <span className="font-semibold text-navy">
              {doneActions} из {totalActions}
            </span>{" "}
            ({overallPct}%)
          </span>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-card border border-sky-200 bg-sky-50/60 px-4 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-sky-600" />
          <p className="text-xs leading-relaxed text-navy/75">
            Отмечайте выполненные пункты — на их основании мы исключим их из следующего
            анализа и оценим эффект на снижение обращений и рост продаж.
          </p>
        </div>

        <div className="space-y-4">
          {r.recommendations.map((rec, i) => {
            const recDone = rec.actions.filter(
              (_, j) => checked[`${i}-${j}`]
            ).length;
            const allDone = recDone === rec.actions.length;
            return (
              <Card key={rec.title} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        allDone
                          ? "bg-emerald-500 text-white"
                          : "bg-copper/15 text-copper"
                      )}
                    >
                      {allDone ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{rec.title}</p>
                      <p className="mt-0.5 text-[11px] text-navy/55">
                        Выполнено: {recDone} из {rec.actions.length}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    +{rec.potentialGrowth.min}–{rec.potentialGrowth.max}% продаж
                  </span>
                </div>

                {/* Прогресс-бар карточки */}
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-navy-50">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      allDone ? "bg-emerald-500" : "bg-copper"
                    )}
                    style={{
                      width: `${(recDone / rec.actions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Чек-лист действий */}
                <ul className="mt-4 space-y-2 pl-10">
                  {rec.actions.map((a, j) => {
                    const key = `${i}-${j}`;
                    const doneAt = checked[key];
                    const isDone = Boolean(doneAt);
                    return (
                      <li key={a}>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-navy-50/60"
                        >
                          {isDone ? (
                            <CheckSquare
                              size={16}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />
                          ) : (
                            <Square
                              size={16}
                              className="mt-0.5 shrink-0 text-navy/35"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-sm leading-relaxed",
                                isDone
                                  ? "text-navy/45 line-through"
                                  : "text-navy/80"
                              )}
                            >
                              {a}
                            </span>
                            {isDone && (
                              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                <CheckCircle2 size={9} /> Отмечено как
                                выполнено · {doneAt}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Заключение */}
      <Card className="border-navy/[0.06] bg-navy-50/30 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
            <FileText size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
              Заключение
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy/80">
              {r.conclusion}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
