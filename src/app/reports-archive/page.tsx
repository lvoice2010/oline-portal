"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileBarChart, Eye, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { archivedReports, type ArchivedReport } from "@/lib/mock-data";
import { DocumentPreviewModal } from "@/components/document-preview-modal";

// В прототипе все отчёты открывают один и тот же пример PDF
const SAMPLE_PDF = "/sample-invoice.pdf";

const SERVICE_OPTIONS = [
  "Все услуги",
  ...Array.from(new Set(archivedReports.map((r) => r.service))),
];

const TYPE_OPTIONS: ("Все" | "Ежемесячные" | "Квартальные")[] = [
  "Все",
  "Ежемесячные",
  "Квартальные",
];

const YEAR_OPTIONS = [
  "Все годы",
  ...Array.from(
    new Set(archivedReports.map((r) => r.publishedAt.split(".")[2]))
  ).sort((a, b) => Number(b) - Number(a)),
];

function Pills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-navy/15 bg-white p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition-colors",
            value === o
              ? "bg-navy text-white"
              : "text-navy/65 hover:bg-navy-50"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function periodYear(period: string): string {
  const match = period.match(/(\d{4})/);
  return match ? match[1] : "";
}

// "05.06.2026" → 20260605 — для сортировки по убыванию даты публикации
function publishedSortKey(date: string): number {
  const [d, m, y] = date.split(".");
  return Number(y) * 10000 + Number(m) * 100 + Number(d);
}

function fileName(r: ArchivedReport): string {
  const safeService = r.service.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_");
  const safePeriod = r.period.replace(/\s+/g, "_");
  return `Отчёт_${safePeriod}_${safeService}.pdf`;
}

export default function ReportsArchivePage() {
  const [service, setService] = React.useState<string>("Все услуги");
  const [type, setType] = React.useState<typeof TYPE_OPTIONS[number]>("Все");
  const [year, setYear] = React.useState<string>("Все годы");
  const [preview, setPreview] = React.useState<{ title: string; url: string } | null>(null);

  const filtered = archivedReports
    .filter((r) => {
      if (service !== "Все услуги" && r.service !== service) return false;
      if (type === "Ежемесячные" && r.type !== "monthly") return false;
      if (type === "Квартальные" && r.type !== "quarterly") return false;
      if (year !== "Все годы" && periodYear(r.period) !== year) return false;
      return true;
    })
    .sort((a, b) => publishedSortKey(b.publishedAt) - publishedSortKey(a.publishedAt));

  const latestMonthly = [...archivedReports]
    .filter((r) => r.type === "monthly")
    .sort((a, b) => publishedSortKey(b.publishedAt) - publishedSortKey(a.publishedAt))[0];
  const totalCount = archivedReports.length;
  const monthlyCount = archivedReports.filter((r) => r.type === "monthly").length;
  const quarterlyCount = archivedReports.filter((r) => r.type === "quarterly").length;

  return (
    <div className="mx-auto max-w-[1320px] space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Архив отчётов</h1>
        <p className="mt-1 text-sm text-navy/55">
          Готовые аналитические отчёты по вашим услугам. Ежемесячные публикуются
          5-го числа следующего месяца, квартальные ИИ-отчёты — на 15-й рабочий
          день после закрытия квартала.
        </p>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-navy/55">Последний отчёт</p>
          {latestMonthly ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-navy">
                {latestMonthly.period}
              </p>
              <p className="mt-1 text-xs text-navy/45">
                {latestMonthly.service} · опубликован {latestMonthly.publishedAt}
              </p>
            </>
          ) : (
            <p className="mt-2 text-2xl font-semibold text-navy/40">—</p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-sm text-navy/55">Ежемесячных отчётов</p>
          <p className="mt-2 text-2xl font-semibold text-navy">{monthlyCount}</p>
          <p className="mt-1 text-xs text-navy/45">
            По всем подключённым услугам с историей
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-navy/55">Квартальных ИИ-отчётов</p>
          <p className="mt-2 text-2xl font-semibold text-navy">{quarterlyCount}</p>
          <p className="mt-1 text-xs text-navy/45">
            Стратегические выводы и рекомендации
          </p>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <Pills value={service} options={SERVICE_OPTIONS} onChange={setService} />
        <Pills value={type} options={[...TYPE_OPTIONS]} onChange={setType} />
        <Pills value={year} options={YEAR_OPTIONS} onChange={setYear} />
      </div>

      {/* Таблица */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-xs uppercase tracking-wider text-navy/55">
                <th className="px-5 py-3 font-medium">Период</th>
                <th className="px-5 py-3 font-medium">Услуга</th>
                <th className="px-5 py-3 font-medium">Тип</th>
                <th className="px-5 py-3 font-medium">Опубликован</th>
                <th className="px-5 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-navy/45">
                    По выбранным фильтрам отчётов нет — попробуйте сбросить фильтры
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-navy/[0.04] transition-colors hover:bg-navy-50/40 last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          r.type === "quarterly"
                            ? "bg-copper/10 text-copper"
                            : "bg-navy/10 text-navy"
                        )}
                      >
                        <FileBarChart size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-navy">{r.period}</p>
                        <p className="text-xs text-navy/45">
                          PDF · {r.fileSizeKb} КБ
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-navy/80">{r.service}</td>
                  <td className="px-5 py-4">
                    <Badge variant={r.type === "quarterly" ? "info" : "neutral"}>
                      {r.type === "quarterly" ? "Ежеквартальный" : "Ежемесячный"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-navy/70">{r.publishedAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          setPreview({
                            title: `Отчёт · ${r.period} · ${r.service}`,
                            url: SAMPLE_PDF,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-copper hover:text-copper"
                      >
                        <Eye size={13} /> Посмотреть
                      </button>
                      <a
                        href={SAMPLE_PDF}
                        download={fileName(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy-light"
                      >
                        <Download size={13} /> Скачать
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-emerald-200 bg-emerald-50 p-5">
        <div>
          <p className="text-sm font-semibold text-emerald-900">
            Нужен отчёт за более ранний период?
          </p>
          <p className="mt-1 text-sm text-emerald-800/85">
            Архив доступен за последние 24 месяца. Если нужен отчёт за более
            ранний период — напишите менеджеру.
          </p>
        </div>
        <Link
          href="/services/hotline-247"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Связаться с менеджером <ArrowRight size={15} />
        </Link>
      </Card>

      <DocumentPreviewModal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ""}
        fileUrl={preview?.url ?? ""}
      />
    </div>
  );
}
