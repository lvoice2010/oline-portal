// Демо-журнал нейроассистента на входящую линию: лента диалогов за последние
// ~30 дней от сегодняшней даты (действующий проект — диалоги есть и сегодня).
// Шаблоны — диалоги с расшифровкой и ИИ-карточкой; эскалации ≈ 12%, как в отчёте.

import { dialogs, type Dialog, type DialogChannel } from "@/lib/mock-data";

type Line = NonNullable<Dialog["transcript"]>[number];

const EXTRA: Omit<Dialog, "id" | "serviceId" | "date" | "time">[] = [
  {
    channel: "whatsapp",
    topic: "Условия доставки",
    escalated: false,
    durationSec: 92,
    rating: 5,
    ai: {
      summary: "Клиент спросил о сроках и стоимости доставки в Казань. Нейроассистент назвал срок 2–3 дня и бесплатную доставку от 3 000 ₽.",
      category: "Заказы и доставка",
      subcategory: "Условия доставки",
    },
    transcript: [
      { speaker: "bot", text: "Здравствуйте! Я нейроассистент магазина. Чем могу помочь?", time: "00:00" },
      { speaker: "user", text: "Сколько идёт доставка в Казань и сколько стоит?", time: "00:05" },
      { speaker: "bot", text: "В Казань доставка курьером 2–3 дня. При заказе от 3 000 ₽ — бесплатно, иначе 290 ₽.", time: "00:08" },
      { speaker: "user", text: "А в пункт выдачи можно?", time: "00:21" },
      { speaker: "bot", text: "Да, в пункт выдачи — 1–2 дня, бесплатно от 1 500 ₽. Выбрать пункт можно при оформлении заказа.", time: "00:24" },
      { speaker: "user", text: "Понял, спасибо.", time: "00:35" },
    ] as Line[],
  },
  {
    channel: "chat",
    topic: "Бонусные баллы",
    escalated: false,
    durationSec: 88,
    rating: 4,
    ai: {
      summary: "Клиент уточнил баланс бонусных баллов и как ими оплатить заказ. Нейроассистент назвал баланс и правило списания до 30% суммы.",
      category: "Программа лояльности",
      subcategory: "Баланс и списание баллов",
    },
    transcript: [
      { speaker: "bot", text: "Здравствуйте! Чем могу помочь?", time: "00:00" },
      { speaker: "user", text: "Сколько у меня баллов и можно ли ими оплатить заказ?", time: "00:04" },
      { speaker: "bot", text: "На вашем счёте 1 240 баллов. Ими можно оплатить до 30% суммы заказа, 1 балл = 1 ₽.", time: "00:07" },
      { speaker: "user", text: "А они не сгорят?", time: "00:19" },
      { speaker: "bot", text: "Баллы действуют 12 месяцев с момента начисления. Ближайшие 300 баллов сгорят 15 декабря.", time: "00:22" },
      { speaker: "user", text: "Отлично, спасибо!", time: "00:31" },
    ] as Line[],
  },
  {
    channel: "telegram",
    topic: "Оплата и счета",
    escalated: false,
    durationSec: 78,
    rating: 5,
    ai: {
      summary: "Клиент спросил, почему не прошла оплата картой. Нейроассистент проверил заказ, предложил повторить оплату по новой ссылке — оплата прошла.",
      category: "Оплата",
      subcategory: "Ошибка оплаты картой",
    },
    transcript: [
      { speaker: "bot", text: "Здравствуйте! Я нейроассистент магазина. Чем помочь?", time: "00:00" },
      { speaker: "user", text: "Не проходит оплата заказа 5120, пишет ошибку.", time: "00:05" },
      { speaker: "bot", text: "Вижу заказ 5120: банк не подтвердил платёж. Отправляю новую ссылку на оплату — попробуйте ещё раз.", time: "00:08" },
      { speaker: "user", text: "Прошло!", time: "00:52" },
      { speaker: "bot", text: "Оплата получена, заказ передан в сборку. Спасибо!", time: "00:55" },
    ] as Line[],
  },
  {
    channel: "chat",
    topic: "Проверка совместимости товара",
    escalated: false,
    durationSec: 124,
    rating: 5,
    ai: {
      summary: "Клиент уточнил, подойдёт ли чехол к его модели телефона. Нейроассистент подтвердил совместимость и предложил защитное стекло.",
      category: "Консультация по товару",
      subcategory: "Совместимость",
    },
    transcript: [
      { speaker: "bot", text: "Здравствуйте! Чем могу помочь?", time: "00:00" },
      { speaker: "user", text: "Подойдёт ли чехол арт. 44812 к телефону Galaxy A55?", time: "00:06" },
      { speaker: "bot", text: "Да, чехол 44812 создан для Galaxy A55 — все вырезы под камеру и кнопки совпадают.", time: "00:09" },
      { speaker: "user", text: "А стекло к нему есть?", time: "00:24" },
      { speaker: "bot", text: "Есть защитное стекло арт. 51006, оно совместимо с этим чехлом. Добавить в корзину?", time: "00:27" },
      { speaker: "user", text: "Да, добавьте.", time: "00:40" },
      { speaker: "bot", text: "Добавил. В корзине 2 товара на 1 480 ₽.", time: "00:42" },
    ] as Line[],
  },
];

const pad = (n: number) => String(n).padStart(2, "0");
const TEXT_CHANNELS: DialogChannel[] = ["chat", "telegram", "whatsapp", "telegram", "chat"];

export function buildChatbotDialogs(now: Date = new Date()): Dialog[] {
  const enriched = dialogs.filter((d) => d.serviceId === "chatbot" && d.transcript && d.ai);
  const pool = [
    ...enriched.map(({ id: _id, serviceId: _s, date: _d, time: _t, ...rest }) => rest),
    ...EXTRA,
  ];
  // Дубли шаблонов (одна и та же расшифровка) убираем — оставляем по одному на тему
  const seen = new Set<string>();
  const uniq = pool.filter((t) => {
    const k = `${t.topic}|${t.escalated}|${t.channel === "phone"}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const closed = uniq.filter((t) => !t.escalated && t.channel !== "phone");
  const voice = uniq.filter((t) => t.channel === "phone");
  const escalated = uniq.filter((t) => t.escalated);

  const out: Dialog[] = [];
  let s = 0;
  // Нейроассистент работает круглосуточно. Сегодня — с полуночи до текущего
  // момента (диалоги «уже были»), в прошлые дни — 07:00–23:59.
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let d = 0; d <= 30; d++) {
    const perDay = d === 0 ? 7 : d === 1 ? 6 : d <= 6 ? 3 : d % 2 === 0 ? 2 : 1;
    const fromMin = d === 0 ? 10 : 7 * 60;
    const toMin = d === 0 ? Math.max(fromMin + perDay * 5, nowMin - 3) : 23 * 60 + 59;
    for (let j = 0; j < perDay; j++, s++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      const at = Math.round(fromMin + ((perDay - j - 0.15) / perDay) * (toMin - fromMin));
      const hour = Math.floor(at / 60);
      const minute = at % 60;
      const t =
        s % 8 === 3
          ? escalated[s % escalated.length]
          : s % 11 === 6 && voice.length
          ? voice[0]
          : closed[s % closed.length];
      const channel = t.channel === "phone" ? "phone" : t.escalated ? t.channel : TEXT_CHANNELS[s % TEXT_CHANNELS.length];
      out.push({
        ...t,
        id: `d-${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}-${pad(j + 1)}`,
        serviceId: "chatbot",
        date: `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`,
        time: `${pad(hour)}:${pad(minute)}:${pad((s * 29) % 60)}`,
        channel,
        durationSec: t.durationSec + ((s * 7) % 25) - 12,
        rating: t.escalated ? undefined : t.rating,
        hasRecording: channel === "phone" || t.escalated ? true : t.hasRecording,
      });
    }
  }
  return out.sort((a, b) => {
    const key = (x: Dialog) => x.date.split(".").reverse().join("") + x.time.replace(/:/g, "");
    return key(a) < key(b) ? 1 : -1;
  });
}
