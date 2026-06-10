"use client";

import * as React from "react";
import { FileText, Eye, FileSpreadsheet, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { documents, type DocStatus, type DocType } from "@/lib/mock-data";
import { DocumentPreviewModal } from "@/components/document-preview-modal";

// В прототипе все документы открывают один и тот же пример PDF
const SAMPLE_PDF = "/sample-invoice.pdf";

const STATUS_VARIANT: Record<DocStatus, "warning" | "success" | "info" | "neutral"> = {
  "К оплате": "warning",
  "Оплачен": "success",
  "Подписан": "success",
  "Ожидает подписи": "info",
};

const YEARS = Array.from(
  new Set(documents.map((d) => d.date.split(".")[2]))
).sort((a, b) => Number(b) - Number(a));

const TYPES: ("Все" | DocType)[] = ["Все", "Счёт", "Акт"];
const STATUSES: ("Все" | DocStatus)[] = [
  "Все",
  "К оплате",
  "Ожидает подписи",
  "Оплачен",
  "Подписан",
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

function parseAmount(a: string): number {
  return Number(a.replace(/[^\d]/g, ""));
}

export default function DocumentsPage() {
  const [year, setYear] = React.useState<string>(YEARS[0]);
  const [type, setType] = React.useState<"Все" | DocType>("Все");
  const [status, setStatus] = React.useState<"Все" | DocStatus>("Все");
  const [search, setSearch] = React.useState<string>("");
  const [preview, setPreview] = React.useState<{ title: string; url: string } | null>(null);

  // Если есть поиск — игнорируем фильтр по году (ищем по всем).
  // Иначе ищем в рамках выбранного года.
  const searchTrimmed = search.trim().toLowerCase();
  const filtered = documents.filter((d) => {
    if (!searchTrimmed && !d.date.endsWith(year)) return false;
    if (type !== "Все" && d.type !== type) return false;
    if (status !== "Все" && d.status !== status) return false;
    if (searchTrimmed) {
      const haystack = `${d.type} ${d.number}`.toLowerCase();
      if (!haystack.includes(searchTrimmed)) return false;
    }
    return true;
  });

  const totalInvoices = filtered
    .filter((d) => d.type === "Счёт")
    .reduce((s, d) => s + parseAmount(d.amount), 0);
  const unpaid = filtered
    .filter((d) => d.type === "Счёт" && d.status === "К оплате")
    .reduce((s, d) => s + parseAmount(d.amount), 0);
  const awaiting = filtered.filter(
    (d) => d.type === "Акт" && d.status === "Ожидает подписи"
  ).length;

  return (
    <div className="mx-auto max-w-[1320px] space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Финансовые документы</h1>
        <p className="mt-1 text-sm text-navy/55">
          Счета и акты по вашим услугам O&apos;LINE. Каждый месяц мы выставляем счёт
          и акт за оказанные услуги — сканы PDF загружены в портал.
        </p>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-navy/55">Счетов за {year} год</p>
          <p className="mt-2 text-2xl font-semibold text-navy">
            {totalInvoices.toLocaleString("ru-RU")} ₽
          </p>
          <p className="mt-1 text-xs text-navy/45">
            {filtered.filter((d) => d.type === "Счёт").length} счёт(ов) в фильтре
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-navy/55">К оплате</p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold",
              unpaid > 0 ? "text-copper" : "text-emerald-600"
            )}
          >
            {unpaid > 0 ? `${unpaid.toLocaleString("ru-RU")} ₽` : "Нет долгов"}
          </p>
          <p className="mt-1 text-xs text-navy/45">
            {unpaid > 0
              ? "Срок — до конца текущего месяца"
              : "Все счета оплачены"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-navy/55">Актов ждёт подписи</p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold",
              awaiting > 0 ? "text-amber-600" : "text-emerald-600"
            )}
          >
            {awaiting > 0 ? awaiting : "Нет"}
          </p>
          <p className="mt-1 text-xs text-navy/45">
            Подписание ЭДО на стороне клиента
          </p>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <Pills value={year} options={YEARS} onChange={setYear} />
        <Pills value={type} options={TYPES} onChange={setType} />
        <Pills value={status} options={STATUSES} onChange={setStatus} />
        <div className="relative ml-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти счёт или акт по номеру"
            className="w-72 rounded-xl border border-navy/15 bg-white py-2 pl-9 pr-9 text-sm text-navy outline-none focus:border-copper"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-navy/40 hover:bg-navy-50 hover:text-navy"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
      {search && (
        <p className="-mt-3 text-xs text-navy/55">
          Поиск идёт по всем годам — фильтр по году игнорируется.
        </p>
      )}

      {/* Таблица */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-xs uppercase tracking-wider text-navy/55">
                <th className="px-5 py-3 font-medium">Дата</th>
                <th className="px-5 py-3 font-medium">Документ</th>
                <th className="px-5 py-3 font-medium">Период</th>
                <th className="px-5 py-3 font-medium">Сумма</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium text-right">Скан</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-navy/45">
                    По выбранным фильтрам документов нет
                  </td>
                </tr>
              )}
              {filtered.map((d) => (
                <tr
                  key={d.number}
                  onClick={() =>
                    setPreview({
                      title: `${d.type} № ${d.number.split("-").slice(1).join("-")} · ${d.period}`,
                      url: SAMPLE_PDF,
                    })
                  }
                  className="cursor-pointer border-b border-navy/[0.04] transition-colors hover:bg-navy-50/40 last:border-0"
                >
                  <td className="px-5 py-4 text-navy/80">{d.date}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          d.type === "Счёт"
                            ? "bg-copper/10 text-copper"
                            : "bg-navy/10 text-navy"
                        )}
                      >
                        {d.type === "Счёт" ? (
                          <FileSpreadsheet size={16} />
                        ) : (
                          <FileText size={16} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-navy">
                          {d.type} № {d.number.split("-").slice(1).join("-")}
                        </p>
                        <p className="text-xs text-navy/45">
                          PDF · {d.fileSizeKb} КБ · загружен {d.date}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-navy/70">{d.period}</td>
                  <td className="px-5 py-4 font-medium text-navy">{d.amount}</td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[d.status]}>{d.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview({
                          title: `${d.type} № ${d.number.split("-").slice(1).join("-")} · ${d.period}`,
                          url: SAMPLE_PDF,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-copper hover:text-copper"
                    >
                      <Eye size={13} /> Посмотреть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-navy/45">
        Документы выставляются автоматически последним рабочим днём месяца. Если
        нужен счёт раньше срока — напишите менеджеру.
      </p>

      <DocumentPreviewModal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ""}
        fileUrl={preview?.url ?? ""}
      />
    </div>
  );
}
