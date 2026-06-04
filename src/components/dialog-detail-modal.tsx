"use client";

import * as React from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  Download,
  Sparkles,
  Bot,
  User2,
  Headset,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DIALOG_CHANNEL_LABEL, type Dialog } from "@/lib/mock-data";

function fmtTime(sec: number) {
  if (sec <= 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} мин` : `${m} мин ${String(s).padStart(2, "0")} сек`;
}

function AudioPlayerStub({ duration }: { duration: number }) {
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy/[0.04] px-3 py-2 last:border-0">
      <span className="text-[11px] uppercase tracking-wider text-navy/55">
        {label}
      </span>
      <span className="text-xs text-navy/85 text-right">{value}</span>
    </div>
  );
}

export function DialogDetailModal({
  open,
  onClose,
  dialog,
}: {
  open: boolean;
  onClose: () => void;
  dialog: Dialog | null;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !dialog) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col rounded-card bg-white shadow-soft-lg">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-navy">
                Просмотр диалога · {dialog.date} {dialog.time}
              </h2>
              <span className="rounded-full border border-navy/15 bg-navy-50 px-2.5 py-0.5 text-[11px] font-medium text-navy/75">
                {DIALOG_CHANNEL_LABEL[dialog.channel]}
              </span>
              {dialog.escalated ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                  Эскалирован на оператора
                </span>
              ) : (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  Закрыт нейроассистентом
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-navy/45">
              ID: {dialog.id} · тема «{dialog.topic}»
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
                  Информация о диалоге
                </p>
                <div className="overflow-hidden rounded-card border border-navy/[0.06] bg-white">
                  <Row label="Канал" value={DIALOG_CHANNEL_LABEL[dialog.channel]} />
                  <Row label="Тема" value={dialog.topic} />
                  <Row
                    label="Длительность"
                    value={fmtDuration(dialog.durationSec)}
                  />
                  <Row
                    label="Эскалация"
                    value={dialog.escalated ? "Да · оператор подключён" : "Нет · закрыто ИИ"}
                  />
                  <Row
                    label="Запись"
                    value={dialog.hasRecording ? "Есть" : "Только стенограмма"}
                  />
                </div>
              </div>
            </div>

            {/* Центр — ИИ-карточка */}
            <div className="space-y-4 lg:col-span-1">
              {dialog.ai ? (
                <>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-copper">
                    <Sparkles size={12} /> ИИ-карточка диалога
                  </p>
                  <div className="rounded-card border border-copper/30 bg-copper/[0.04] p-4">
                    <p className="mb-1 text-[11px] uppercase tracking-wider text-navy/55">
                      Суть обращения
                    </p>
                    <p className="text-sm leading-relaxed text-navy">
                      {dialog.ai.summary}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-copper/20 pt-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-navy/55">
                          Категория
                        </p>
                        <p className="text-sm font-medium text-navy">
                          {dialog.ai.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-navy/55">
                          Подкатегория
                        </p>
                        <p className="text-sm font-medium text-navy">
                          {dialog.ai.subcategory}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-card border border-dashed border-navy/15 bg-white p-6 text-center text-sm text-navy/45">
                  ИИ-карточка для этого диалога не сформирована
                </div>
              )}
            </div>

            {/* Правая колонка — стенограмма */}
            <div className="lg:col-span-1">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                Стенограмма
              </p>
              {dialog.transcript && dialog.transcript.length > 0 ? (
                <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-card border border-navy/[0.06] bg-navy-50/40 p-3">
                  {dialog.transcript.map((m, i) => {
                    const isUser = m.speaker === "user";
                    const speakerMeta =
                      m.speaker === "bot"
                        ? { label: "Нейроассистент", Icon: Bot }
                        : m.speaker === "agent"
                        ? { label: "Оператор", Icon: Headset }
                        : { label: "Клиент", Icon: User2 };
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col gap-0.5",
                          isUser ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                            isUser
                              ? "rounded-br-sm bg-copper text-white"
                              : m.speaker === "agent"
                              ? "rounded-bl-sm bg-amber-50 text-navy border border-amber-200"
                              : "rounded-bl-sm bg-white text-navy shadow-soft"
                          )}
                        >
                          {m.text}
                        </div>
                        <span className="flex items-center gap-1 px-1 text-[9px] text-navy/40">
                          <speakerMeta.Icon size={9} />
                          {speakerMeta.label} · {m.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-card border border-dashed border-navy/15 bg-white p-6 text-center text-sm text-navy/45">
                  Стенограмма для этого диалога не сформирована
                </div>
              )}
            </div>
          </div>

          {/* Запись разговора — внизу, если есть */}
          {dialog.hasRecording && (
            <div className="mt-6">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy/55">
                <Headphones size={12} /> Запись разговора
              </p>
              <AudioPlayerStub duration={dialog.durationSec} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
