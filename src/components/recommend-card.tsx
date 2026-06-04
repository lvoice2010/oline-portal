"use client";

import * as React from "react";
import { Check, Sparkles, Lightbulb, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectServiceModal } from "@/components/connect-service-modal";
import { DemoStatsModal } from "@/components/demo-stats-modal";
import { demoStats, type CatalogService } from "@/lib/mock-data";

type Action = { mode: "connect" | "demo"; service: string } | null;

export function RecommendCard({ service }: { service: CatalogService }) {
  const [action, setAction] = React.useState<Action>(null);
  const [demoOpen, setDemoOpen] = React.useState(false);
  const hasDemo =
    Boolean(demoStats[service.id]) || service.id === "quarter-report";

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-2">
        {service.badges.map((b) => (
          <Badge key={b.label} variant={b.variant} className="gap-1">
            {b.variant === "industry" || b.variant === "recommend" ? (
              <Sparkles size={11} />
            ) : null}
            {b.label}
          </Badge>
        ))}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-navy">{service.name}</h3>
      <p className="mt-1 text-sm text-navy/60">{service.description}</p>

      {service.features && (
        <ul className="mt-4 space-y-1.5">
          {service.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-navy/75">
              <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {service.recommendReason && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-copper/[0.08] px-3 py-2.5 text-xs leading-relaxed text-navy/75">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-copper" />
          <span>
            <span className="font-medium text-copper">Почему рекомендуем: </span>
            {service.recommendReason}
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-1 flex-col items-stretch gap-3">
        {service.price && (
          <span className="text-sm font-medium text-navy/70">{service.price}</span>
        )}
        <div className="mt-auto flex flex-wrap gap-2">
          {hasDemo && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setDemoOpen(true)}
            >
              <BarChart3 size={14} /> Демо
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setAction({ mode: "connect", service: service.name })}
          >
            Подключить
          </Button>
        </div>
      </div>

      <ConnectServiceModal
        open={action !== null}
        onClose={() => setAction(null)}
        serviceName={action?.service ?? ""}
        mode={action?.mode ?? "connect"}
      />

      {hasDemo && (
        <DemoStatsModal
          open={demoOpen}
          onClose={() => setDemoOpen(false)}
          serviceId={service.id}
          onConnect={() =>
            setAction({ mode: "connect", service: service.name })
          }
        />
      )}
    </Card>
  );
}
