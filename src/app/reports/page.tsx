"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Grid3x3, ListOrdered } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { reports } from "@/lib/mock-data";
import { useProject } from "@/components/providers/project-provider";

const PERIODS = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
];
const SERVICES = [
  { id: "all", label: "Все услуги" },
  { id: "in", label: "Входящие" },
  { id: "out", label: "Исходящие" },
];

const kindIcon = { kpi: BarChart3, heatmap: Grid3x3, topn: ListOrdered };

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition-colors",
            value === o.id ? "bg-navy text-white" : "text-navy/65 hover:bg-navy-50"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { projectType } = useProject();
  const [period, setPeriod] = React.useState("week");
  const [service, setService] = React.useState("all");

  const visible = reports.filter(
    (r) => !(r.conditional === "fte" && projectType !== "fte")
  );
  const q1 = visible.filter((r) => r.queue === 1);
  const q2 = visible.filter((r) => r.queue === 2);

  return (
    <div className="mx-auto max-w-[1320px] space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Отчёты</h1>
        <p className="mt-1 text-sm text-navy/55">
          Готовые отчёты по вашим проектам. Нажмите на карточку, чтобы открыть детально.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Pills value={period} options={PERIODS} onChange={setPeriod} />
        <Pills value={service} options={SERVICES} onChange={setService} />
      </div>

      <section>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {q1.map((r) => {
            const Icon = kindIcon[r.kind];
            return (
              <Link key={r.id} href={`/reports/${r.id}`}>
                <Card className="group flex h-full flex-col p-5 transition-shadow hover:shadow-soft-lg">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy">
                      <Icon size={18} />
                    </span>
                    {r.conditional === "callback" && (
                      <Badge variant="info">Условный</Badge>
                    )}
                    {r.conditional === "fte" && (
                      <Badge variant="info">FTE-проект</Badge>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-navy">{r.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-navy/55">{r.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-copper">
                    Открыть отчёт{" "}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy/70">Скоро в портале</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {q2.map((r) => (
            <Card
              key={r.id}
              className="flex h-full flex-col border-dashed border-navy/20 bg-navy-50/40 p-5 shadow-none"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy/40">
                  <BarChart3 size={18} />
                </span>
                <Badge variant="soon">Скоро</Badge>
              </div>
              <h3 className="mt-4 font-semibold text-navy/55">{r.title}</h3>
              <p className="mt-1 text-sm text-navy/40">{r.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
