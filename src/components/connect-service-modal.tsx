"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const URGENCY = [
  { value: "asap", label: "Как можно скорее" },
  { value: "month", label: "В течение месяца" },
  { value: "curious", label: "Просто интересно" },
];

type Mode = "connect" | "demo";

export function ConnectServiceModal({
  open,
  onClose,
  serviceName,
  mode = "connect",
}: {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  mode?: Mode;
}) {
  const toast = useToast();
  const [urgency, setUrgency] = React.useState("asap");
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setUrgency(mode === "demo" ? "curious" : "asap");
    setComment(mode === "demo" ? "Хочу демо-доступ" : "");
  }, [open, mode]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    toast(
      mode === "demo"
        ? "Заявка на демо отправлена, менеджер свяжется в течение 24 часов"
        : "Заявка отправлена, менеджер свяжется в течение 24 часов"
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "demo" ? "Запросить демо" : "Подключить услугу"}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Услуга</label>
          <input
            value={serviceName}
            readOnly
            className="w-full rounded-xl border border-navy/15 bg-navy-50 px-3 py-2.5 text-sm text-navy"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Комментарий</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={
              mode === "demo"
                ? "Что хотите проверить в демо?"
                : "Опишите задачу или вопрос"
            }
            className="w-full resize-none rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-copper"
          />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-navy">Срочность</span>
          <div className="space-y-2">
            {URGENCY.map((u) => (
              <label
                key={u.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-navy/80"
              >
                <input
                  type="radio"
                  name="urgency"
                  value={u.value}
                  checked={urgency === u.value}
                  onChange={() => setUrgency(u.value)}
                  className="accent-copper"
                />
                {u.label}
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg">
          {mode === "demo" ? "Отправить заявку на демо" : "Отправить заявку"}
        </Button>
      </form>
    </Modal>
  );
}
