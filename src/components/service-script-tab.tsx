"use client";

import * as React from "react";
import {
  Headset,
  User2,
  Info,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Calendar,
  ShieldCheck,
  Sparkles,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  serviceScripts,
  type ScriptSection,
  type ScriptStep,
} from "@/lib/mock-data";

const TONE_STYLE = {
  info: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", iconColor: "text-sky-600", Icon: Info },
  warn: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", iconColor: "text-amber-600", Icon: AlertTriangle },
  ok: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", iconColor: "text-emerald-600", Icon: CheckCircle2 },
} as const;

export function ServiceScriptTab({ serviceId }: { serviceId: string }) {
  const script = serviceScripts[serviceId];

  // Аккордеон: по умолчанию открыты первые 2 секции
  const [openSections, setOpenSections] = React.useState<Set<string>>(
    () => new Set(script?.sections.slice(0, 2).map((s) => s.id) ?? [])
  );

  if (!script) {
    return (
      <Card className="p-8 text-center text-sm text-navy/55">
        Скрипт для этой услуги пока не загружен в портал. Свяжитесь с менеджером.
      </Card>
    );
  }

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () =>
    setOpenSections(new Set(script.sections.map((s) => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  return (
    <div className="space-y-6">
      {/* Шапка скрипта */}
      <Card className="border-copper/25 bg-gradient-to-r from-copper/[0.06] via-white to-emerald-50/40 p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-copper">
              <Sparkles size={12} /> Скрипт оператора
            </p>
            <h2 className="mt-1 text-xl font-semibold text-navy">
              {script.serviceName}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-navy/70">
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
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-navy/55">
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} /> Обновлён {script.updatedAt}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={11} /> {script.approvedBy}
          </span>
        </div>
      </Card>

      {/* Кнопки управления аккордеоном */}
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
          Всего секций: <span className="font-semibold text-navy">{script.sections.length}</span> ·
          Обязательных: <span className="font-semibold text-navy">{script.sections.filter((s) => s.required).length}</span>
        </span>
      </div>

      {/* Секции скрипта */}
      <div className="space-y-3">
        {script.sections.map((section) => (
          <SectionAccordion
            key={section.id}
            section={section}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggle(section.id)}
          />
        ))}
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

function SectionAccordion({
  section,
  isOpen,
  onToggle,
}: {
  section: ScriptSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-navy-50/40"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-navy">{section.title}</h3>
            {section.required && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-700">
                Обязательно
              </span>
            )}
            {section.durationHint && (
              <span className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-navy-50 px-2 py-0.5 text-[10px] font-medium text-navy/65">
                {section.durationHint}
              </span>
            )}
          </div>
          {section.description && (
            <p className="mt-1 text-xs text-navy/55">{section.description}</p>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-navy/55 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="space-y-2.5 border-t border-navy/[0.06] bg-navy-50/30 p-5">
          {section.steps.map((step, i) => (
            <StepView key={i} step={step} />
          ))}
        </div>
      )}
    </Card>
  );
}

function StepView({ step }: { step: ScriptStep }) {
  if (step.kind === "note") {
    const style = TONE_STYLE[step.tone];
    const Icon = style.Icon;
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-card border px-3 py-2 text-xs leading-relaxed",
          style.bg,
          style.border,
          style.text
        )}
      >
        <Icon size={14} className={cn("mt-0.5 shrink-0", style.iconColor)} />
        <span>{step.text}</span>
      </div>
    );
  }

  if (step.kind === "client") {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-copper/90 px-4 py-2.5 text-sm text-white shadow-soft">
          {step.text}
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-copper/15 text-copper">
          <User2 size={14} />
        </span>
      </div>
    );
  }

  // operator
  return (
    <div className="flex gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-white">
        <Headset size={13} />
      </span>
      <div className="max-w-[85%] space-y-1.5">
        <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-navy shadow-soft">
          {step.text}
        </div>
        {step.alternatives && step.alternatives.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-navy/55 hover:text-navy">
              + {step.alternatives.length} альтернативн{step.alternatives.length === 1 ? "ая формулировка" : "ых формулировок"}
            </summary>
            <ul className="mt-2 space-y-1.5">
              {step.alternatives.map((alt, i) => (
                <li
                  key={i}
                  className="rounded-2xl rounded-bl-sm border border-dashed border-navy/15 bg-white/50 px-4 py-2 text-xs text-navy/75"
                >
                  {alt}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
