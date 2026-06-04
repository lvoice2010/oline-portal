"use client";

import * as React from "react";
import { ChevronRight, AudioLines, ShieldCheck, Headphones, PhoneIncoming, Sparkles, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConnectServiceModal } from "@/components/connect-service-modal";
import { DemoStatsModal } from "@/components/demo-stats-modal";
import { cn } from "@/lib/utils";
import { demoStats, type CatalogService, type PromoTone } from "@/lib/mock-data";

const CTA_LABEL = {
  connect: "Подключить",
  try: "Попробовать",
  request: "Оставить заявку",
} as const;

const ILLUSTRATION = {
  analytics: AudioLines,
  qa: ShieldCheck,
  assistant: Sparkles,
  secretary: Headphones,
  callback: PhoneIncoming,
  season: Sparkles,
} as const;

const TONE: Record<PromoTone, { bg: string; iconBg: string; icon: string }> = {
  copper: {
    bg: "bg-gradient-to-br from-copper/[0.08] via-white to-copper/[0.04]",
    iconBg: "bg-gradient-to-br from-copper to-copper-light",
    icon: "text-white",
  },
  navy: {
    bg: "bg-gradient-to-br from-navy/[0.06] via-white to-navy/[0.03]",
    iconBg: "bg-gradient-to-br from-navy to-navy-light",
    icon: "text-white",
  },
  teal: {
    bg: "bg-gradient-to-br from-teal-100/40 via-white to-teal-50/50",
    iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
    icon: "text-white",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-100/40 via-white to-violet-50/50",
    iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
    icon: "text-white",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-100/50 via-white to-amber-50/50",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    icon: "text-white",
  },
};

export function PromoCard({ service }: { service: CatalogService }) {
  const promo = service.promo;
  const [open, setOpen] = React.useState(false);
  const [demoOpen, setDemoOpen] = React.useState(false);

  if (!promo) return null;

  const Icon = ILLUSTRATION[promo.illustration];
  const tone = TONE[promo.tone];
  const modalMode = promo.cta === "try" ? "demo" : "connect";
  const hasDemo =
    Boolean(demoStats[service.id]) || service.id === "quarter-report";

  return (
    <>
      <Card className={cn("relative flex h-full flex-col overflow-hidden p-5", tone.bg)}>
        <div className="flex flex-1 items-start gap-4">
          <div className="min-w-0 flex-1">
            {promo.eyebrow && (
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-copper">
                {promo.eyebrow}
              </p>
            )}
            <h3 className="text-lg font-semibold leading-tight text-navy">
              {promo.headline}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy/65">{promo.blurb}</p>
          </div>

          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl shadow-soft",
              tone.iconBg
            )}
          >
            <Icon size={36} className={tone.icon} strokeWidth={1.6} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-copper px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-copper-light"
            >
              {CTA_LABEL[promo.cta]}
              <ChevronRight size={15} />
            </button>
            {hasDemo && (
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white/80 px-3 py-2 text-sm font-medium text-navy hover:bg-white"
              >
                <BarChart3 size={14} /> Демо
              </button>
            )}
          </div>
          {promo.tag && (
            <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-navy/40">
              {promo.tag}
            </span>
          )}
        </div>
      </Card>

      <ConnectServiceModal
        open={open}
        onClose={() => setOpen(false)}
        serviceName={service.name}
        mode={modalMode}
      />

      {hasDemo && (
        <DemoStatsModal
          open={demoOpen}
          onClose={() => setDemoOpen(false)}
          serviceId={service.id}
          onConnect={() => setOpen(true)}
        />
      )}
    </>
  );
}
