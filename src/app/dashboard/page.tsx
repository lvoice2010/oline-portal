"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  Rocket,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromoCard } from "@/components/promo-card";
import { AllAlertsModal } from "@/components/all-alerts-modal";
import { cn } from "@/lib/utils";
import {
  connectedServices,
  recommendedServices,
  alerts,
  type ServiceStage,
  type ConnectedService,
} from "@/lib/mock-data";

const alertIcon = { warning: AlertTriangle, info: Info, success: CheckCircle2 };

const STAGE_BADGE: Record<ServiceStage, { label: string; variant: "info" | "warning" | "success" }> = {
  submitted: { label: "Заявка", variant: "info" },
  negotiating: { label: "На согласовании", variant: "warning" },
  approved: { label: "Согласовано", variant: "success" },
  launching: { label: "Запуск", variant: "info" },
  active: { label: "Активна", variant: "success" },
};

function LaunchExtra({ launch }: { launch: NonNullable<ConnectedService["launch"]> }) {
  return (
    <div className="mt-3 rounded-xl bg-navy-50/60 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-navy">
        <Rocket size={12} className="text-copper" />
        {launch.currentStepTitle}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-copper transition-all"
          style={{ width: `${launch.progress}%` }}
        />
      </div>
      <p className="mt-1.5 flex justify-between text-[11px] text-navy/60">
        <span>{launch.progress}%</span>
        <span>{launch.eta}</span>
      </p>
    </div>
  );
}

function UsageBar({ usage }: { usage: NonNullable<ConnectedService["usage"]> }) {
  // Post-pay mode — на дашборде показываем только объём, без накопленной стоимости.
  // «к оплате» живёт в шапке услуги, чтобы дашборд оставался обзорным.
  if (typeof usage.limit !== "number") {
    return (
      <div className="mt-4 space-y-1">
        <p className="text-xs text-navy/55">{usage.label}</p>
        <p className="text-base font-semibold text-navy">
          {usage.used.toLocaleString("ru-RU")}{" "}
          <span className="text-sm font-normal text-navy/55">{usage.unit}</span>
        </p>
      </div>
    );
  }

  // Package mode — есть лимит, рисуем прогресс
  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-copper";
  const pctColor =
    pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-navy/70";

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-navy/55">{usage.label}</p>
        <p className={cn("text-xs font-semibold", pctColor)}>{pct}%</p>
      </div>
      <p className="text-base font-semibold text-navy">
        {usage.used.toLocaleString("ru-RU")}{" "}
        <span className="text-sm font-normal text-navy/55">
          / {usage.limit.toLocaleString("ru-RU")} {usage.unit}
        </span>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetricTile({
  metric,
  align = "center",
}: {
  metric: NonNullable<ConnectedService["extraMetrics"]>[number];
  align?: "left" | "center" | "right";
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="relative rounded-lg bg-navy-50/60 px-2.5 py-1.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p
        className={cn(
          "text-[10px] uppercase tracking-wider text-navy/45",
          metric.tooltip && "cursor-help underline decoration-dotted underline-offset-2"
        )}
      >
        {metric.label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold",
          metric.tone === "ok"
            ? "text-emerald-600"
            : metric.tone === "warn"
            ? "text-amber-600"
            : "text-navy"
        )}
      >
        {metric.value}
      </p>
      {metric.tooltip && hover && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute top-full z-50 mt-2 w-56 rounded-lg bg-navy px-3 py-2 text-xs leading-relaxed text-white shadow-soft-lg",
            align === "left" && "left-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "right" && "right-0"
          )}
        >
          {metric.tooltip}
          <div
            className={cn(
              "absolute bottom-full h-0 w-0 border-x-[5px] border-b-[5px] border-x-transparent border-b-navy",
              align === "left" && "left-3",
              align === "center" && "left-1/2 -translate-x-1/2",
              align === "right" && "right-3"
            )}
          />
        </div>
      )}
    </div>
  );
}

function ServiceCardBody({ s }: { s: ConnectedService }) {
  if (s.stage === "active") {
    return (
      <>
        {s.usage && <UsageBar usage={s.usage} />}
        {/* Спейсер выравнивает нижнюю половину карточек на одной высоте, */}
        {/* независимо от того, есть ли наверху прогресс-бар расхода. */}
        <div className="flex-1" />
        {s.extraMetrics && (
          <div
            className={cn(
              "mt-3 grid gap-2",
              s.extraMetrics.length === 2 ? "grid-cols-2" : "grid-cols-3"
            )}
          >
            {s.extraMetrics.map((m, i, arr) => (
              <MetricTile
                key={m.label}
                metric={m}
                align={i === 0 ? "left" : i === arr.length - 1 ? "right" : "center"}
              />
            ))}
          </div>
        )}
        {s.metricLabel && s.metricValue && (
          <p className="mt-3 text-xs text-navy/55">
            <span className="text-navy/40">{s.metricLabel}: </span>
            <span className="font-medium text-navy">{s.metricValue}</span>
          </p>
        )}
        <p className="mt-4 border-t border-navy/[0.04] pt-3 text-xs text-navy/45">
          Подключено: {s.connectedAt}
        </p>
      </>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {s.stageNote && (
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-navy/65">
          {s.stage === "submitted" && <Clock size={12} className="mt-0.5 shrink-0 text-sky-500" />}
          {s.stage === "negotiating" && (
            <MessageSquare size={12} className="mt-0.5 shrink-0 text-amber-500" />
          )}
          {s.stage === "approved" && (
            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />
          )}
          <span>{s.stageNote}</span>
        </p>
      )}

      {s.stage === "launching" && s.launch && <LaunchExtra launch={s.launch} />}

      <p className="text-[11px] text-navy/45">
        {s.stage === "submitted" && `Заявка отправлена: ${s.submittedAt}`}
        {s.stage === "negotiating" &&
          `Последний контакт: ${s.lastContactAt} · заявка от ${s.submittedAt}`}
        {s.stage === "approved" && `Договор согласован: ${s.connectedAt ?? s.submittedAt}`}
        {s.stage === "launching" && `Договор: ${s.connectedAt}`}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const promo = recommendedServices.filter((s) => s.promo).slice(0, 3);
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const [allAlertsOpen, setAllAlertsOpen] = React.useState(false);

  // На главной — только непрочитанные и неудалённые
  const visibleAlerts = alerts.filter((a) => a.unread && !dismissed.has(a.id));

  return (
    <div className="mx-auto max-w-[1320px] space-y-8">
      {/* Блок «Уведомления» — самым первым */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">Уведомления</h2>
          <button
            onClick={() => setAllAlertsOpen(true)}
            className="inline-flex items-center gap-1 text-sm font-medium text-copper hover:text-copper-light"
          >
            Все уведомления <ArrowRight size={14} />
          </button>
        </div>
        {visibleAlerts.length === 0 ? (
          <Card className="p-6 text-center text-sm text-navy/55">
            Новых уведомлений нет. Все прочитанные доступны в разделе «Все
            уведомления».
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleAlerts.map((a) => {
              const Icon = alertIcon[a.tone];
              return (
                <Card key={a.id} className="relative flex gap-3 p-4 pr-8">
                  <Icon
                    size={18}
                    className={
                      "mt-0.5 shrink-0 " +
                      (a.tone === "warning"
                        ? "text-amber-500"
                        : a.tone === "info"
                        ? "text-sky-500"
                        : "text-emerald-500")
                    }
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-navy/80">{a.text}</p>
                    {a.soon && (
                      <Badge variant="soon" className="mt-2">
                        Скоро
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setDismissed((prev) => new Set(prev).add(a.id))
                    }
                    className="absolute right-2 top-2 rounded-md p-1 text-navy/35 transition-colors hover:bg-navy-50 hover:text-navy"
                    aria-label="Скрыть уведомление"
                    title="Скрыть уведомление"
                  >
                    <X size={14} />
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Блок «Рекомендации» */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy">Рекомендации</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {promo.map((s) => (
            <PromoCard key={s.id} service={s} />
          ))}
        </div>

        <Link
          href="/catalog"
          className="group mt-5 flex items-center justify-between gap-4 rounded-card border border-dashed border-navy/20 bg-white px-6 py-4 transition-colors hover:border-copper hover:bg-copper/5"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">
              Смотреть полный каталог услуг
            </p>
            <p className="mt-0.5 text-xs text-navy/55">
              Все направления O&apos;LINE: входящая и исходящая линии, аналитика и
              контроль качества
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors group-hover:border-copper group-hover:text-copper">
            Открыть каталог
            <ArrowRight size={15} />
          </span>
        </Link>
      </section>

      <div>
        {/* Блок «Подключённые услуги» — единый таймлайн от заявки до работы */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-navy">Подключённые услуги</h2>
          <div className="flex gap-5 overflow-x-auto pb-2">
            {connectedServices.map((s) => {
              const badge = STAGE_BADGE[s.stage];
              const wide = s.stage !== "active";
              return (
                <Card
                  key={s.id}
                  className={cn("flex shrink-0 flex-col p-5", wide ? "w-80" : "w-72")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy">{s.name}</h3>
                      {s.billingNote && (
                        <p className="mt-0.5 text-[11px] text-navy/45">
                          {s.billingNote}
                        </p>
                      )}
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  <ServiceCardBody s={s} />

                  <div
                    className={cn(
                      "flex items-center gap-2 border-t border-navy/[0.06] pt-3",
                      s.stage !== "active" && "mt-auto"
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
                      {s.manager.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-navy/40">
                        Менеджер
                      </p>
                      <p className="truncate text-xs font-medium text-navy">
                        {s.manager.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <a
                        href={`tel:${s.manager.phone.replace(/[^+\d]/g, "")}`}
                        title={`Позвонить ${s.manager.name}: ${s.manager.phone}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-copper/15 text-copper transition-colors hover:bg-copper hover:text-white"
                        aria-label="Позвонить менеджеру"
                      >
                        <Phone size={14} />
                      </a>
                      <a
                        href={`mailto:${s.manager.email}?subject=${encodeURIComponent(
                          `Вопрос по услуге «${s.name}»`
                        )}`}
                        title={`Написать на почту ${s.manager.name} (${s.manager.email})`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-copper/15 text-copper transition-colors hover:bg-copper hover:text-white"
                        aria-label="Написать менеджеру на почту"
                      >
                        <Mail size={14} />
                      </a>
                    </div>
                  </div>

                  <Link
                    href={`/services/${s.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-copper hover:text-copper-light"
                  >
                    Подробнее <ArrowRight size={14} />
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

      </div>

      <AllAlertsModal
        open={allAlertsOpen}
        onClose={() => setAllAlertsOpen(false)}
        alerts={alerts}
        dismissedIds={dismissed}
      />
    </div>
  );
}
