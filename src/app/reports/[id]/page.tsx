"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  reports,
  trendSeries,
  heatmapData,
  heatmapDays,
  heatmapHours,
  topTopics,
} from "@/lib/mock-data";

const NAVY = "#0F1F3D";
const COPPER = "#C9633F";

function heatColor(v: number) {
  // зелёный (мало) → красный (пик)
  const t = Math.min(1, v / 110);
  const r = Math.round(34 + t * (217 - 34));
  const g = Math.round(160 - t * (160 - 60));
  const b = Math.round(80 - t * (80 - 60));
  return `rgb(${r}, ${g}, ${b})`;
}

function KpiView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-navy/55">Текущее значение</p>
          <p className="mt-2 text-4xl font-semibold text-navy">18 сек</p>
          <p className="mt-1 text-sm text-emerald-600">✓ в пределах SLA</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-navy/55">Предыдущий период</p>
          <p className="mt-2 text-4xl font-semibold text-navy/70">23 сек</p>
          <p className="mt-1 text-sm text-navy/45">базовый период</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-navy/55">Изменение</p>
          <p className="mt-2 text-4xl font-semibold text-emerald-600">−21.7%</p>
          <p className="mt-1 text-sm text-navy/45">быстрее, чем раньше</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика за период</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" />
                <XAxis dataKey="period" stroke="#9AA4B8" fontSize={12} />
                <YAxis stroke="#9AA4B8" fontSize={12} />
                <RTooltip />
                <Line
                  type="monotone"
                  dataKey="prev"
                  name="Прошлый период"
                  stroke="#9AA4B8"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Текущий период"
                  stroke={COPPER}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущий период vs предыдущий</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] text-left text-navy/55">
                <th className="pb-2 font-medium">День</th>
                <th className="pb-2 font-medium">Текущий</th>
                <th className="pb-2 font-medium">Предыдущий</th>
                <th className="pb-2 font-medium">±</th>
              </tr>
            </thead>
            <tbody>
              {trendSeries.map((r) => {
                const diff = Math.round(((r.current - r.prev) / r.prev) * 100);
                return (
                  <tr key={r.period} className="border-b border-navy/[0.04]">
                    <td className="py-2.5 text-navy/80">{r.period}</td>
                    <td className="py-2.5 text-navy">{r.current} сек</td>
                    <td className="py-2.5 text-navy/55">{r.prev} сек</td>
                    <td
                      className={
                        "py-2.5 " + (diff <= 0 ? "text-emerald-600" : "text-copper")
                      }
                    >
                      {diff > 0 ? "+" : ""}
                      {diff}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function HeatmapView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Нагрузка на линию: день × час</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="flex">
              <div className="w-12" />
              {heatmapHours.map((h) => (
                <div key={h} className="w-14 pb-2 text-center text-xs text-navy/50">
                  {h}:00
                </div>
              ))}
            </div>
            {heatmapData.map((row, d) => (
              <div key={d} className="flex items-center">
                <div className="w-12 pr-2 text-right text-xs font-medium text-navy/60">
                  {heatmapDays[d]}
                </div>
                {row.map((v, h) => (
                  <Tooltip key={h} content={`${heatmapDays[d]}, ${heatmapHours[h]}:00 — ${v} звонков`}>
                    <div
                      className="m-0.5 flex h-12 w-[52px] items-center justify-center rounded-md text-xs font-medium text-white"
                      style={{ background: heatColor(v) }}
                    >
                      {v}
                    </div>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-navy/55">
          <span>Мало звонков</span>
          <div className="h-3 w-48 rounded-full bg-gradient-to-r from-[rgb(34,160,80)] via-[rgb(200,150,60)] to-[rgb(217,60,60)]" />
          <span>Пик</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TopNView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Распределение по тематикам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTopics}
                layout="vertical"
                margin={{ left: 40, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF1" horizontal={false} />
                <XAxis type="number" stroke="#9AA4B8" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9AA4B8"
                  fontSize={12}
                  width={140}
                />
                <RTooltip />
                <Bar dataKey="count" name="Обращений" fill={NAVY} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Детализация</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] text-left text-navy/55">
                <th className="pb-2 font-medium">Тематика</th>
                <th className="pb-2 font-medium">Кол-во</th>
                <th className="pb-2 font-medium">%</th>
                <th className="pb-2 font-medium">Изменение</th>
              </tr>
            </thead>
            <tbody>
              {topTopics.map((t) => (
                <tr key={t.name} className="border-b border-navy/[0.04]">
                  <td className="py-2.5 text-navy/80">{t.name}</td>
                  <td className="py-2.5 text-navy">{t.count.toLocaleString("ru-RU")}</td>
                  <td className="py-2.5 text-navy/55">{t.share}%</td>
                  <td
                    className={
                      "py-2.5 " +
                      (t.change.startsWith("+")
                        ? "text-copper"
                        : t.change.startsWith("−")
                        ? "text-emerald-600"
                        : "text-navy/45")
                    }
                  >
                    {t.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = reports.find((r) => r.id === params.id);
  if (!report) return notFound();

  return (
    <div className="mx-auto max-w-[1320px] space-y-7">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-sm text-navy/55 hover:text-navy"
      >
        <ArrowLeft size={15} /> Все отчёты
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{report.title}</h1>
          <p className="mt-1 text-sm text-navy/55">{report.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Эта функция появится в следующей версии портала. Сейчас вы видите место, где она будет находиться.">
            <Button variant="outline" size="sm" disabled className="gap-2">
              <FileSpreadsheet size={15} /> Экспорт в Excel
              <Badge variant="soon">Скоро</Badge>
            </Button>
          </Tooltip>
          <Tooltip content="Эта функция появится в следующей версии портала. Сейчас вы видите место, где она будет находиться.">
            <Button variant="outline" size="sm" disabled className="gap-2">
              <FileText size={15} /> Экспорт в PDF
              <Badge variant="soon">Скоро</Badge>
            </Button>
          </Tooltip>
        </div>
      </div>

      {report.kind === "kpi" && <KpiView />}
      {report.kind === "heatmap" && <HeatmapView />}
      {report.kind === "topn" && <TopNView />}
    </div>
  );
}
