"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type Message = {
  from: "manager" | "client";
  text: string;
  time: string;
};

export function ChatManagerModal({
  open,
  onClose,
  manager,
}: {
  open: boolean;
  onClose: () => void;
  manager: { name: string; initials: string; phone: string };
}) {
  const toast = useToast();
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      from: "manager",
      text: `Здравствуйте! ${manager.name.split(" ")[1] ?? manager.name}, ваш менеджер. Готова ответить на любые вопросы по проектам.`,
      time: "Сегодня, 10:14",
    },
  ]);

  React.useEffect(() => {
    if (!open) setText("");
  }, [open]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setMessages((m) => [...m, { from: "client", text: trimmed, time: `Сегодня, ${hh}:${mm}` }]);
    setText("");
    toast(`Сообщение отправлено, ${manager.name.split(" ")[1] ?? "менеджер"} ответит в ближайшее время`);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Чат с ${manager.name}`}>
      <div className="-mx-6 -mb-5 flex flex-col">
        {/* Шапка с аватаром */}
        <div className="flex items-center gap-3 border-b border-navy/[0.06] px-6 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
            {manager.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-navy">{manager.name}</p>
            <p className="text-xs text-navy/55">
              Ваш менеджер · в сети
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
            </p>
          </div>
        </div>

        {/* Лента сообщений */}
        <div className="max-h-72 space-y-3 overflow-y-auto bg-navy-50/40 px-6 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={"flex flex-col gap-1 " + (m.from === "client" ? "items-end" : "items-start")}
            >
              <div
                className={
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm " +
                  (m.from === "client"
                    ? "rounded-br-sm bg-copper text-white"
                    : "rounded-bl-sm bg-white text-navy shadow-soft")
                }
              >
                {m.text}
              </div>
              <span className="px-1 text-[10px] text-navy/40">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Поле ввода */}
        <form onSubmit={send} className="flex items-center gap-2 border-t border-navy/[0.06] px-6 py-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите сообщение…"
            className="min-w-0 flex-1 rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-copper"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper text-white shadow-soft transition-colors hover:bg-copper-light disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Отправить"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Modal>
  );
}
