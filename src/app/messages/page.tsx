"use client";

import * as React from "react";
import Link from "next/link";
import { Send, MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { connectedServices } from "@/lib/mock-data";

const TOPICS = [
  "Расширение пакета или новая услуга",
  "Финансовый вопрос — счета, акты, оплата",
  "Технический вопрос или инцидент",
  "Запрос на отчёт или выгрузку",
  "Другое",
];

export default function MessagesPage() {
  const [topic, setTopic] = React.useState<string>(TOPICS[0]);
  const [serviceId, setServiceId] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [sent, setSent] = React.useState(false);

  // Дефолтный менеджер — из первой активной услуги
  const defaultService =
    connectedServices.find((s) => s.stage === "active") ?? connectedServices[0];
  const manager = defaultService?.manager;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage("");
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-[1024px] space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Отправить сообщение</h1>
        <p className="mt-1 text-sm text-navy/55">
          Напишите вашему менеджеру или общему чату поддержки O&apos;LINE — мы
          ответим в течение 1 рабочего часа.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Левая колонка — менеджер */}
        <div className="space-y-4">
          {manager && (
            <Card className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-navy/45">
                Ваш менеджер
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                  {manager.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">{manager.name}</p>
                  <p className="text-xs text-navy/55">O&apos;LINE</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <a
                  href={`tel:${manager.phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy hover:border-copper hover:text-copper"
                >
                  <Phone size={14} />
                  <span className="tabular-nums">{manager.phone}</span>
                </a>
                <a
                  href={`https://t.me/${manager.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy hover:border-copper hover:text-copper"
                >
                  <MessageCircle size={14} />
                  <span>@{manager.telegram}</span>
                </a>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy/45">
              Сроки ответа
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-navy/70">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-copper" />
                Финансовые вопросы — до 4 рабочих часов
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-copper" />
                Технические вопросы — до 1 рабочего часа
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-copper" />
                Запросы на новую услугу — в течение дня
              </li>
            </ul>
          </Card>
        </div>

        {/* Правая колонка — форма */}
        <Card className="p-6 md:col-span-2">
          {sent ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={28} />
              </span>
              <p className="text-base font-semibold text-navy">
                Сообщение отправлено
              </p>
              <p className="max-w-sm text-sm text-navy/55">
                Менеджер уведомлён. Ответ придёт в Telegram или на email в
                течение указанного срока.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="topic"
                  className="mb-1.5 block text-xs font-medium text-navy/70"
                >
                  Тема обращения
                </label>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-copper"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="service"
                  className="mb-1.5 block text-xs font-medium text-navy/70"
                >
                  По какой услуге? (необязательно)
                </label>
                <select
                  id="service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-copper"
                >
                  <option value="">— Не выбрано / общий вопрос —</option>
                  {connectedServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-xs font-medium text-navy/70"
                >
                  Текст сообщения
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="Опишите задачу, вопрос или ситуацию. Если речь идёт об инциденте — добавьте время и шаги для воспроизведения."
                  className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-copper"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-navy/45">
                  Сообщение попадает в общую очередь поддержки и закреплённому
                  за вами менеджеру.
                </p>
                <button
                  type="submit"
                  disabled={message.trim().length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-copper px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-copper-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} /> Отправить
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>

      <Link
        href="/dashboard"
        className="inline-block text-xs text-navy/55 hover:text-navy"
      >
        ← Назад к дашборду
      </Link>
    </div>
  );
}
