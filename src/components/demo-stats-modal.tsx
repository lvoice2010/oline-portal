"use client";

import * as React from "react";
import {
  X,
  Info,
  TrendingUp,
  Phone,
  Bot,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { demoStats } from "@/lib/mock-data";
import { QuarterlyReportTab } from "@/components/quarterly-report-tab";

const NAVY = "#1F5240";
const COPPER = "#7CB342";

export function DemoStatsModal({
  open,
  onClose,
  serviceId,
  onConnect,
}: {
  open: boolean;
  onClose: () => void;
  serviceId: string;
  onConnect?: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Для «Ежеквартального ИИ-отчёта» показываем сам отчёт (как клиент увидит его после подключения)
  if (serviceId === "quarter-report") {
    return <QuarterReportDemoModal onClose={onClose} onConnect={onConnect} />;
  }

  // Для нейроассистента — звонок тестовому ассистенту + пример отчёта
  if (serviceId === "chatbot") {
    return <ChatbotDemoModal onClose={onClose} onConnect={onConnect} />;
  }

  const demo = demoStats[serviceId];
  if (!demo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-card bg-white shadow-soft-lg"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-copper">
              Демо
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy">
              {demo.serviceName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-navy-50 hover:text-navy"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-2 border-b border-navy/[0.06] bg-amber-50/60 px-6 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-navy/75">
            Это пример отчёта на обезличенных данных другого клиента — чтобы
            показать, какую аналитику вы получите после подключения. <br />
            <span className="text-navy/55">{demo.source}</span>
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* KPI tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {demo.kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-card border border-navy/[0.06] bg-white p-4 shadow-soft"
              >
                <p className="text-xs text-navy/55">{k.label}</p>
                <p className="mt-1.5 text-2xl font-semibold text-navy">{k.value}</p>
                {k.delta && (
                  <p className="mt-0.5 flex items-center gap-0.5 text-xs text-emerald-600">
                    <TrendingUp size={11} /> {k.delta}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="rounded-card border border-navy/[0.06] bg-white p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold text-navy">
              {demo.barChart.title}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={demo.barChart.data}
                  layout="vertical"
                  margin={{ left: 30, right: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E6EAF1"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#9AA4B8"
                    fontSize={11}
                    unit={demo.barChart.unit}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9AA4B8"
                    fontSize={11}
                    width={140}
                  />
                  <RTooltip />
                  <Bar dataKey="value" fill={NAVY} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line chart */}
          <div className="rounded-card border border-navy/[0.06] bg-white p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold text-navy">
              {demo.lineChart.title}
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demo.lineChart.data} margin={{ left: -8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" />
                  <XAxis dataKey="period" stroke="#9AA4B8" fontSize={11} />
                  <YAxis stroke="#9AA4B8" fontSize={11} />
                  <RTooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COPPER}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-navy/[0.06] px-6 py-4">
          <p className="text-xs text-navy/50">
            Получите такую же аналитику по вашему проекту
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy-50"
            >
              Закрыть
            </button>
            {onConnect && (
              <button
                onClick={() => {
                  onClose();
                  onConnect();
                }}
                className="rounded-xl bg-copper px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-copper-light"
              >
                Подключить услугу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────── Демо нейроассистента — звонок + пример отчёта ─────────────

const DEMO_DIALOG_BY_CHANNEL = [
  { name: "Telegram", count: 40, pct: 40 },
  { name: "Чат на сайте", count: 30, pct: 30 },
  { name: "WhatsApp", count: 24, pct: 24 },
  { name: "Телефон", count: 6, pct: 6 },
];

const DEMO_MONTH_TREND = [
  { period: "Янв", value: 1720 },
  { period: "Фев", value: 1580 },
  { period: "Мар", value: 1640 },
  { period: "Апр", value: 1720 },
  { period: "Май", value: 1800 },
];

function ChatbotDemoModal({
  onClose,
  onConnect,
}: {
  onClose: () => void;
  onConnect?: () => void;
}) {
  const [tab, setTab] = React.useState<"call" | "report" | "analytics">("call");
  const phoneNumber = "+7 (495) 555-12-12";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col rounded-card bg-white shadow-soft-lg">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-copper">
              <Sparkles size={12} /> Демо · Нейроассистент
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy">
              Послушайте, как говорит ассистент — и посмотрите пример отчёта
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-navy-50 hover:text-navy"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Табы */}
        <div className="flex gap-1 border-b border-navy/[0.06] bg-navy-50/30 px-6 py-2">
          <button
            onClick={() => setTab("call")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === "call"
                ? "bg-navy text-white"
                : "text-navy/65 hover:bg-navy/[0.05]"
            )}
          >
            <Phone size={13} /> Позвонить ассистенту
          </button>
          <button
            onClick={() => setTab("report")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === "report"
                ? "bg-navy text-white"
                : "text-navy/65 hover:bg-navy/[0.05]"
            )}
          >
            <TrendingUp size={13} /> Пример отчёта
          </button>
          <button
            onClick={() => setTab("analytics")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === "analytics"
                ? "bg-navy text-white"
                : "text-navy/65 hover:bg-navy/[0.05]"
            )}
          >
            <Sparkles size={13} /> Пример аналитики
          </button>
        </div>

        {/* Контент */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {tab === "call" && (
            <div className="space-y-5">
              {/* Большой телефонный виджет */}
              <div className="rounded-card border border-copper/30 bg-gradient-to-br from-copper/[0.08] to-emerald-50/40 p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-copper text-white shadow-soft-lg">
                  <Bot size={28} />
                </div>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                  Тестовый номер ассистента
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-navy">
                  {phoneNumber}
                </p>
                <p className="mt-2 text-xs text-navy/55">
                  Доступен 24/7 · отвечает мгновенно · бесплатно
                </p>
                <a
                  href={`tel:${phoneNumber.replace(/[^+\d]/g, "")}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-emerald-700"
                >
                  <Phone size={15} /> Позвонить сейчас
                </a>
              </div>

              {/* Что попробовать */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-navy/55">
                  Что попробовать спросить
                </p>
                <ul className="mt-2 space-y-2">
                  {[
                    "«Где мой заказ № 4452?» — ассистент покажет статус доставки",
                    "«Хочу оформить возврат» — пройдёт сценарий с проверкой условий",
                    "«У меня технический вопрос» — попробует решить или передаст оператору",
                    "«Какие у вас условия доставки в регионы?» — расскажет варианты",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-navy-50/50 px-3 py-2 text-xs text-navy/80"
                    >
                      <CheckCircle2
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-2 rounded-card border border-sky-200 bg-sky-50/60 px-4 py-3 text-xs leading-relaxed text-sky-900">
                <Info size={14} className="mt-0.5 shrink-0 text-sky-600" />
                <span>
                  Демо-ассистент настроен на сценариях e-commerce. После
                  подключения мы обучим его на ваших продуктах, базе знаний и
                  специфических вопросах вашей аудитории. Время настройки — 5–7
                  рабочих дней.
                </span>
              </div>
            </div>
          )}

          {tab === "report" && (
            <div className="space-y-5">
              <p className="text-xs text-navy/55">
                Обезличенные данные клиента в e-commerce за май 2026. После
                подключения отчёт автоматически собирается по вашим диалогам.
              </p>

              {/* KPI плитки */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-card border border-navy/[0.06] bg-white p-3 shadow-soft">
                  <p className="text-[10px] uppercase tracking-wider text-navy/55">
                    Всего диалогов
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                    1 800
                  </p>
                </div>
                <div className="rounded-card border border-emerald-200 bg-emerald-50/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700">
                    Закрыто ИИ
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700">
                    1 584
                  </p>
                  <p className="text-[10px] text-emerald-700/70">88%</p>
                </div>
                <div className="rounded-card border border-amber-200 bg-amber-50/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700">
                    Эскалаций
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-700">
                    216
                  </p>
                  <p className="text-[10px] text-amber-700/70">12%</p>
                </div>
                <div className="rounded-card border border-navy/[0.06] bg-white p-3 shadow-soft">
                  <p className="text-[10px] uppercase tracking-wider text-navy/55">
                    Среднее время ответа
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                    0.8 сек
                  </p>
                </div>
              </div>

              {/* Каналы */}
              <div className="rounded-card border border-navy/[0.06] bg-white p-4 shadow-soft">
                <h3 className="mb-3 text-sm font-semibold text-navy">
                  Распределение по каналам
                </h3>
                <div className="space-y-2.5">
                  {DEMO_DIALOG_BY_CHANNEL.map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="font-medium text-navy/85">{c.name}</span>
                        <span className="tabular-nums text-navy/60">
                          <span className="font-semibold text-navy">{c.count}%</span>
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
              </div>

              {/* Тренд диалогов */}
              <div className="rounded-card border border-navy/[0.06] bg-white p-4 shadow-soft">
                <h3 className="mb-3 text-sm font-semibold text-navy">
                  Динамика диалогов · последние 5 месяцев
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={DEMO_MONTH_TREND}
                      margin={{ left: -8, right: 8, top: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" />
                      <XAxis dataKey="period" stroke="#9AA4B8" fontSize={11} />
                      <YAxis stroke="#9AA4B8" fontSize={11} />
                      <RTooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#7CB342"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-navy/55">
                В полном отчёте после подключения — также прогноз потока,
                рекомендации по обучению, бенчмарк против рынка и сравнение
                кампаний. Доступ к отчёту прямо в портале и выгрузка PDF.
              </p>
            </div>
          )}

          {tab === "analytics" && (
            <div className="space-y-5">
              <p className="text-xs text-navy/55">
                Обезличенный пример AI-аналитики за май 2026. ИИ автоматически
                разбирает все диалоги и формирует выводы каждые 7 дней.
              </p>

              {/* AI Insights — 2 примера */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-card border border-rose-200 bg-rose-50/60 p-4">
                  <div className="flex items-start gap-2">
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                      Критично
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-navy">
                    Тема «отмена заказа» растёт +28% за 14 дней
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-navy/75">
                    Большая часть связана с долгой обработкой заявок в личном
                    кабинете. ИИ предлагает добавить кнопку «отменить заказ» —
                    снимет 70% таких диалогов.
                  </p>
                </div>
                <div className="rounded-card border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-start gap-2">
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                      Позитивно
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-navy">
                    Доля эскалаций −2 п.п. за месяц
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-navy/75">
                    С 14% до 12% — лучший результат с момента запуска. Модель
                    дообучается на ваших темах и закрывает всё больше запросов
                    самостоятельно.
                  </p>
                </div>
              </div>

              {/* Тематики */}
              <div className="rounded-card border border-navy/[0.06] bg-white p-4 shadow-soft">
                <h3 className="mb-3 text-sm font-semibold text-navy">
                  Топ-5 тематик обращений
                </h3>
                <div className="space-y-2.5">
                  {[
                    { name: "Статус заказа", pct: 34, trend: "stable" },
                    { name: "Возврат средств", pct: 20, trend: "up" },
                    { name: "Технический вопрос", pct: 15, trend: "stable" },
                    { name: "Доставка", pct: 12, trend: "down" },
                    { name: "Оплата и счета", pct: 9, trend: "stable" },
                  ].map((t) => (
                    <div key={t.name} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="font-medium text-navy/85">{t.name}</span>
                        <span className="inline-flex items-center gap-1 tabular-nums text-navy/60">
                          <span className="font-semibold text-navy">{t.pct}%</span>
                          {t.trend === "up" && (
                            <TrendingUp size={11} className="text-rose-600" />
                          )}
                          {t.trend === "down" && (
                            <TrendingUp
                              size={11}
                              className="rotate-180 text-emerald-600"
                            />
                          )}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                        <div
                          className="h-full rounded-full bg-copper"
                          style={{ width: `${t.pct * 2.5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Бенчмарк */}
              <div className="rounded-card border border-navy/[0.06] bg-white p-4 shadow-soft">
                <h3 className="mb-1 text-sm font-semibold text-navy">
                  Сравнение с отраслью
                </h3>
                <p className="mb-3 text-[10px] text-navy/55">
                  Открытые отраслевые исследования рынка КЦ, 2025
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Доля автономной обработки", you: 88, median: 65, unit: "%" },
                    { label: "Среднее время ответа", you: 0.8, median: 3.5, unit: " сек" },
                    { label: "Доля эскалаций", you: 12, median: 35, unit: "%" },
                  ].map((b) => {
                    const maxValue = Math.max(b.you, b.median);
                    const youPct = (b.you / maxValue) * 100;
                    const medianPct = (b.median / maxValue) * 100;
                    return (
                      <div key={b.label}>
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-medium text-navy/85">{b.label}</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            Лучше рынка
                          </span>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-14 shrink-0 text-[10px] text-navy/55">Вы</div>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${youPct}%` }}
                              />
                            </div>
                            <div className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-navy">
                              {b.you}{b.unit}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-14 shrink-0 text-[10px] text-navy/55">Рынок</div>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                              <div
                                className="h-full rounded-full bg-navy/40"
                                style={{ width: `${medianPct}%` }}
                              />
                            </div>
                            <div className="w-16 shrink-0 text-right text-xs tabular-nums text-navy/60">
                              {b.median}{b.unit}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-navy/55">
                В полной аналитике после подключения — карта взаимосвязей тем,
                новые / ушедшие темы, прогноз 6 месяцев, симулятор сценариев. AI
                обновляет выводы каждые 7 дней.
              </p>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="flex items-center justify-between gap-3 border-t border-navy/[0.06] px-6 py-4">
          <p className="text-xs text-navy/50">
            Понравилось? Подключите нейроассистента на ваши задачи
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy-50"
            >
              Закрыть
            </button>
            {onConnect && (
              <button
                onClick={() => {
                  onClose();
                  onConnect();
                }}
                className="rounded-xl bg-copper px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-copper-light"
              >
                Подключить услугу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuarterReportDemoModal({
  onClose,
  onConnect,
}: {
  onClose: () => void;
  onConnect?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col rounded-card bg-white shadow-soft-lg">
        <div className="flex items-start justify-between gap-4 border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-copper">
              Демо · Ежеквартальный ИИ-отчёт
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-navy">
              Пример отчёта на обезличенных данных
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-navy-50 hover:text-navy"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-2 border-b border-navy/[0.06] bg-amber-50/60 px-6 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-navy/75">
            Это пример отчёта, который вы получите после подключения. Данные
            обезличены, взяты у клиента в e-commerce за Q1 2025. После
            подключения отчёт будет автоматически формироваться на ваших
            обращениях.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <QuarterlyReportTab />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-navy/[0.06] px-6 py-3">
          <p className="text-xs text-navy/50">
            Подключите услугу и получите такой же отчёт по своим обращениям
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy-50"
            >
              Закрыть
            </button>
            {onConnect && (
              <button
                onClick={() => {
                  onClose();
                  onConnect();
                }}
                className="rounded-xl bg-copper px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-copper-light"
              >
                Подключить услугу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
