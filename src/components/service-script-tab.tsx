"use client";

import * as React from "react";
import {
  ChevronDown,
  Calendar,
  ShieldCheck,
  Sparkles,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  serviceScripts,
  type ScriptBlock,
  type ScriptBlockTone,
  type CalloutTone,
} from "@/lib/mock-data";

// Цвета разворачивающихся кнопок — крупный, как на бумажной портянке.
// Каждый тон — это смысловой код (см. mock-data.ts).
const TONE_BUTTON: Record<ScriptBlockTone, string> = {
  green:
    "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white",
  blue:
    "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
  red:
    "bg-rose-500 hover:bg-rose-600 border-rose-600 text-white",
  orange:
    "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white",
};

// Цветной кант у раскрытого блока — чтобы было видно «откуда вырос»
const TONE_BORDER: Record<ScriptBlockTone, string> = {
  green: "border-emerald-300 bg-emerald-50/40",
  blue: "border-sky-300 bg-sky-50/40",
  red: "border-rose-300 bg-rose-50/40",
  orange: "border-amber-300 bg-amber-50/40",
};

// Постоянно видимые заметки — не сворачиваются
const CALLOUT_STYLE: Record<
  CalloutTone,
  {
    bg: string;
    border: string;
    text: string;
    iconColor: string;
    Icon: typeof Info;
  }
> = {
  warn: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-900",
    iconColor: "text-rose-600",
    Icon: AlertTriangle,
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-300",
    text: "text-sky-900",
    iconColor: "text-sky-600",
    Icon: Info,
  },
  ok: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-900",
    iconColor: "text-emerald-600",
    Icon: CheckCircle2,
  },
};

// Простой рендер **жирного** внутри строки
function renderRichInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// Рендер блока контента: \n\n → абзацы, \n → перенос строки
function renderContent(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => (
    <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-navy/85">
      {renderRichInline(para)}
    </p>
  ));
}

export function ServiceScriptTab({ serviceId }: { serviceId: string }) {
  const script = serviceScripts[serviceId];

  // Какие разворачивающиеся блоки открыты (индекс в массиве blocks)
  const [openIdx, setOpenIdx] = React.useState<Set<number>>(new Set());

  if (!script) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        Скрипт для этой услуги пока не загружен в портал. Свяжитесь с менеджером.
      </Card>
    );
  }

  const expandableCount = script.blocks.filter(
    (b) => b.kind === "expandable"
  ).length;

  const toggle = (i: number) => {
    setOpenIdx((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const expandAll = () =>
    setOpenIdx(
      new Set(
        script.blocks
          .map((b, i) => (b.kind === "expandable" ? i : -1))
          .filter((i) => i >= 0)
      )
    );
  const collapseAll = () => setOpenIdx(new Set());

  return (
    <div className="space-y-5">
      {/* Метаданные скрипта */}
      <Card className="border-copper/25 bg-gradient-to-r from-copper/[0.06] via-white to-emerald-50/40 p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-copper">
              <Sparkles size={12} /> Скрипт оператора
            </p>
            <h2 className="mt-1 text-lg font-semibold text-navy">
              {script.serviceName}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-navy/65">
              {script.context}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck size={12} /> Версия {script.version}
            </span>
            <a
              href="/sample-invoice.pdf"
              download={`Скрипт_${script.serviceName.replace(/\s+/g, "_")}_v${script.version}.pdf`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-medium text-navy/75 transition-colors hover:border-copper hover:text-copper"
            >
              <Download size={13} /> Скачать PDF
            </a>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-navy/55">
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} /> Обновлён {script.updatedAt}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={11} /> {script.approvedBy}
          </span>
        </div>
      </Card>

      {/* Управление аккордеоном — над портянкой */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={expandAll}
          className="rounded-lg border border-navy/15 bg-white px-3 py-1.5 font-medium text-navy/75 hover:border-copper hover:text-copper"
        >
          Развернуть все
        </button>
        <button
          onClick={collapseAll}
          className="rounded-lg border border-navy/15 bg-white px-3 py-1.5 font-medium text-navy/75 hover:border-copper hover:text-copper"
        >
          Свернуть все
        </button>
        <span className="ml-auto text-navy/55">
          Раскрывающихся блоков:{" "}
          <span className="font-semibold text-navy">{expandableCount}</span>
        </span>
      </div>

      {/* Портянка скрипта — все блоки одним потоком */}
      <div className="space-y-3">
        {script.blocks.map((block, i) => {
          const key = `${block.kind}-${i}`;
          if (block.kind === "header") {
            return <HeaderBlock key={key} block={block} />;
          }
          if (block.kind === "callout") {
            return <CalloutBlock key={key} block={block} />;
          }
          return (
            <ExpandableBlock
              key={key}
              block={block}
              isOpen={openIdx.has(i)}
              onToggle={() => toggle(i)}
            />
          );
        })}
      </div>

      {/* Подвал */}
      <Card className="flex flex-wrap items-center justify-between gap-4 border-sky-200 bg-sky-50/60 p-5">
        <div>
          <p className="text-sm font-semibold text-sky-900">
            Нужно изменить скрипт?
          </p>
          <p className="mt-1 text-sm text-sky-800/85">
            Скрипт обновляется по согласованию с вашим менеджером. Все правки
            проходят утверждение и тестируются на выборке диалогов.
          </p>
        </div>
        <a
          href="/messages"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800"
        >
          Написать менеджеру
        </a>
      </Card>
    </div>
  );
}

// ── Шапка скрипта (имитирует «Приветствие по линии 8161» из старой версии) ──

function HeaderBlock({
  block,
}: {
  block: Extract<ScriptBlock, { kind: "header" }>;
}) {
  return (
    <div className="relative rounded-card border border-navy/20 bg-stone-50/60 pt-6 pb-6 px-6">
      {/* Бейдж с номером линии — наплыв на верхнюю границу, как «таб» */}
      {block.lineNumber && (
        <span className="absolute -top-3 left-6 rounded-md border border-navy/20 bg-stone-100 px-3 py-1 text-xs font-medium text-navy/75">
          Приветствие по линии {block.lineNumber}
        </span>
      )}
      <div className="space-y-3 text-center">
        <p className="text-base font-semibold text-navy">{block.greeting}</p>
        <p className="text-base text-navy">{renderRichInline(block.intro)}</p>
        {block.hint && (
          <p className="text-sm text-rose-700">
            <span className="font-bold">!</span> {renderRichInline(block.hint)}
          </p>
        )}
      </div>
      {block.topics && block.topics.length > 0 && (
        <div className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-lg border border-navy/20 bg-white">
          <table className="w-full text-sm">
            <tbody>
              {block.topics.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-navy/10 last:border-0"
                >
                  <td className="w-1/2 border-r border-navy/10 px-4 py-2 text-navy/80">
                    — {row.left}
                  </td>
                  <td className="w-1/2 px-4 py-2 text-navy/80">— {row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Постоянно видимая заметка (не сворачивается) ──

function CalloutBlock({
  block,
}: {
  block: Extract<ScriptBlock, { kind: "callout" }>;
}) {
  const style = CALLOUT_STYLE[block.tone];
  const Icon = style.Icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card border-2 px-5 py-4 text-sm leading-relaxed",
        style.bg,
        style.border,
        style.text
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", style.iconColor)} />
      <p className="whitespace-pre-line">{renderRichInline(block.text)}</p>
    </div>
  );
}

// ── Цветная разворачивающаяся кнопка ──

function ExpandableBlock({
  block,
  isOpen,
  onToggle,
}: {
  block: Extract<ScriptBlock, { kind: "expandable" }>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const buttonStyle = TONE_BUTTON[block.tone];
  const borderStyle = TONE_BORDER[block.tone];
  return (
    <div className="overflow-hidden rounded-card">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between gap-3 border-b-2 px-5 py-3.5 text-left font-semibold transition-colors",
          buttonStyle,
          isOpen ? "rounded-t-card" : "rounded-card"
        )}
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base">{block.title}</span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div
          className={cn(
            "space-y-3 rounded-b-card border-x-2 border-b-2 px-5 py-4",
            borderStyle
          )}
        >
          {renderContent(block.content)}
        </div>
      )}
    </div>
  );
}
