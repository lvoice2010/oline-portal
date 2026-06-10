"use client";

import * as React from "react";
import {
  X,
  PhoneOutgoing,
  Sparkles,
  User2,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OUTBOUND_OUTCOME_REASON_LABEL,
  type OutboundCall,
  type OutboundCallStatus,
  type OutboundOutcomeReason,
} from "@/lib/mock-data";
import {
  AiField,
  ScriptMatchBar,
  AudioPlayerStub,
  normalizePhone,
  UidRow,
} from "@/components/call-detail-modal";

// Бейдж статуса — трёхуровневый:
//   L1 — Дозвон / Нет дозвона
//   L2 — Целевое / Без целевого (только при дозвоне)
//   L3 — конкретная причина для «без целевого»
function TwoLevelStatusBadge({
  status,
  reason,
}: {
  status: OutboundCallStatus;
  reason?: OutboundOutcomeReason;
}) {
  if (status === "not_reached") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700">
        Нет дозвона
      </span>
    );
  }
  const isTarget = status === "target";
  return (
    <span className="inline-flex items-center overflow-hidden rounded-full border border-sky-200 bg-sky-50 text-[11px] font-medium">
      <span className="px-2.5 py-0.5 text-sky-700">Дозвон</span>
      <span
        className={cn(
          "px-2.5 py-0.5",
          isTarget ? "bg-emerald-500 text-white" : "bg-sky-100 text-sky-700/80"
        )}
      >
        {isTarget ? "Целевое" : "Без целевого"}
      </span>
      {!isTarget && reason && (
        <span className="bg-sky-200/70 px-2.5 py-0.5 text-sky-900/85">
          {OUTBOUND_OUTCOME_REASON_LABEL[reason]}
        </span>
      )}
    </span>
  );
}

function fmtDuration(sec: number): string {
  if (sec <= 0) return "—";
  if (sec < 60) return `${sec} сек`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} мин` : `${m} мин ${String(s).padStart(2, "0")} сек`;
}

export function OutboundCallDetailModal({
  open,
  onClose,
  call,
}: {
  open: boolean;
  onClose: () => void;
  call: OutboundCall | null;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !call) return null;

  const hasRecording = call.durationSec >= 20; // короткие гудки запись не делают

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col rounded-card bg-white shadow-soft-lg">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-navy">
                Просмотр исходящего · {call.date} {call.time}
              </h2>
              <TwoLevelStatusBadge
                status={call.status}
                reason={call.outcomeReason}
              />
              <span className="rounded-full border border-navy/15 bg-navy-50 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
                Попытка {call.attempt}/3
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-navy/45">
              Исходящая кампания · контакт {call.contactNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy/50 hover:bg-navy-50 hover:text-navy"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Тело */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Левая колонка — метаданные звонка */}
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                  Информация о звонке
                </p>
                <div className="overflow-hidden rounded-card border border-navy/[0.06] bg-white">
                  <UidRow uid={call.uid} />
                  <Row label="Контакт" value={call.contactNumber} mono />
                  <Row
                    label="Оператор"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <User2 size={12} className="text-navy/45" />[
                        {call.operator.id}] {call.operator.name}
                      </span>
                    }
                  />
                  <Row label="Попытка" value={`${call.attempt} из 3`} />
                  <Row
                    label="Длительность"
                    value={
                      call.durationSec > 0 ? fmtDuration(call.durationSec) : "—"
                    }
                  />
                  {call.topic && <Row label="Тема исхода" value={call.topic} />}
                  <Row
                    label="Статус"
                    value={
                      call.status === "not_reached"
                        ? "Нет дозвона"
                        : call.status === "target"
                        ? "Дозвон → Целевое"
                        : `Дозвон → Без целевого${
                            call.outcomeReason
                              ? ` → ${OUTBOUND_OUTCOME_REASON_LABEL[call.outcomeReason]}`
                              : ""
                          }`
                    }
                  />
                </div>
              </div>

              {/* Запись разговора — если звонок был достаточной длины */}
              {hasRecording && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                    <Headphones size={12} /> Запись разговора
                  </p>
                  <AudioPlayerStub duration={call.durationSec} />
                </div>
              )}
            </div>

            {/* Правая колонка — ИИ-карточка */}
            <div className="space-y-4">
              {call.ai ? (
                <>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-copper">
                    <Sparkles size={12} /> ИИ-карточка звонка
                  </p>
                  <div className="rounded-card border border-copper/30 bg-copper/[0.04] p-4">
                    <div className="space-y-3.5">
                      <AiField
                        label="Компания"
                        value={call.ai.companyName?.trim() || "—"}
                        empty={!call.ai.companyName?.trim()}
                      />
                      <AiField
                        label="ФИО клиента"
                        value={call.ai.clientName?.trim() || "—"}
                        empty={!call.ai.clientName?.trim()}
                      />
                      <AiField
                        label="phone_number"
                        value={normalizePhone(call.contactNumber)}
                        mono
                      />
                      <AiField
                        label="Попытка дозвона"
                        value={`${call.attempt} из 3`}
                      />
                      <AiField label="Суть разговора" value={call.ai.summary} />
                      <AiField label="Категория" value={call.ai.category} />
                      <AiField
                        label="Подкатегория"
                        value={call.ai.subcategory}
                      />
                    </div>

                    {/* Полоса соответствия скрипту */}
                    <div className="mt-5 border-t border-copper/20 pt-4">
                      <ScriptMatchBar value={call.ai.scriptMatch} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-card border border-dashed border-navy/15 bg-white p-6 text-center text-sm text-navy/45">
                  ИИ-карточка для этого звонка не сформирована
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Подвал */}
        <div className="flex items-center justify-between gap-3 border-t border-navy/[0.06] px-6 py-3">
          <p className="flex items-center gap-1.5 text-xs text-navy/55">
            <PhoneOutgoing size={12} /> Звонок № {call.id}
          </p>
          <button
            onClick={onClose}
            className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy-50"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy/[0.04] px-3 py-2 text-xs last:border-0">
      <span className="text-navy/55">{label}</span>
      <span className={cn("text-right text-navy", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
