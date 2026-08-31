"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  PhoneCall,
  BarChart3,
  LineChart,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Lightbulb,
  Gauge,
  Download,
  FolderArchive,
  ScrollText,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { shiftDateString, monthShift } from "@/lib/demo-clock";
import {
  connectedServices,
  calls,
  dialogs,
  archivedReports,
  DIALOG_CHANNEL_LABEL,
  type Call,
  type CallStatus,
  type Dialog,
  type DialogChannel,
} from "@/lib/mock-data";
import { CallDetailModal } from "@/components/call-detail-modal";
import { DialogDetailModal } from "@/components/dialog-detail-modal";
import { StubPage } from "@/components/stub-page";
import { ServiceReportsTab } from "@/components/service-reports-tab";
import { ServiceAnalyticsTab } from "@/components/service-analytics-tab";
import { QuarterlyReportTab } from "@/components/quarterly-report-tab";
import { OutboundReportTab } from "@/components/outbound-report-tab";
import { OutboundAnalyticsTab } from "@/components/outbound-analytics-tab";
import { OutboundCallsTab } from "@/components/outbound-calls-tab";
import { ServiceScriptTab } from "@/components/service-script-tab";

const TAB_REPORTS = { id: "reports", label: "Отчёты", icon: BarChart3 } as const;
const TAB_ANALYTICS = { id: "analytics", label: "Аналитика", icon: LineChart } as const;
const TAB_SCRIPT = { id: "script", label: "Скрипт", icon: ScrollText } as const;
const TAB_KB = { id: "kb", label: "База знаний", icon: BookOpen } as const;
const TAB_CALLS = { id: "calls", label: "Вызовы", icon: PhoneCall } as const;
const TAB_DIALOGS = { id: "dialogs", label: "Диалоги", icon: PhoneCall } as const;
const TAB_RECOMMENDATIONS = {
  id: "recommendations",
  label: "Рекомендации по улучшению сервиса",
  icon: Lightbulb,
} as const;

function getTabsForService(serviceId: string) {
  if (serviceId === "quarter-report") {
    return [TAB_RECOMMENDATIONS];
  }
  // Нейроассистент — вместо «Скрипта» (бот работает не по скрипту)
  // отдельная вкладка «База знаний» — корпус тем, по которым ИИ отвечает.
  if (serviceId === "chatbot") {
    return [TAB_REPORTS, TAB_ANALYTICS, TAB_KB, TAB_DIALOGS];
  }
  // Голосовые линии: добавляем «Скрипт» между аналитикой и вызовами
  return [TAB_REPORTS, TAB_ANALYTICS, TAB_SCRIPT, TAB_CALLS];
}

// Услуги исходящего обзвона — используют отчёт/аналитику/журнал исходящей
// (проектная кампания и FTE-исход показывают одинаковый отчёт).
const OUTBOUND_SERVICES = new Set(["outbound-q2", "outbound-fte"]);

type TabId =
  | typeof TAB_REPORTS.id
  | typeof TAB_ANALYTICS.id
  | typeof TAB_SCRIPT.id
  | typeof TAB_KB.id
  | typeof TAB_CALLS.id
  | typeof TAB_DIALOGS.id
  | typeof TAB_RECOMMENDATIONS.id;

const STATUS_LABEL: Record<CallStatus, string> = {
  answered: "Принят",
  missed: "Пропущен",
  callback: "Перезвон",
};
const STATUS_COLOR: Record<CallStatus, string> = {
  answered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  missed: "bg-rose-50 text-rose-700 border border-rose-200",
  callback: "bg-amber-50 text-amber-700 border border-amber-200",
};

// Услуги, для которых раздел ещё в активной разработке —
// показываем «В разработке» вместо полноценного экрана.
const SERVICES_UNDER_DEVELOPMENT = new Set<string>(["qa-control"]);

export default function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const service = connectedServices.find((s) => s.id === params.id);
  const tabs = service ? getTabsForService(service.id) : [];
  const [tab, setTab] = React.useState<TabId>(tabs[0]?.id ?? "reports");
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  if (!service) return notFound();

  if (SERVICES_UNDER_DEVELOPMENT.has(service.id)) {
    return (
      <div className="mx-auto max-w-[1320px] space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-navy/55 hover:text-navy"
        >
          <ArrowLeft size={15} /> Все услуги
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-navy">{service.name}</h1>
          <p className="mt-1 text-sm text-navy/55">
            Раздел готовим к запуску — скоро откроем доступ.
          </p>
        </div>
        <Card className="flex flex-col items-start gap-3 p-8">
          <Badge variant="soon">В разработке</Badge>
          <p className="max-w-2xl text-sm leading-relaxed text-navy/70">
            Сейчас собираем интерфейс для оценки звонков по чек-листам: дашборд
            по операторам, прослушка с подсветкой триггеров, выгрузка
            индивидуальных оценок и сводные отчёты для руководителей. Раздел
            откроется в портале сразу после согласования финального набора
            метрик с вашей стороны.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-navy/55">
            Готовность — ориентировочно к началу июля 2026. Если хотите
            участвовать в пилоте — напишите менеджеру, добавим вас в первую
            волну.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-navy/55 hover:text-navy"
      >
        <ArrowLeft size={15} /> Все услуги
      </Link>

      {/* Шапка услуги */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-navy">{service.name}</h1>
            {service.billingNote && (
              <p className="mt-0.5 text-sm text-navy/55">{service.billingNote}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {service.stage === "active" && (
                <Badge variant="success" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Активна
                </Badge>
              )}
              {service.stage === "launching" && <Badge variant="info">Запуск</Badge>}
              {service.stage === "negotiating" && (
                <Badge variant="warning">На согласовании</Badge>
              )}
              {service.stage === "submitted" && (
                <Badge variant="info">Заявка</Badge>
              )}
              {service.stage === "approved" && (
                <Badge variant="success">Согласовано</Badge>
              )}
              {service.phoneNumber && (
                <a
                  href={`tel:${service.phoneNumber.replace(/[^+\d]/g, "")}`}
                  title={`Позвонить на линию: ${service.phoneNumber}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-2.5 py-0.5 text-xs font-medium text-navy/70 transition-colors hover:border-copper hover:text-copper"
                >
                  <Phone size={12} />
                  {service.phoneNumber}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-stretch gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-navy/[0.06] bg-white p-2 shadow-soft">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {service.manager.initials}
              </span>
              <div className="min-w-0 pr-1">
                <p className="text-[11px] uppercase tracking-wider text-navy/40">
                  Менеджер
                </p>
                <p className="truncate text-xs font-medium text-navy">
                  {service.manager.name}
                </p>
              </div>
              <a
                href={`tel:${service.manager.phone.replace(/[^+\d]/g, "")}`}
                title={`Позвонить ${service.manager.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-copper/15 text-copper hover:bg-copper hover:text-white"
              >
                <Phone size={14} />
              </a>
              <a
                href={`mailto:${service.manager.email}?subject=${encodeURIComponent(
                  `Вопрос по услуге «${service.name}»`
                )}`}
                title={`Написать на почту ${service.manager.name} (${service.manager.email})`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-copper/15 text-copper hover:bg-copper hover:text-white"
              >
                <Mail size={14} />
              </a>
            </div>

            {service.usage && (
              <div className="w-[260px] rounded-xl border border-navy/[0.06] bg-white p-3 shadow-soft">
                <PackageUsageBlock usage={service.usage} compact />
              </div>
            )}

            {service.stage === "active" && (
              <ReportsActionsBlock serviceId={service.id} />
            )}
          </div>
        </div>

        {(service.tariff || service.schedule || service.includes) && (
          <div className="mt-5 border-t border-navy/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light"
              aria-expanded={detailsOpen}
            >
              {detailsOpen
                ? "Свернуть условия и состав пакета"
                : "Условия, график и что входит в пакет"}
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform",
                  detailsOpen && "rotate-180"
                )}
              />
            </button>

            {detailsOpen && (
              <>
                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-navy/45">
                      {service.contract ? "Договор" : "Тариф"}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-navy">
                      {service.contract ?? service.tariff ?? "—"}
                    </p>
                    {service.counterparty && (
                      <p className="mt-0.5 text-xs text-navy/70">
                        <span className="text-navy/45">Контрагент: </span>
                        {service.counterparty}
                      </p>
                    )}
                    {service.volume && (
                      <p className="mt-0.5 text-xs text-navy/55">{service.volume}</p>
                    )}
                    {service.extra && (
                      <p className="mt-0.5 text-xs text-navy/55">{service.extra}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-navy/45">
                      График работы
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-navy">
                      {service.schedule ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-navy/45">
                      Что входит в пакет
                    </p>
                    {service.includes ? (
                      <ul className="mt-1.5 space-y-1">
                        {service.includes.map((it) => (
                          <li
                            key={it}
                            className="flex items-start gap-1.5 text-xs leading-relaxed text-navy/75"
                          >
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-copper" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1.5 text-sm text-navy/45">—</p>
                    )}
                  </div>
                </div>

              </>
            )}
          </div>
        )}
      </Card>

      {/* Табы — скрываем, когда вкладка одна */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-1 rounded-xl border border-navy/15 bg-white p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === id ? "bg-navy text-white" : "text-navy/65 hover:bg-navy-50"
              )}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Содержимое таба */}
      {tab === "recommendations" && <QuarterlyReportTab />}
      {tab === "script" && <ServiceScriptTab serviceId={service.id} />}
      {tab === "kb" && (
        <ServiceScriptTab serviceId={service.id} variant="knowledge" />
      )}
      {tab === "calls" &&
        (OUTBOUND_SERVICES.has(service.id) ? (
          <OutboundCallsTab serviceId={service.id} />
        ) : (
          <CallsTab serviceId={service.id} />
        ))}
      {tab === "dialogs" && <DialogsTab serviceId={service.id} />}
      {tab === "reports" &&
        (OUTBOUND_SERVICES.has(service.id) ? (
          <OutboundReportTab serviceId={service.id} />
        ) : (
          <ServiceReportsTab serviceId={service.id} />
        ))}
      {tab === "analytics" &&
        (OUTBOUND_SERVICES.has(service.id) ? (
          <OutboundAnalyticsTab serviceId={service.id} />
        ) : (
          <ServiceAnalyticsTab serviceId={service.id} />
        ))}
    </div>
  );
}

// ── Блок «Расход пакета» в шапке услуги ──────────────────────────
function PackageUsageBlock({
  usage,
  compact = false,
}: {
  usage: {
    label: string;
    used: number;
    unit: string;
    limit?: number;
    rate?: number;
    mixedRates?: {
      textUnit: string;
      textRate: number;
      voiceUnit: string;
      voiceRate: number;
    };
    approxCost?: number;
  };
  compact?: boolean;
}) {
  // Post-pay mode — нет лимита, рисуем накопленную стоимость
  if (typeof usage.limit !== "number") {
    const mix = usage.mixedRates;
    // приоритет: явная approxCost > rate × used > null
    const cost = usage.approxCost
      ? usage.approxCost
      : !mix && usage.rate
      ? Math.round(usage.used * usage.rate)
      : null;
    if (compact) {
      return (
        <div className="flex h-full flex-col">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-navy/40">
            <Gauge size={12} /> Оплата по факту
          </p>
          <p className="mt-1 text-sm font-medium text-navy tabular-nums">
            {usage.used.toLocaleString("ru-RU")}{" "}
            <span className="text-navy/55">{usage.unit}</span>
          </p>
          {cost !== null && (
            <p className="mt-1 text-[11px] font-semibold tabular-nums text-emerald-700">
              ≈ {cost.toLocaleString("ru-RU")} ₽ к оплате
            </p>
          )}
          {!mix && usage.rate !== undefined && (
            <p className="mt-1 text-[10px] text-navy/45">
              ставка {usage.rate} ₽ / {usage.unit}
            </p>
          )}
        </div>
      );
    }
    return (
      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy/45">
          <Gauge size={12} /> Оплата по факту
        </p>
        <p className="mt-1.5 text-sm font-medium text-navy tabular-nums">
          {usage.used.toLocaleString("ru-RU")}{" "}
          <span className="text-navy/55">{usage.unit}</span>
        </p>
        {cost !== null && (
          <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-700">
            ≈ {cost.toLocaleString("ru-RU")} ₽ к оплате
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-navy/55">
          {usage.label}
          {!mix && usage.rate !== undefined
            ? ` · ставка ${usage.rate} ₽ / ${usage.unit}`
            : ""}
        </p>
      </div>
    );
  }

  // Package mode — есть лимит, рисуем прогресс
  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const left = Math.max(0, usage.limit - usage.used);
  // Цвет полосы: 0-50 → emerald, 50-80 → amber, 80-100 → rose
  const barColor =
    pct < 50 ? "bg-emerald-500" : pct < 80 ? "bg-amber-500" : "bg-rose-500";
  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-navy/40">
          <Gauge size={12} /> Расход пакета
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="text-xs font-medium text-navy tabular-nums">
            {usage.used.toLocaleString("ru-RU")} /{" "}
            {usage.limit.toLocaleString("ru-RU")}{" "}
            <span className="text-navy/55">{usage.unit}</span>
          </p>
          <p className="text-xs font-semibold tabular-nums text-navy/75">
            {pct}%
          </p>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy/[0.08]">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-navy/45">
          осталось {left.toLocaleString("ru-RU")} {usage.unit}
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy/45">
        <Gauge size={12} /> Расход пакета
      </p>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-navy tabular-nums">
          {usage.used.toLocaleString("ru-RU")} / {usage.limit.toLocaleString("ru-RU")}{" "}
          <span className="text-navy/55">{usage.unit}</span>
        </p>
        <p className="text-xs font-semibold tabular-nums text-navy/70">{pct}%</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy/[0.08]">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-navy/55">
        {usage.label} · осталось {left.toLocaleString("ru-RU")} {usage.unit}
      </p>
    </div>
  );
}

// ── Блок «Отчёты» в шапке услуги (рядом с менеджером + расходом) ─
function ReportsActionsBlock({ serviceId }: { serviceId: string }) {
  const serviceReports = archivedReports
    .filter((r) => r.serviceId === serviceId)
    .sort((a, b) => {
      const ka = a.publishedAt.split(".").reverse().join("");
      const kb = b.publishedAt.split(".").reverse().join("");
      return kb.localeCompare(ka);
    });
  const latest = serviceReports[0];
  if (!latest) return null;

  // Демо-«сегодня»: сдвигаем месяц последнего отчёта к реальной дате
  const period = shiftDateString(latest.period, monthShift());
  const monthLower = period.split(" ")[0].toLowerCase();
  return (
    <div className="flex w-[220px] flex-col gap-1.5 rounded-xl border border-navy/[0.06] bg-white p-2 shadow-soft">
      <p className="px-1 pt-0.5 text-[10px] uppercase tracking-wider text-navy/40">
        Отчёты
      </p>
      <a
        href="/sample-invoice.pdf"
        download={`Отчёт_${period.replace(/\s+/g, "_")}.pdf`}
        title={`Скачать PDF-отчёт за ${period}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-light"
      >
        <Download size={13} /> Скачать за {monthLower}
      </a>
      <Link
        href="/reports-archive"
        title="Все отчёты по этой услуге"
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy/75 transition-colors hover:border-copper hover:text-copper"
      >
        <FolderArchive size={13} /> Архив ({serviceReports.length})
      </Link>
    </div>
  );
}

const CALL_PERIODS = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
] as const;
type CallPeriod = (typeof CALL_PERIODS)[number]["id"];

function CallsTab({ serviceId }: { serviceId: string }) {
  const [period, setPeriod] = React.useState<CallPeriod>("month");
  const [customFrom, setCustomFrom] = React.useState<string>(""); // YYYY-MM-DD
  const [customTo, setCustomTo] = React.useState<string>("");
  const [customOpen, setCustomOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<"all" | CallStatus>("all");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Call | null>(null);

  const serviceCalls = calls.filter((c) => c.serviceId === serviceId);
  const now = new Date();
  const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 31 : null;
  const cutoff = days !== null ? new Date(now.getTime() - days * 86400000) : null;
  const fromDate = period === "custom" && customFrom ? new Date(customFrom) : null;
  const toDate = period === "custom" && customTo ? new Date(`${customTo}T23:59:59`) : null;

  // Шаг 1: фильтр только по периоду — используется и для сводки, и для таблицы
  const inPeriod = serviceCalls.filter((c) => {
    const [d, m, y] = c.date.split(".").map(Number);
    const callDate = new Date(y, m - 1, d);

    if (cutoff && callDate < cutoff) return false;
    if (fromDate && callDate < fromDate) return false;
    if (toDate && callDate > toDate) return false;
    return true;
  });

  // Шаг 2: поверх — статус и поиск (только для таблицы)
  const filtered = inPeriod.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !c.caller.toLowerCase().includes(q) &&
        !c.operator.name.toLowerCase().includes(q) &&
        !(c.topic ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // Сводка считается по периоду — не по статусу/поиску,
  // иначе фильтр «Принятые» дал бы «Пропущенных: 0» и т.п.
  const total = inPeriod.length;
  const answered = inPeriod.filter((c) => c.status === "answered").length;
  const missed = inPeriod.filter((c) => c.status === "missed").length;
  const callback = inPeriod.filter((c) => c.status === "callback").length;

  // Журнал вообще не накоплен (нет вызовов ни в одном периоде по этой услуге)
  if (serviceCalls.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        По этой услуге журнал вызовов ещё не накоплен.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-navy/55">Всего вызовов</p>
          <p className="mt-1 text-2xl font-semibold text-navy">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Принятых</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{answered}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Пропущенных</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold",
              missed > 0 ? "text-rose-600" : "text-navy"
            )}
          >
            {missed}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Перезвонов</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold",
              callback > 0 ? "text-amber-600" : "text-navy"
            )}
          >
            {callback}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
            {CALL_PERIODS.map((p) => (
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
                {p.id === "custom" && period === "custom" && customFrom && customTo && (
                  <span className="ml-1.5 text-[10px] opacity-75">
                    · {customFrom.split("-").reverse().join(".")} – {customTo.split("-").reverse().join(".")}
                  </span>
                )}
              </button>
            ))}
          </div>

          {customOpen && period === "custom" && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setCustomOpen(false)}
              />
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
                <div className="mt-4 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFrom("");
                      setCustomTo("");
                    }}
                    className="text-xs font-medium text-navy/55 hover:text-navy"
                  >
                    Сбросить
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomOpen(false)}
                    className="rounded-lg bg-copper px-3 py-1.5 text-xs font-medium text-white hover:bg-copper-light"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
          {(
            [
              { id: "all" as const, label: "Все" },
              { id: "answered" as const, label: "Принятые" },
              { id: "missed" as const, label: "Пропущенные" },
              { id: "callback" as const, label: "Перезвоны" },
            ] as { id: "all" | CallStatus; label: string }[]
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
            placeholder="Номер, оператор или тема"
            className="w-64 rounded-xl border border-navy/15 bg-white py-2 pl-9 pr-3 text-sm text-navy outline-none focus:border-copper"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-[11px] uppercase tracking-wider text-navy/55">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Оператор</th>
                <th className="px-4 py-3 font-medium">Номер</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium text-right">Ожид.</th>
                <th className="px-4 py-3 font-medium text-right">Длит.</th>
                <th className="px-4 py-3 font-medium">Тема</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-navy/45">
                    По текущему фильтру вызовов нет
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
                    {c.caller}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        STATUS_COLOR[c.status]
                      )}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-navy/70">
                    {c.waitSec}с
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-navy">
                    {c.durationSec > 0 ? `${c.durationSec}с` : "—"}
                  </td>
                  <td className="px-4 py-3 text-navy/70">{c.topic ?? "—"}</td>
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
            Показано {filtered.length} из {total} вызовов
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-md text-navy/30"
            >
              <ChevronLeft size={14} />
            </button>
            <button className="h-7 min-w-[28px] rounded-md bg-navy px-2 text-xs font-medium text-white">
              1
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-navy/55 hover:bg-navy-50">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      <CallDetailModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        call={selected}
      />
    </div>
  );
}

// ───────────── Диалоги нейроассистента ─────────────

const DIALOG_PERIODS = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
] as const;
type DialogPeriod = (typeof DIALOG_PERIODS)[number]["id"];

const CHANNEL_COLOR: Record<DialogChannel, string> = {
  telegram: "bg-blue-50 text-blue-700 border border-blue-200",
  whatsapp: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  phone: "bg-navy-50 text-navy/75 border border-navy/15",
  chat: "bg-amber-50 text-amber-700 border border-amber-200",
};

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} мин` : `${m} мин ${String(s).padStart(2, "0")} сек`;
}

function DialogsTab({ serviceId }: { serviceId: string }) {
  const [period, setPeriod] = React.useState<DialogPeriod>("month");
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");
  const [customOpen, setCustomOpen] = React.useState(false);
  const [channelFilter, setChannelFilter] = React.useState<"all" | DialogChannel>("all");
  const [escalationFilter, setEscalationFilter] = React.useState<"all" | "yes" | "no">("all");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Dialog | null>(null);

  const serviceDialogs = dialogs.filter((d) => d.serviceId === serviceId);
  const now = new Date();
  const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 31 : null;
  const cutoff = days !== null ? new Date(now.getTime() - days * 86400000) : null;
  const fromDate = period === "custom" && customFrom ? new Date(customFrom) : null;
  const toDate = period === "custom" && customTo ? new Date(`${customTo}T23:59:59`) : null;

  const inPeriod = serviceDialogs.filter((d) => {
    const [dd, mm, yy] = d.date.split(".").map(Number);
    const dt = new Date(yy, mm - 1, dd);
    if (cutoff && dt < cutoff) return false;
    if (fromDate && dt < fromDate) return false;
    if (toDate && dt > toDate) return false;
    return true;
  });

  const filtered = inPeriod.filter((d) => {
    if (channelFilter !== "all" && d.channel !== channelFilter) return false;
    if (escalationFilter === "yes" && !d.escalated) return false;
    if (escalationFilter === "no" && d.escalated) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !d.topic.toLowerCase().includes(q) &&
        !DIALOG_CHANNEL_LABEL[d.channel].toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const total = inPeriod.length;
  const aiHandled = inPeriod.filter((d) => !d.escalated).length;
  const escalated = inPeriod.filter((d) => d.escalated).length;
  // Разбивка для биллинга: текст — поштучно, голос — по минутам
  const textDialogs = inPeriod.filter((d) => d.channel !== "phone");
  const voiceDialogs = inPeriod.filter((d) => d.channel === "phone");
  const textCount = textDialogs.length;
  const voiceMinutes = Math.round(
    voiceDialogs.reduce((s, d) => s + d.durationSec, 0) / 60
  );

  if (serviceDialogs.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        По этой услуге журнал диалогов ещё не накоплен.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-navy/55">Всего диалогов</p>
          <p className="mt-1 text-2xl font-semibold text-navy">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Закрыто ИИ</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{aiHandled}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Эскалаций</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold",
              escalated > 0 ? "text-amber-600" : "text-navy"
            )}
          >
            {escalated}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Текстовых диалогов</p>
          <p className="mt-1 text-2xl font-semibold text-navy tabular-nums">
            {textCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy/55">Голосовых минут</p>
          <p className="mt-1 text-2xl font-semibold text-navy tabular-nums">
            {voiceMinutes}
          </p>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
            {DIALOG_PERIODS.map((p) => (
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
                {p.id === "custom" && period === "custom" && customFrom && customTo && (
                  <span className="ml-1.5 text-[10px] opacity-75">
                    · {customFrom.split("-").reverse().join(".")} – {customTo.split("-").reverse().join(".")}
                  </span>
                )}
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
                <div className="mt-4 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFrom("");
                      setCustomTo("");
                    }}
                    className="text-xs font-medium text-navy/55 hover:text-navy"
                  >
                    Сбросить
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomOpen(false)}
                    className="rounded-lg bg-copper px-3 py-1.5 text-xs font-medium text-white hover:bg-copper-light"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
          {(
            [
              { id: "all" as const, label: "Все каналы" },
              { id: "telegram" as const, label: "Telegram" },
              { id: "whatsapp" as const, label: "WhatsApp" },
              { id: "phone" as const, label: "Телефон" },
              { id: "chat" as const, label: "Чат" },
            ] as { id: "all" | DialogChannel; label: string }[]
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => setChannelFilter(o.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                channelFilter === o.id
                  ? "bg-navy text-white"
                  : "text-navy/65 hover:bg-navy-50"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
          {(
            [
              { id: "all" as const, label: "Все" },
              { id: "no" as const, label: "Закрыто ИИ" },
              { id: "yes" as const, label: "Эскалации" },
            ] as { id: "all" | "yes" | "no"; label: string }[]
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => setEscalationFilter(o.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                escalationFilter === o.id
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
            placeholder="Тема или канал"
            className="w-56 rounded-xl border border-navy/15 bg-white py-2 pl-9 pr-3 text-sm text-navy outline-none focus:border-copper"
          />
        </div>
      </div>

      {/* Таблица диалогов */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-[11px] uppercase tracking-wider text-navy/55">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Канал</th>
                <th className="px-4 py-3 font-medium">Тема</th>
                <th className="px-4 py-3 font-medium">Эскалация</th>
                <th className="px-4 py-3 font-medium text-right">Длительность</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-navy/45">
                    По текущему фильтру диалогов нет
                  </td>
                </tr>
              )}
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="cursor-pointer border-b border-navy/[0.04] transition-colors hover:bg-navy-50/40 last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-navy/80">
                    <div>{d.date}</div>
                    <div className="text-[11px] text-navy/45">{d.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        CHANNEL_COLOR[d.channel]
                      )}
                    >
                      {DIALOG_CHANNEL_LABEL[d.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/85">{d.topic}</td>
                  <td className="px-4 py-3">
                    {d.escalated ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Да
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Нет
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-navy">
                    {fmtDuration(d.durationSec)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(d);
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
            Показано {filtered.length} из {total} диалогов за период
          </span>
        </div>
      </Card>

      <DialogDetailModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        dialog={selected}
      />
    </div>
  );
}
