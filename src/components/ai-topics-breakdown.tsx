"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Одна строка распределения: значение + сколько раз встретилось + %
type TopicCount = { value: string; count: number; pct: number };

// Период независимый от шапки услуги — клиент может сравнивать
// KPI за месяц с темами за неделю и т.п.
type Period = "today" | "yesterday" | "week" | "month" | "custom";

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "yesterday", label: "Вчера" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
];

// Парсит «DD.MM.YYYY» в Date и проверяет, попадает ли в выбранный период.
function isInPeriod(
  dateStr: string,
  period: Period,
  customFrom: string,
  customTo: string
): boolean {
  const [d, m, y] = dateStr.split(".").map(Number);
  const itemDate = new Date(y, m - 1, d);
  const now = new Date();
  const day = 86400000;
  if (period === "today") return itemDate >= new Date(now.getTime() - day);
  if (period === "yesterday") {
    const start = new Date(now.getTime() - 2 * day);
    const end = new Date(now.getTime() - day);
    return itemDate >= start && itemDate < end;
  }
  if (period === "week") return itemDate >= new Date(now.getTime() - 7 * day);
  if (period === "month") return itemDate >= new Date(now.getTime() - 31 * day);
  if (period === "custom") {
    const from = customFrom ? new Date(customFrom) : null;
    const to = customTo ? new Date(`${customTo}T23:59:59`) : null;
    if (from && itemDate < from) return false;
    if (to && itemDate > to) return false;
    return true;
  }
  return true;
}

function groupByKey<T>(
  items: T[],
  getKey: (it: T) => string | undefined,
  total: number
): TopicCount[] {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = getKey(it);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({
      value,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Универсальный блок «Темы обращений» — работает и для звонков,
// и для диалогов нейроассистента, лишь бы у элементов был
// ai.category / ai.subcategory. Воспроизводит вид служебного
// отчёта из старого кабинета (Значение / Количество / Проценты),
// разбитого на два столбца: категории и подкатегории.
//
// Период живёт внутри блока — отдельно от шапки услуги,
// чтобы можно было сравнивать KPI за месяц с темами за неделю.
export function AiTopicsBreakdown<T>({
  items,
  itemNoun,
  getDate,
  getCategory,
  getSubcategory,
}: {
  items: T[];
  itemNoun: string; // "карточек" / "звонков" / "диалогов"
  getDate: (it: T) => string; // «DD.MM.YYYY»
  getCategory: (it: T) => string | undefined;
  getSubcategory: (it: T) => string | undefined;
}) {
  const [period, setPeriod] = React.useState<Period>("month");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [customOpen, setCustomOpen] = React.useState(false);

  // Сначала отрезаем по периоду, потом оставляем только с ИИ-карточкой
  const inPeriod = React.useMemo(
    () =>
      items.filter((it) => isInPeriod(getDate(it), period, customFrom, customTo)),
    [items, period, customFrom, customTo, getDate]
  );
  const withAi = React.useMemo(
    () => inPeriod.filter((it) => !!getCategory(it)),
    [inPeriod, getCategory]
  );
  const total = withAi.length;
  const cats = React.useMemo(
    () => groupByKey(withAi, getCategory, total),
    [withAi, getCategory, total]
  );
  const subs = React.useMemo(
    () => groupByKey(withAi, getSubcategory, total),
    [withAi, getSubcategory, total]
  );

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-navy">
          <Sparkles size={14} className="text-copper" />
          Темы обращений
        </h3>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
          Всего {itemNoun}: {total.toLocaleString("ru-RU")}
        </span>
        <span className="hidden text-[11px] text-navy/55 xl:inline">
          Автоматическая классификация ИИ
        </span>

        {/* Селектор периода — независимый от шапки услуги */}
        <div className="relative ml-auto">
          <div className="flex gap-1 rounded-xl border border-navy/15 bg-white p-1">
            {PERIOD_OPTIONS.map((p) => (
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
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p.id
                    ? "bg-navy text-white"
                    : "text-navy/65 hover:bg-navy-50"
                )}
              >
                {p.label}
                {p.id === "custom" &&
                  period === "custom" &&
                  customFrom &&
                  customTo && (
                    <span className="ml-1.5 text-[10px] opacity-75">
                      ·{" "}
                      {customFrom.split("-").reverse().join(".")} –{" "}
                      {customTo.split("-").reverse().join(".")}
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
                    <label className="mb-1 block text-xs text-navy/55">
                      От
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-copper"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-navy/55">
                      До
                    </label>
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
      </div>

      {total === 0 ? (
        <div className="rounded-card border border-dashed border-navy/15 bg-white p-6 text-center text-sm text-navy/55">
          За выбранный период нет {itemNoun} с ИИ-карточкой — нечего анализировать
          по темам.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TopicTable title="По категориям" rows={cats} />
          <TopicTable title="По подкатегориям" rows={subs} />
        </div>
      )}
    </Card>
  );
}

// Сколько строк показываем по умолчанию. Остальное — под кнопкой
// «Показать ещё». 10 — компромисс: видны лидеры + длинный хвост
// не превращает блок в простыню (при 30+ категориях).
const TOPIC_PAGE_SIZE = 10;

function TopicTable({ title, rows }: { title: string; rows: TopicCount[] }) {
  const [expanded, setExpanded] = React.useState(false);
  const max = rows[0]?.count ?? 0;
  const total = rows.length;
  const hidden = Math.max(0, total - TOPIC_PAGE_SIZE);
  const visible = expanded ? rows : rows.slice(0, TOPIC_PAGE_SIZE);

  // Сумма скрытых для строки «Остальные» — даёт быстрый ответ
  // на «сколько весят все мелкие категории вместе»
  const tailCount = rows
    .slice(TOPIC_PAGE_SIZE)
    .reduce((s, r) => s + r.count, 0);
  const tailPct = rows
    .slice(TOPIC_PAGE_SIZE)
    .reduce((s, r) => s + r.pct, 0);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/45">
          {title}
        </p>
        <p className="text-[10px] text-navy/45 tabular-nums">
          {expanded || hidden === 0
            ? `всего ${total}`
            : `топ ${TOPIC_PAGE_SIZE} из ${total}`}
        </p>
      </div>
      <div className="overflow-hidden rounded-card border border-navy/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/[0.08] bg-navy-50/50 text-left text-[10px] uppercase tracking-wider text-navy/55">
              <th className="px-3 py-2 font-medium">Значение</th>
              <th className="w-24 px-3 py-2 text-right font-medium">
                Количество
              </th>
              <th className="w-20 px-3 py-2 text-right font-medium">
                Проценты
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr
                key={i}
                className="border-b border-navy/[0.04] last:border-0 hover:bg-navy-50/30"
              >
                <td className="relative px-3 py-2 text-navy/85">
                  {/* Полоска фоном — показывает относительный вес строки */}
                  <span
                    className={cn(
                      "absolute inset-y-1 left-1 -z-0 rounded-md",
                      i === 0
                        ? "bg-copper/10"
                        : i < 3
                        ? "bg-sky-100/60"
                        : "bg-navy-50/60"
                    )}
                    style={{
                      width: `calc(${max > 0 ? (r.count / max) * 100 : 0}% - 0.5rem)`,
                    }}
                    aria-hidden
                  />
                  <span className="relative">{r.value}</span>
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums text-navy">
                  {r.count.toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-navy/65">
                  {r.pct.toFixed(2)}%
                </td>
              </tr>
            ))}
            {!expanded && hidden > 0 && (
              <tr className="border-b border-navy/[0.04] bg-navy-50/30 last:border-0">
                <td className="px-3 py-2 italic text-navy/55">
                  + ещё {hidden} {hidden === 1 ? "тема" : "тем"} (свёрнуто)
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-navy/55">
                  {tailCount.toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-navy/55">
                  {tailPct.toFixed(2)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy/75 transition-colors hover:border-copper hover:text-copper"
        >
          {expanded
            ? `Свернуть до топ-${TOPIC_PAGE_SIZE}`
            : `Показать ещё ${hidden}`}
        </button>
      )}
    </div>
  );
}
