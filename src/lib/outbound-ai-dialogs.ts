// Журнал разговоров нейроассистента на исходящие звонки
// (кампания «Реактивация спящих клиентов»). Даты считаются от сегодняшнего
// дня (daysAgo), чтобы журнал всегда совпадал со сроками кампании в отчёте.

import type { Dialog } from "@/lib/mock-data";

type Line = NonNullable<Dialog["transcript"]>[number];
type OutcomeKey =
  | "consent"
  | "consentAfterObjection"
  | "transfer"
  | "callback"
  | "refuseCompetitor"
  | "refusePrice"
  | "doNotCall"
  | "wrongPerson";

export const OUTBOUND_AI_RATE = 13.5; // ₽ за минуту разговора

const HELLO =
  "Здравствуйте! Это виртуальный помощник интернет-магазина «Ромашка». Удобно поговорить минуту?";

const T: Record<OutcomeKey, Line[]> = {
  consent: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Да, слушаю.", time: "00:06" },
    { speaker: "bot", text: "Вы давно у нас не заказывали, и мы подготовили для вас персональную скидку 15% на следующий заказ. Она действует 10 дней.", time: "00:08" },
    { speaker: "user", text: "А на что скидка? На всё?", time: "00:19" },
    { speaker: "bot", text: "На весь каталог, кроме товаров с красным ценником. В прошлый раз вы брали постельное бельё — сейчас как раз пришла новая коллекция.", time: "00:22" },
    { speaker: "user", text: "Интересно. Присылайте.", time: "00:36" },
    { speaker: "bot", text: "Отправляю промокод в SMS на этот номер. Он сработает при оформлении заказа на сайте или в приложении.", time: "00:39" },
    { speaker: "user", text: "Хорошо, спасибо.", time: "00:48" },
    { speaker: "bot", text: "Спасибо вам! Хорошего дня.", time: "00:50" },
  ],
  consentAfterObjection: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Ну давайте.", time: "00:05" },
    { speaker: "bot", text: "Вы давно у нас не заказывали, и мы подготовили для вас персональную скидку 15% на следующий заказ.", time: "00:07" },
    { speaker: "user", text: "Да у вас дорого, я сейчас в другом месте беру.", time: "00:15" },
    { speaker: "bot", text: "Понимаю. Со скидкой 15% и бесплатной доставкой от 2 000 ₽ цена выходит ниже, чем на маркетплейсах. Плюс на первый заказ после перерыва начисляем двойные баллы.", time: "00:19" },
    { speaker: "user", text: "Двойные баллы — это сколько?", time: "00:34" },
    { speaker: "bot", text: "10% от суммы заказа вернётся баллами, ими можно оплатить до половины следующей покупки.", time: "00:37" },
    { speaker: "user", text: "Ладно, присылайте, посмотрю.", time: "00:49" },
    { speaker: "bot", text: "Отправляю промокод в SMS. Спасибо, что выслушали!", time: "00:52" },
  ],
  transfer: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Да, говорите.", time: "00:05" },
    { speaker: "bot", text: "Вы давно у нас не заказывали, и мы подготовили для вас персональную скидку 15% на следующий заказ.", time: "00:07" },
    { speaker: "user", text: "Вообще мне как раз нужен матрас, но я не понимаю, какой выбрать. Можно с кем-то поговорить?", time: "00:15" },
    { speaker: "bot", text: "Конечно. Соединяю вас с менеджером — он поможет подобрать модель и сразу применит скидку. Одну секунду.", time: "00:24" },
    { speaker: "agent", text: "Добрый день, меня зовут Ольга, я менеджер магазина. Подскажите, на какой размер кровати смотрите и какую жёсткость предпочитаете?", time: "00:41" },
    { speaker: "user", text: "160 на 200, средняя жёсткость.", time: "00:52" },
    { speaker: "agent", text: "Отлично, подберу 3 варианта и пришлю в мессенджер со скидкой 15%. Удобно оформить сегодня?", time: "00:57" },
    { speaker: "user", text: "Да, давайте.", time: "01:08" },
  ],
  callback: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Нет, я сейчас за рулём.", time: "00:05" },
    { speaker: "bot", text: "Понял вас. Когда удобно перезвонить — сегодня вечером или завтра?", time: "00:08" },
    { speaker: "user", text: "Завтра после шести.", time: "00:14" },
    { speaker: "bot", text: "Записал: перезвоню завтра после 18:00. Хорошей дороги!", time: "00:17" },
  ],
  refuseCompetitor: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Слушаю.", time: "00:04" },
    { speaker: "bot", text: "Вы давно у нас не заказывали, и мы подготовили для вас персональную скидку 15% на следующий заказ.", time: "00:06" },
    { speaker: "user", text: "Спасибо, но я уже всё покупаю в другом магазине.", time: "00:14" },
    { speaker: "bot", text: "Понимаю. Если захотите сравнить — промокод будет действовать 10 дней. Прислать его в SMS?", time: "00:18" },
    { speaker: "user", text: "Нет, не нужно.", time: "00:26" },
    { speaker: "bot", text: "Хорошо, спасибо за ответ. Всего доброго!", time: "00:28" },
  ],
  refusePrice: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Да.", time: "00:04" },
    { speaker: "bot", text: "Вы давно у нас не заказывали, и мы подготовили для вас персональную скидку 15% на следующий заказ.", time: "00:06" },
    { speaker: "user", text: "Даже со скидкой у вас дороже, чем на маркетплейсе.", time: "00:14" },
    { speaker: "bot", text: "Понимаю. У нас бесплатная доставка от 2 000 ₽ и возврат в течение 30 дней — с учётом этого цена часто выходит ниже. Могу прислать промокод, чтобы вы сравнили?", time: "00:19" },
    { speaker: "user", text: "Нет, спасибо, пока не надо.", time: "00:33" },
    { speaker: "bot", text: "Хорошо. Спасибо, что уделили время!", time: "00:36" },
  ],
  doNotCall: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Нет. И больше мне не звоните, пожалуйста.", time: "00:05" },
    { speaker: "bot", text: "Извините за беспокойство. Убираю ваш номер из списка обзвона. Всего доброго!", time: "00:09" },
  ],
  wrongPerson: [
    { speaker: "bot", text: HELLO, time: "00:00" },
    { speaker: "user", text: "Вы ошиблись, я ничего у вас не заказывал. Это мой номер уже два года.", time: "00:05" },
    { speaker: "bot", text: "Извините, пожалуйста. Отмечу, что номер сменил владельца, больше звонить не будем.", time: "00:11" },
  ],
};

const OUTCOME: Record<
  OutcomeKey,
  {
    label: string;
    tone: NonNullable<Dialog["outbound"]>["outcomeTone"];
    transferred: boolean;
    category: string;
    subcategory: string;
    summary: string;
  }
> = {
  consent: {
    label: "Согласие — промокод в SMS",
    tone: "target",
    transferred: false,
    category: "Согласие",
    subcategory: "Промокод отправлен в SMS",
    summary: "Клиент заинтересовался персональной скидкой 15% и новой коллекцией. Нейроассистент отправил промокод в SMS, возражений не было.",
  },
  consentAfterObjection: {
    label: "Согласие — промокод в SMS",
    tone: "target",
    transferred: false,
    category: "Согласие",
    subcategory: "После возражения «дорого»",
    summary: "Клиент сначала отказался: «дорого, беру в другом месте». Нейроассистент рассказал про бесплатную доставку и двойные баллы на первый заказ — клиент согласился получить промокод.",
  },
  transfer: {
    label: "Передан менеджеру",
    tone: "target",
    transferred: true,
    category: "Передан менеджеру",
    subcategory: "Нужна помощь с выбором",
    summary: "Клиенту нужен матрас, но нужна консультация по выбору. Нейроассистент соединил его с менеджером. Менеджер пришлёт 3 варианта со скидкой 15%, заказ договорились оформить сегодня.",
  },
  callback: {
    label: "Перезвонить",
    tone: "warm",
    transferred: false,
    category: "Перезвонить",
    subcategory: "Неудобно говорить",
    summary: "Клиент за рулём. Нейроассистент сам назначил повторный звонок на завтра после 18:00.",
  },
  refuseCompetitor: {
    label: "Отказ",
    tone: "refuse",
    transferred: false,
    category: "Отказ",
    subcategory: "Покупает в другом месте",
    summary: "Клиент покупает в другом магазине. Нейроассистент предложил промокод для сравнения — клиент отказался.",
  },
  refusePrice: {
    label: "Отказ",
    tone: "refuse",
    transferred: false,
    category: "Отказ",
    subcategory: "Дорого",
    summary: "Клиент считает, что даже со скидкой дороже, чем на маркетплейсе. Нейроассистент рассказал о бесплатной доставке и возврате — клиент отказался.",
  },
  doNotCall: {
    label: "Не звонить",
    tone: "neutral",
    transferred: false,
    category: "Просит не звонить",
    subcategory: "Исключён из базы",
    summary: "Клиент попросил больше не звонить. Номер исключён из обзвона.",
  },
  wrongPerson: {
    label: "Номер сменил владельца",
    tone: "neutral",
    transferred: false,
    category: "Номер не актуален",
    subcategory: "Сменил владельца",
    summary: "Номер принадлежит другому человеку. Нейроассистент извинился и отметил номер как неактуальный.",
  },
};

// daysAgo, время, номер, сегмент, попытка, итог, длительность (сек)
const RAW: [number, string, string, string, number, OutcomeKey, number][] = [
  [0, "10:14:22", "+7 (916) 482-17-35", "Без заказа 3–6 месяцев", 1, "consent", 52],
  [0, "11:02:48", "+7 (903) 215-60-91", "Без заказа 6–12 месяцев", 2, "transfer", 74],
  [0, "12:36:05", "+7 (925) 704-33-18", "Без заказа больше года", 1, "refuseCompetitor", 31],
  [0, "18:21:40", "+7 (985) 330-27-64", "Без заказа 3–6 месяцев", 1, "callback", 20],
  [0, "19:47:12", "+7 (967) 118-92-05", "Без заказа 6–12 месяцев", 3, "consentAfterObjection", 56],
  [1, "10:41:30", "+7 (915) 640-81-27", "Без заказа больше года", 1, "doNotCall", 13],
  [1, "13:15:09", "+7 (926) 551-09-48", "Без заказа 3–6 месяцев", 2, "refusePrice", 39],
  [1, "18:58:44", "+7 (909) 273-45-10", "Без заказа 3–6 месяцев", 1, "consent", 53],
  [1, "20:12:31", "+7 (977) 820-14-66", "Без заказа 6–12 месяцев", 1, "wrongPerson", 15],
  [3, "11:27:16", "+7 (903) 994-28-71", "Без заказа 6–12 месяцев", 1, "transfer", 76],
  [4, "19:05:52", "+7 (916) 307-66-12", "Без заказа 3–6 месяцев", 2, "consent", 51],
  [6, "12:44:03", "+7 (929) 415-73-80", "Без заказа больше года", 3, "refuseCompetitor", 30],
  [9, "18:33:27", "+7 (962) 581-30-94", "Без заказа 3–6 месяцев", 1, "consentAfterObjection", 57],
  [12, "10:09:58", "+7 (905) 266-47-19", "Без заказа 6–12 месяцев", 1, "callback", 21],
  [15, "19:40:11", "+7 (999) 731-58-02", "Без заказа больше года", 2, "doNotCall", 12],
  [19, "13:52:36", "+7 (968) 402-91-57", "Без заказа 3–6 месяцев", 1, "transfer", 78],
];

const pad = (n: number) => String(n).padStart(2, "0");

export function buildOutboundAiDialogs(now: Date = new Date()): Dialog[] {
  return RAW.map(([daysAgo, time, contactNumber, segment, attempt, key, durationSec], i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const o = OUTCOME[key];
    return {
      id: `oa-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${String(i + 1).padStart(4, "0")}`,
      serviceId: "outbound-ai",
      date: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
      time,
      channel: "phone",
      topic: o.subcategory,
      escalated: o.transferred,
      durationSec,
      ai: { summary: o.summary, category: o.category, subcategory: o.subcategory },
      transcript: T[key],
      hasRecording: true,
      outbound: { contactNumber, segment, attempt, outcome: o.label, outcomeTone: o.tone },
    };
  });
}
