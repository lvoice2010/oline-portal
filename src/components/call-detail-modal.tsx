"use client";

import * as React from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  Download,
  PhoneCall,
  Sparkles,
  User2,
  Headphones,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Call } from "@/lib/mock-data";

function fmtTime(sec: number) {
  if (sec <= 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayerStub({ duration }: { duration: number }) {
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => {
        if (p >= duration) {
          setPlaying(false);
          return duration;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, duration]);

  const pct = duration > 0 ? (pos / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 rounded-card border border-navy/[0.06] bg-navy-50/40 p-3">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper text-white shadow-soft transition-colors hover:bg-copper-light"
        aria-label={playing ? "Пауза" : "Воспроизвести"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-8 items-end gap-0.5">
          {/* Псевдо-волна */}
          {Array.from({ length: 60 }).map((_, i) => {
            const done = (i / 60) * 100 < pct;
            const h = 4 + Math.abs(Math.sin(i * 0.7) * 18) + (i % 3) * 4;
            return (
              <div
                key={i}
                className={cn(
                  "w-[3px] shrink-0 rounded-full transition-colors",
                  done ? "bg-copper" : "bg-navy/20"
                )}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-navy/55">
          <span>{fmtTime(pos)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-navy/55">
        <Volume2 size={15} />
      </div>
      <button
        title="Скачать запись"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy/15 bg-white text-navy/70 hover:bg-navy-50"
      >
        <Download size={15} />
      </button>
    </div>
  );
}

const STATUS_LABEL = {
  answered: "Завершён",
  missed: "Пропущен",
  callback: "Перезвон",
} as const;

const STATUS_COLOR = {
  answered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  missed: "bg-rose-50 text-rose-700 border border-rose-200",
  callback: "bg-amber-50 text-amber-700 border border-amber-200",
} as const;

export function CallDetailModal({
  open,
  onClose,
  call,
}: {
  open: boolean;
  onClose: () => void;
  call: Call | null;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !call) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col rounded-card bg-white shadow-soft-lg">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-navy">
                Просмотр вызова · {call.date} {call.time}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  STATUS_COLOR[call.status]
                )}
              >
                {STATUS_LABEL[call.status]}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-navy/45">
              Очередь {call.queue.name}
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Левая колонка — метаданные */}
            <div className="space-y-4 lg:col-span-1">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                  Информация о вызове
                </p>
                <div className="overflow-hidden rounded-card border border-navy/[0.06] bg-white">
                  <UidRow uid={call.uid} />
                  <Row label="Номер звонящего" value={call.caller} mono />
                  <Row label="Номер назначения" value={call.destination} mono />
                  <Row label="Очередь" value={call.queue.name} />
                  <Row
                    label="Оператор"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <User2 size={12} className="text-navy/45" />
                        [{call.operator.id}] {call.operator.name}
                      </span>
                    }
                  />
                  <Row label="Ожидание" value={`${call.waitSec} сек`} />
                  <Row label="Длительность" value={`${call.durationSec} сек`} />
                  <Row label="Удержание (Hold)" value={`${call.holdSec} сек`} />
                  {call.topic && <Row label="Тема" value={call.topic} />}
                </div>
              </div>
            </div>

          {/* Центр — ИИ-карточка */}
          <div className="space-y-4 lg:col-span-1">
            {call.ai ? (
              <>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-copper">
                  <Sparkles size={12} /> ИИ-карточка вызова
                </p>
                <div className="rounded-card border border-copper/30 bg-copper/[0.04] p-4">
                  {/* Извлечённые поля — стопкой, как в админке оператора */}
                  <div className="space-y-3.5">
                    <AiField
                      label="ФИО клиента"
                      value={call.ai.clientName?.trim() || "—"}
                      empty={!call.ai.clientName?.trim()}
                    />
                    <AiField
                      label="phone_number"
                      value={normalizePhone(call.caller)}
                      mono
                    />
                    <AiField label="Суть обращения" value={call.ai.summary} />
                    <AiField label="Категория" value={call.ai.category} />
                    <AiField label="Подкатегория" value={call.ai.subcategory} />
                  </div>

                  {/* Соответствие скрипту — полоса прогресса внизу карточки */}
                  <div className="mt-5 border-t border-copper/20 pt-4">
                    <ScriptMatchBar value={call.ai.scriptMatch} />
                  </div>
                </div>

              </>
            ) : (
              <div className="rounded-card border border-dashed border-navy/15 bg-white p-6 text-center text-sm text-navy/45">
                ИИ-карточка для этого вызова не сформирована
              </div>
            )}
          </div>

          {/* Правая колонка — стенограмма */}
          <div className="lg:col-span-1">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-navy/55">
              Стенограмма
            </p>
            {call.transcript ? (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-card border border-navy/[0.06] bg-navy-50/40 p-3">
                {call.transcript.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-0.5",
                      m.speaker === "agent" ? "items-start" : "items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                        m.speaker === "agent"
                          ? "rounded-bl-sm bg-white text-navy shadow-soft"
                          : "rounded-br-sm bg-copper text-white"
                      )}
                    >
                      {m.text}
                    </div>
                    <span className="px-1 text-[9px] text-navy/40">
                      {m.speaker === "agent" ? "Оператор" : "Клиент"} · {m.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-navy/15 bg-white p-6 text-center text-sm text-navy/45">
                Расшифровка для этого вызова не сформирована
              </div>
            )}
            </div>
          </div>

          {/* Запись разговора — внизу под всеми блоками */}
          {call.hasRecording && (
            <div className="mt-6">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                <Headphones size={12} /> Запись разговора
              </p>
              <AudioPlayerStub duration={call.durationSec} />
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="flex items-center justify-between gap-3 border-t border-navy/[0.06] px-6 py-3">
          <p className="flex items-center gap-1.5 text-xs text-navy/55">
            <PhoneCall size={12} /> Вызов № {call.id}
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

// Поле в ИИ-карточке: жирный лейбл сверху, значение под ним.
// Такой вид привычен оператору — повторяет вёрстку их рабочей админки.
export function AiField({
  label,
  value,
  mono = false,
  empty = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  empty?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-navy">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm leading-relaxed",
          empty ? "text-navy/35" : "text-navy/85",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
}

// Полоса прогресса «Соответствие диалога скрипту».
// Цвет заливки — по порогу: 90+ зелёный, 75–89 янтарный, < 75 розовый.
// Фон всегда тёмный — текст белый поверх читается одинаково при любом %.
export function ScriptMatchBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 90
      ? "bg-emerald-500"
      : clamped >= 75
      ? "bg-amber-500"
      : clamped > 0
      ? "bg-rose-500"
      : "bg-transparent";
  return (
    <div className="relative h-10 w-full overflow-hidden rounded-lg bg-navy">
      {/* Цветная заливка по проценту */}
      <div
        className={cn("absolute inset-y-0 left-0 transition-[width]", tone)}
        style={{ width: `${clamped}%` }}
      />
      {/* Лейбл слева, процент справа — оба поверх полосы */}
      <div className="relative flex h-full items-center justify-between px-3.5 text-[12px] font-semibold text-white">
        <span>Соответствие диалога скрипту</span>
        <span className="tabular-nums">{Math.round(clamped)}%</span>
      </div>
    </div>
  );
}

// Преобразуем «+7 (495) 555-12-12» / «8 999 ...» → «74955551212» —
// именно в таком виде номер хранится во внутренних системах
// (поле phone_number из карточки оператора).
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Россия: '8XXX...' → '7XXX...'
  if (digits.length === 11 && digits.startsWith("8")) return "7" + digits.slice(1);
  return digits;
}

// Строка с UID + кнопкой «Скопировать ссылку на вызов».
// Ссылка имеет формат <origin>?call=<uid> — можно отправить коллеге,
// он откроет портал и попадёт прямо на этот вызов (deep-link).
function UidRow({ uid }: { uid: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    const link = `${origin}?call=${encodeURIComponent(uid)}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // Фоллбэк для старых браузеров / iframe
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // молча — кнопка просто не обновит состояние
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy/[0.04] px-3 py-2 text-xs">
      <span className="text-navy/55">UID вызова</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-[11px] text-navy" title={uid}>
          {uid}
        </span>
        <button
          onClick={handleCopy}
          title="Скопировать ссылку на вызов"
          aria-label="Скопировать ссылку на вызов"
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-navy/15 bg-white text-navy/70 hover:border-copper hover:text-copper"
          )}
        >
          {copied ? <Check size={13} /> : <LinkIcon size={13} />}
        </button>
      </div>
    </div>
  );
}
