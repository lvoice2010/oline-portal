// ─────────────────────────────────────────────────────────────
// Демо-часовой механизм.
//
// Все мок-данные написаны как «сейчас = июнь 2026» (текущий незакрытый
// месяц — июнь, последний закрытый — май, «сегодня» ≈ 4 июня). Чтобы кабинет
// на показах клиентам всегда выглядел актуальным, мы НЕ переписываем данные, а
// сдвигаем все упоминания месяцев/дат вперёд на разницу между реальным «сейчас»
// и якорным июнем 2026. Данные фейковые — сдвиг делает демо «на сегодня» без
// ручного сопровождения.
//
// Применяется через demoizeDeep() к структурам отчётов и на дашборде, а также
// точечно (ротация годовой таблицы, «сегодня/вчера», индекс текущего месяца).
// ─────────────────────────────────────────────────────────────

const ANCHOR_YEAR = 2026;
const ANCHOR_MONTH = 5; // июнь (0-based) — «текущий» месяц в исходных данных

// Формы названий месяцев (0-based: 0 = январь)
const SHORT = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const NOM = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const PREP = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];
const DAT = ["январю", "февралю", "марту", "апрелю", "маю", "июню", "июлю", "августу", "сентябрю", "октябрю", "ноябрю", "декабрю"];

// Каждая форма ищется как отдельное слово; порядок важен (длинные — раньше).
const FORMS: string[][] = [NOM, GEN, PREP, DAT, SHORT];

function idxIn(form: string[], word: string): number {
  return form.findIndex((m) => m.toLowerCase() === word.toLowerCase());
}

/** Сколько месяцев прибавить: реальное «сейчас» минус якорный июнь 2026. */
export function monthShift(now: Date = new Date()): number {
  return (now.getFullYear() - ANCHOR_YEAR) * 12 + (now.getMonth() - ANCHOR_MONTH);
}

/** Индекс месяца 0..11 после сдвига (с переносом через год). */
export function shiftMonthIndex(monthIdx: number, shift: number): number {
  return ((monthIdx + shift) % 12 + 12) % 12;
}

// Регэксп по всем словоформам месяцев (границы — по буквам), плюс опц. год.
const ALL_WORDS = Array.from(new Set(FORMS.flat())).sort((a, b) => b.length - a.length);
const MONTH_RE = new RegExp(
  `(^|[^А-Яа-яЁё])(${ALL_WORDS.join("|")})(\\s+(?:20\\d\\d|\\d{2}))?(?![А-Яа-яЁё])`,
  "g"
);
// Даты формата dd.mm (например «14.05»)
const DDMM_RE = /\b([0-3]?\d)\.(0[1-9]|1[0-2])\b/g;

function daysInMonth(monthIdx: number, year: number): number {
  return new Date(year, monthIdx + 1, 0).getDate();
}

/** Сдвинуть все упоминания месяцев/дат в строке на shift месяцев. */
export function shiftDateString(input: string, shift: number): string {
  if (!shift || !input) return input;

  let out = input.replace(MONTH_RE, (_m, pre: string, word: string, yearPart?: string) => {
    // Находим, в какой форме записан месяц, и его индекс
    let formIdx = -1;
    let mIdx = -1;
    for (let f = 0; f < FORMS.length; f++) {
      const i = idxIn(FORMS[f], word);
      if (i >= 0) {
        formIdx = f;
        mIdx = i;
        break;
      }
    }
    if (mIdx < 0) return `${pre}${word}${yearPart ?? ""}`;

    const total = mIdx + shift;
    const newIdx = ((total % 12) + 12) % 12;
    // Сохраняем регистр первой буквы исходного слова
    let replacement = FORMS[formIdx][newIdx];
    if (word[0] === word[0].toUpperCase()) {
      replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
    } else {
      replacement = replacement.charAt(0).toLowerCase() + replacement.slice(1);
    }

    let newYearPart = yearPart ?? "";
    if (yearPart) {
      const raw = yearPart.trim();
      const y = Number(raw);
      const carriedYear = y + Math.floor(total / 12);
      // Сохраняем разрядность года (2-значный «25» / 4-значный «2026»)
      newYearPart = raw.length === 2 ? ` ${String(carriedYear).padStart(2, "0")}` : ` ${carriedYear}`;
    }
    return `${pre}${replacement}${newYearPart}`;
  });

  out = out.replace(DDMM_RE, (_m, dd: string, mm: string) => {
    const m0 = Number(mm) - 1;
    const newIdx = ((m0 + shift) % 12 + 12) % 12;
    const day = Math.min(Number(dd), daysInMonth(newIdx, ANCHOR_YEAR));
    return `${String(day).padStart(dd.length, "0")}.${String(newIdx + 1).padStart(2, "0")}`;
  });

  return out;
}

/** Рекурсивно клонирует структуру, сдвигая все строки-даты на текущий shift. */
export function demoizeDeep<T>(value: T, shift: number = monthShift()): T {
  if (!shift) return value;
  if (typeof value === "string") return shiftDateString(value, shift) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => demoizeDeep(v, shift)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = demoizeDeep(v, shift);
    }
    return out as T;
  }
  return value;
}

// ─────────── Абсолютные ярлыки «сегодня/вчера» и текущий месяц ───────────

/** Индекс реального текущего месяца (0..11). */
export function currentMonthIndex(now: Date = new Date()): number {
  return now.getMonth();
}

/** «31 августа 2026» */
export function longDateLabel(d: Date): string {
  return `${d.getDate()} ${GEN[d.getMonth()]} ${d.getFullYear()}`;
}

/** «30 августа» (без года) */
export function shortDateLabel(d: Date): string {
  return `${d.getDate()} ${GEN[d.getMonth()]}`;
}

export function todayDate(now: Date = new Date()): Date {
  return now;
}

export function yesterdayDate(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return d;
}

export const RU_SHORT_MONTHS = SHORT;
export const RU_NOM_MONTHS = NOM;
export const RU_DAT_MONTHS = DAT;

function parseDmy(s: string): Date | null {
  const p = s.split(".").map(Number);
  if (p.length < 3 || p.some((n) => Number.isNaN(n))) return null;
  return new Date(p[2], p[1] - 1, p[0]);
}
function fmtDmy(dt: Date): string {
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
}

/**
 * Демо-«сегодня» для журнала звонков: сдвигаем все даты на целое число дней так,
 * чтобы самый свежий звонок пришёлся на сегодня, а остальные — на недавние дни.
 * Журнал всегда актуален независимо от даты авторинга данных.
 */
export function shiftCallsToNow<T extends { date: string }>(
  list: T[],
  now: Date = new Date()
): T[] {
  if (!list.length) return list;
  let maxT = -Infinity;
  for (const c of list) {
    const dt = parseDmy(c.date);
    if (dt && dt.getTime() > maxT) maxT = dt.getTime();
  }
  if (maxT === -Infinity) return list;
  const offsetDays = Math.floor((now.getTime() - maxT) / 86400000);
  if (offsetDays <= 0) return list;
  return list.map((c) => {
    const dt = parseDmy(c.date);
    if (!dt) return c;
    dt.setDate(dt.getDate() + offsetDays);
    return { ...c, date: fmtDmy(dt) };
  });
}

// ─────────── Кварталы ───────────

/** Сдвиг в кварталах: квартал реального «сейчас» минус якорный Q2 2026. */
export function quarterShift(now: Date = new Date()): number {
  return (now.getFullYear() - ANCHOR_YEAR) * 4 + (Math.floor(now.getMonth() / 3) - Math.floor(ANCHOR_MONTH / 3));
}

/** Сдвинуть метки вида «Q1 2026» на shift кварталов (с переносом года). */
export function shiftQuarterString(input: string, shift: number = quarterShift()): string {
  if (!shift || !input) return input;
  return input.replace(/Q([1-4]) (20\d\d)/g, (_m, q: string, y: string) => {
    const total = Number(y) * 4 + (Number(q) - 1) + shift;
    return `Q${(total % 4) + 1} ${Math.floor(total / 4)}`;
  });
}

// ─────────── Сроки проектной исходящей кампании ───────────

const SHORT_GEN = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Кампания длится 13 недель; в демо-данных «сегодня» — 64-й день (идёт 10-я
 * неделя), до финиша 26 дней. Считаем даты от реального «сегодня», чтобы
 * прогресс кампании всегда был актуальным.
 */
export function outboundCampaignDates(now: Date = new Date()) {
  const start = addDays(now, -63);
  const end = addDays(now, 26);
  const weekLabels = Array.from({ length: 13 }, (_, i) => {
    const a = addDays(start, i * 7);
    const b = i === 12 ? end : addDays(a, 6);
    const range =
      a.getMonth() === b.getMonth()
        ? `${a.getDate()}–${b.getDate()} ${SHORT_GEN[b.getMonth()]}`
        : `${a.getDate()} ${SHORT_GEN[a.getMonth()]}–${b.getDate()} ${SHORT_GEN[b.getMonth()]}`;
    return `Нед ${i + 1} (${range})`;
  });
  return {
    startDate: fmtDmy(start),
    endDate: fmtDmy(end),
    today: fmtDmy(addDays(now, 0)),
    endLabel: shortDateLabel(end),
    weekLabels,
  };
}
