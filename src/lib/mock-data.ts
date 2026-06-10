// Все данные прототипа. Никаких реальных API.

export const user = {
  name: "Анна Иванова",
  company: "ООО Ромашка",
  position: "Руководитель клиентского сервиса",
  phone: "+7 (495) 120-45-67",
  email: "a.ivanova@romashka.ru",
};

export const lastUpdated = "18 мая 2026, 09:40";

export const kpis = [
  { label: "Принято звонков сегодня", value: "1 247", delta: "↑ 12% к среднему", tone: "up" },
  { label: "Среднее время ожидания (ASA)", value: "18 сек", delta: "✓ в SLA", tone: "ok" },
  { label: "SLA", value: "94%", delta: "✓ норма", tone: "ok" },
  { label: "Пропущено", value: "3.2%", delta: "↓ 0.5%", tone: "up" },
] as const;

export type LaunchStepState = "done" | "current" | "pending";

// Единый жизненный цикл услуги от заявки до работы
export const SERVICE_STAGES = [
  { id: "submitted", label: "Заявка" },
  { id: "negotiating", label: "Согласование" },
  { id: "approved", label: "Согласовано" },
  { id: "launching", label: "Запуск" },
  { id: "active", label: "Активна" },
] as const;
export type ServiceStage = (typeof SERVICE_STAGES)[number]["id"];

export type ConnectedService = {
  id: string;
  name: string;
  billingNote?: string; // «Поминутная тарификация», «Выделенные операторы (FTE)»…
  stage: ServiceStage;
  metricLabel?: string; // только для active
  metricValue?: string;
  // Расход минут за текущий месяц (для активных услуг)
  usage?: {
    label: string;
    used: number;
    unit: string;
    // limit отсутствует — модель post-pay (оплата по факту использования)
    limit?: number;
    // ставка для post-pay (₽ за единицу) — чтобы посчитать «к оплате»
    rate?: number;
    // двойной тариф (например, у нейроассистента: текст по штукам + голос по минутам)
    mixedRates?: {
      textUnit: string;
      textRate: number;
      voiceUnit: string;
      voiceRate: number;
    };
    // примерная накопленная стоимость (когда rate один невозможно — для mixedRates)
    approxCost?: number;
  };
  // Дополнительные мини-метрики (ASA, SLA, дозвон и т.п.)
  extraMetrics?: {
    label: string;
    value: string;
    tone?: "ok" | "warn" | "neutral";
    tooltip?: string;
  }[];
  submittedAt: string; // дата подачи заявки
  connectedAt?: string; // дата подключения (для active/launching)
  lastContactAt?: string; // для negotiating — последний контакт менеджера
  stageNote?: string; // короткая подпись под stepper про текущий этап
  manager: { name: string; initials: string; phone: string; telegram: string };
  tariff?: string;
  contract?: string; // если задано — в шапке услуги показываем «Договор», а не «Тариф»
  counterparty?: string; // контрагент по договору
  volume?: string;
  extra?: string;
  schedule?: string; // график работы
  includes?: string[]; // что входит в пакет
  // Если идёт запуск — детальный sub-stepper и прогресс
  launch?: {
    currentStepTitle: string;
    progress: number; // 0-100
    eta: string;
    steps: { title: string; state: LaunchStepState }[];
  };
};

export const connectedServices: ConnectedService[] = [
  {
    id: "hotline-247",
    name: "Горячая Линия Панго Карс",
    billingNote: "Поминутная тарификация",
    stage: "active",
    metricLabel: "Принято за месяц",
    metricValue: "1 430",
    usage: { label: "Минуты в этом месяце", used: 430, limit: 3500, unit: "мин" },
    extraMetrics: [
      {
        label: "ASA",
        value: "18 сек",
        tone: "ok",
        tooltip:
          "Average Speed of Answer — среднее время ответа на звонок (от попадания в очередь до соединения с оператором).",
      },
      {
        label: "SLA",
        value: "94/20",
        tone: "ok",
        tooltip:
          "Service Level — 94% звонков приняты в пределах 20 секунд. Норматив по договору: 80/20 (80% за 20 сек).",
      },
      {
        label: "AR",
        value: "3.2%",
        tone: "ok",
        tooltip:
          "Abandonment Rate — доля звонков, на которые клиент не дождался ответа и положил трубку.",
      },
    ],
    submittedAt: "20.12.2025",
    connectedAt: "12.01.2026",
    manager: { name: "Перерва Валерия", initials: "ПВ", phone: "+7 (495) 120-45-71", telegram: "pererva_oline" },
    tariff: "Поминутный, 19,8 ₽/мин (пакет 3 500 мин)",
    contract: "№ 03-07/2026 от 04.05.2026",
    counterparty: "ООО «Перформанс Контакт»",
    schedule: "24/7, без выходных и праздников",
    includes: [
      "Приём входящих звонков 24/7",
      "Поддержка на русском языке",
      "Автоматический callback по пропущенным звонкам",
      "Перезвон по заявкам с сайта",
      "Запись всех разговоров и хранение 90 дней",
      "Ежемесячный отчёт SLA / ASA / AR",
    ],
  },
  {
    id: "hotline-fte",
    name: "Горячая Линия Адамас",
    billingNote: "Выделенные операторы (FTE)",
    stage: "active",
    metricLabel: "Принято за месяц",
    metricValue: "14 320",
    usage: { label: "Чел-часов в этом месяце", used: 128, limit: 720, unit: "чел-ч" },
    extraMetrics: [
      {
        label: "FTE",
        value: "4 чел.",
        tone: "neutral",
        tooltip:
          "Full-Time Equivalent — количество операторов, выделенных на проект на полную смену.",
      },
      {
        label: "ASA",
        value: "22 сек",
        tone: "ok",
        tooltip:
          "Average Speed of Answer — среднее время ответа на звонок (от попадания в очередь до соединения с оператором).",
      },
      {
        label: "SLA",
        value: "92/20",
        tone: "ok",
        tooltip:
          "Service Level — 92% звонков приняты в пределах 20 секунд. Норматив по договору: 80/20 (80% за 20 сек).",
      },
    ],
    submittedAt: "10.02.2026",
    connectedAt: "01.03.2026",
    manager: { name: "Перерва Валерия", initials: "ПВ", phone: "+7 (495) 120-45-71", telegram: "pererva_oline" },
    tariff: "FTE-проект, 4 оператора",
    contract: "№ 05-12/2026 от 18.02.2026",
    counterparty: "ООО «Перформанс Контакт»",
    schedule: "Пн–Пт, 09:00–18:00 (мск)",
    includes: [
      "Выделенная команда из 4 операторов под ваш проект",
      "Перезвон по пропущенным и заявкам с сайта в течение 15 минут",
      "Работа по вашим скриптам и регламентам — без общих очередей",
      "Запись и стенограмма всех разговоров, хранение 90 дней",
      "Ежемесячный отчёт",
    ],
  },
  {
    id: "outbound-q2",
    name: "Исходящая кампания Q2 2026",
    stage: "active",
    metricLabel: "Звонков совершено",
    metricValue: "5 750",
    usage: { label: "Минуты обзвона в этом месяце", used: 2300, limit: 5000, unit: "мин" },
    extraMetrics: [
      {
        label: "База",
        value: "46%",
        tone: "neutral",
        tooltip:
          "Доля контактов базы, по которым уже завершена обработка (5 750 из 12 500 контактов).",
      },
      {
        label: "Дозвон",
        value: "68%",
        tone: "ok",
        tooltip:
          "Доля попыток дозвона, которые завершились разговором с человеком (контактом базы).",
      },
      {
        label: "Конверсия",
        value: "23.4%",
        tone: "ok",
        tooltip:
          "Доля результативных контактов: целевое действие (согласие, продажа, лид) от общего числа разговоров.",
      },
    ],
    submittedAt: "15.03.2026",
    connectedAt: "02.04.2026",
    manager: { name: "Юля Головина", initials: "ЮГ", phone: "+7 (495) 120-45-77", telegram: "golovina_oline" },
    tariff: "Проектный, FTE 4",
    volume: "база 12 500 контактов",
    extra: "Прозвон Пн–Пт 09:00–20:00",
  },
  {
    id: "quarter-report",
    name: "Ежеквартальный ИИ-отчёт",
    billingNote: "Квартальный анализ обращений",
    stage: "active",
    metricLabel: "Следующий отчёт",
    metricValue: "15.07.2026",
    extraMetrics: [
      {
        label: "Последний отчёт",
        value: "Q1 2026",
        tone: "neutral",
        tooltip:
          "Готов 15.04.2026 · 1 820 обращений в выборке за квартал",
      },
      {
        label: "Рекомендаций",
        value: "5",
        tone: "ok",
        tooltip:
          "Действенные рекомендации с прогнозом эффекта на продажи. 2 из 5 уже отмечены клиентом как выполненные.",
      },
      {
        label: "Выполнено",
        value: "40%",
        tone: "ok",
        tooltip:
          "Доля выполненных рекомендаций из последнего отчёта. Учитывается в следующем анализе.",
      },
    ],
    submittedAt: "01.01.2026",
    connectedAt: "10.01.2026",
    manager: { name: "Перерва Валерия", initials: "ПВ", phone: "+7 (495) 120-45-71", telegram: "pererva_oline" },
    tariff: "25 000 ₽/квартал",
    volume: "1 отчёт в квартал",
    extra: "Презентация и выгрузка PDF",
    schedule: "1 раз в квартал, готовность 15-го числа после закрытия квартала",
    includes: [
      "Анализ 100% обращений за квартал",
      "Карта проблем с ранжированием по частоте",
      "5–10 рекомендаций с прогнозом эффекта на продажи",
      "Презентация результатов команде (online или офлайн)",
      "Выгрузка отчёта в PDF",
      "Сравнение с предыдущим кварталом",
    ],
  },
  {
    id: "qa-control",
    name: "Контроль качества",
    stage: "negotiating",
    submittedAt: "12.05.2026",
    lastContactAt: "17.05.2026",
    stageNote: "Менеджер уточняет чек-листы и объём оценки",
    manager: { name: "Перерва Валерия", initials: "ПВ", phone: "+7 (495) 120-45-71", telegram: "pererva_oline" },
  },
  {
    id: "chatbot",
    name: "Нейроассистент на входящую линию",
    billingNote: "Оплата по факту использования",
    stage: "active",
    usage: {
      label: "Диалогов в этом месяце",
      used: 240,
      unit: "диалогов",
      // двойная тарификация: текст 13 ₽/диалог + голос 13,5 ₽/мин
      mixedRates: {
        textUnit: "диалог",
        textRate: 13,
        voiceUnit: "мин",
        voiceRate: 13.5,
      },
      // ≈ 228 текст × 13 + 12 голос × 1,5 мин × 13,5 ≈ 3 200 ₽
      approxCost: 3200,
    },
    extraMetrics: [
      {
        label: "Обработано ИИ",
        value: "88%",
        tone: "ok",
        tooltip:
          "Доля диалогов, в которых нейроассистент закрыл вопрос самостоятельно, без передачи оператору.",
      },
      {
        label: "Эскалаций",
        value: "12%",
        tone: "neutral",
        tooltip:
          "Доля диалогов, переданных на живого оператора при сложных или нестандартных вопросах.",
      },
    ],
    submittedAt: "20.04.2026",
    connectedAt: "10.05.2026",
    manager: { name: "Светлана Носенко", initials: "СН", phone: "+7 (495) 120-45-83", telegram: "nosenko_oline" },
    tariff: "Оплата по факту: текстовый диалог 13 ₽/шт · голосовой звонок 13,5 ₽/мин",
    contract: "№ 04-11/2026 от 15.04.2026",
    counterparty: "ООО «Перформанс Контакт»",
    schedule: "24/7, без ограничений",
    includes: [
      "Нейроассистент 24/7 — отвечает мгновенно",
      "Поддержка на русском и английском",
      "Подключение к вашей базе знаний и CRM",
      "Эскалация на оператора при сложных вопросах",
      "Запись и анализ всех диалогов",
      "Ежемесячный отчёт",
    ],
  },
];

export type PromoCta = "connect" | "try" | "request";
export type PromoTone = "copper" | "navy" | "teal" | "violet" | "amber";

export type CatalogService = {
  id: string;
  name: string;
  description: string;
  category: "вход" | "исход" | "аналитика" | "QA";
  price?: string;
  features?: string[];
  demoAvailable?: boolean;
  recommendReason?: string;
  badges: { label: string; variant: "new" | "season" | "industry" | "recommend" }[];
  soon?: boolean;
  // Промо-карточка на дашборде (стиль «Рекомендаций» Mango)
  promo?: {
    eyebrow?: string; // напр. «Новая функция»
    headline: string; // короткий заголовок, может отличаться от name
    blurb: string; // 1-2 строки
    cta: PromoCta;
    illustration: "analytics" | "qa" | "assistant" | "secretary" | "callback" | "season";
    tone: PromoTone;
    tag?: string; // маленькая пилюля справа внизу (аналог «Реклама»)
  };
};

// Демо-статистика, которую клиент видит до подключения услуги.
// Берётся обезличенный пример другого клиента, чтобы показать,
// какой отчёт он получит после подключения.
export type DemoStat = {
  serviceName: string;
  source: string;
  kpis: { label: string; value: string; delta?: string }[];
  barChart: {
    title: string;
    unit?: string;
    data: { name: string; value: number }[];
  };
  lineChart: {
    title: string;
    yLabel: string;
    data: { period: string; value: number }[];
  };
};

export const demoStats: Record<string, DemoStat> = {
  "qa-control": {
    serviceName: "Контроль качества звонков",
    source:
      "Обезличенные данные клиента в сфере услуг, чек-лист из 18 пунктов, апрель 2026.",
    kpis: [
      { label: "Средний балл", value: "7.8 / 10", delta: "+0.4" },
      { label: "Диалогов оценено", value: "1 240" },
      { label: "Операторов в аудите", value: "12" },
    ],
    barChart: {
      title: "Топ операторов по среднему баллу",
      data: [
        { name: "А. Соколова", value: 9.1 },
        { name: "Д. Белов", value: 8.7 },
        { name: "Е. Кузнецов", value: 8.4 },
        { name: "Н. Орлова", value: 7.9 },
        { name: "М. Игнатьев", value: 7.2 },
      ],
    },
    lineChart: {
      title: "Динамика среднего балла",
      yLabel: "балл",
      data: [
        { period: "Нед. 1", value: 7.2 },
        { period: "Нед. 2", value: 7.4 },
        { period: "Нед. 3", value: 7.5 },
        { period: "Нед. 4", value: 7.7 },
        { period: "Нед. 5", value: 7.8 },
      ],
    },
  },
  chatbot: {
    serviceName: "Нейроассистент",
    source:
      "Обезличенные данные клиента в ритейле, голосовой нейроассистент, май 2026.",
    kpis: [
      { label: "Снято нейроассистентом", value: "42%", delta: "+11%" },
      { label: "Среднее время диалога", value: "47 сек" },
      { label: "Типовых сценариев", value: "7" },
    ],
    barChart: {
      title: "Топ сценариев нейроассистента",
      unit: "%",
      data: [
        { name: "Статус заказа", value: 38 },
        { name: "Часы работы", value: 21 },
        { name: "Адрес и доставка", value: 16 },
        { name: "Перевод на оператора", value: 14 },
        { name: "FAQ", value: 11 },
      ],
    },
    lineChart: {
      title: "Доля автообработки по неделям",
      yLabel: "%",
      data: [
        { period: "Нед. 1", value: 28 },
        { period: "Нед. 2", value: 32 },
        { period: "Нед. 3", value: 35 },
        { period: "Нед. 4", value: 39 },
        { period: "Нед. 5", value: 42 },
      ],
    },
  },
  "virtual-secretary": {
    serviceName: "Виртуальный секретарь",
    source:
      "Обезличенные данные клиента в B2B-услугах, нерабочее время + выходные, апрель 2026.",
    kpis: [
      { label: "Звонков обработано", value: "96%" },
      { label: "Среднее время приёма", value: "4 сек" },
      { label: "Перенаправлено правильно", value: "88%" },
    ],
    barChart: {
      title: "Куда перенаправлены звонки",
      unit: "%",
      data: [
        { name: "Отдел продаж", value: 38 },
        { name: "Тех. поддержка", value: 24 },
        { name: "Бухгалтерия", value: 12 },
        { name: "Руководитель", value: 8 },
        { name: "Не определено", value: 18 },
      ],
    },
    lineChart: {
      title: "Звонки по часам нерабочего времени",
      yLabel: "звонков",
      data: [
        { period: "19:00", value: 24 },
        { period: "21:00", value: 31 },
        { period: "23:00", value: 18 },
        { period: "01:00", value: 6 },
        { period: "07:00", value: 12 },
        { period: "09:00", value: 28 },
      ],
    },
  },
};

// ──────────── ЕЖЕКВАРТАЛЬНЫЙ ОТЧЁТ (новая услуга) ────────────

export type QuarterlyReport = {
  period: string;
  dateRange: string;
  analyzedSegment: string;
  totalAnalyzed: number; // всего обращений в выборке за квартал
  intro: string;
  problems: {
    title: string;
    description: string;
    count: number; // сколько обращений касалось этой проблемы
    share: number; // % от общего объёма обращений
  }[];
  recommendations: {
    title: string;
    actions: string[];
    potentialGrowth: { min: number; max: number };
  }[];
  conclusion: string;
  totalPotentialGrowth: { min: number; max: number };
};

export const quarterlyReport: QuarterlyReport = {
  period: "Q1 2025",
  dateRange: "01–26 марта 2025",
  analyzedSegment:
    "Интернет-магазин и розничные точки. Источник — обращения клиентов в линию поддержки.",
  totalAnalyzed: 1820,
  intro:
    "На основании анализа обращений клиентов, поступивших в период с 1 по 26 марта 2025 года, проведён обзор взаимодействия покупателей с интернет-магазином и розничными точками. Выявлены ключевые проблемы, влияющие на качество обслуживания, и предложены рекомендации по их устранению с целью повышения лояльности клиентов и роста продаж.",
  problems: [
    {
      title: "Технические неполадки на сайте",
      description:
        "Клиенты сталкиваются с неработающими кнопками (например, «Подтвердить корзину»), сбоями при оплате и трудностями с авторизацией. Часто упоминаются проблемы с восстановлением пароля из-за отсутствия писем для сброса.",
      count: 437,
      share: 24,
    },
    {
      title: "Проблемы с доставкой",
      description:
        "Задержки заказов, ошибки в адресах доставки и невозможность оперативно изменить способ или время доставки после оформления заказа. Дополнительно клиенты отмечают недостаток коммуникации с курьерами.",
      count: 382,
      share: 21,
    },
    {
      title: "Качество товаров и процедуры возврата",
      description:
        "Покупатели жалуются на несоответствие товаров описанию, наличие брака и низкое качество (например, быстрый износ джинсов). Процедура возврата воспринимается как сложная и длительная из-за нехватки информации о статусе и задержек с возвратом средств.",
      count: 327,
      share: 18,
    },
    {
      title: "Программа лояльности",
      description:
        "Некорректное начисление и списание бонусных баллов, сбои в отправке SMS-кодов для подтверждения операций, ограниченная видимость истории операций в личном кабинете.",
      count: 218,
      share: 12,
    },
    {
      title: "Информирование клиентов",
      description:
        "Отсутствие актуальной информации о наличии товаров в магазинах, непрозрачные условия акций и скидок, трудности с доступом к контактным данным вызывают недовольство клиентов.",
      count: 164,
      share: 9,
    },
  ],
  recommendations: [
    {
      title: "Улучшение технической поддержки и функциональности сайта",
      actions: [
        "Провести полный аудит сайта для устранения ошибок в оформлении заказа, оплате и авторизации.",
        "Упростить восстановление пароля, обеспечив стабильную отправку писем и добавив альтернативные способы (например, SMS).",
        "Внедрить систему мониторинга сайта в реальном времени для быстрого устранения сбоев.",
      ],
      potentialGrowth: { min: 10, max: 15 },
    },
    {
      title: "Оптимизация логистики и коммуникации по доставке",
      actions: [
        "Усилить контроль за логистическими партнёрами для минимизации задержек и ошибок.",
        "Добавить возможность изменения адреса, способа или времени доставки в личном кабинете на этапе обработки заказа.",
        "Внедрить отслеживание статуса доставки в реальном времени и обеспечить доступ к контактам курьеров.",
      ],
      potentialGrowth: { min: 5, max: 10 },
    },
    {
      title: "Контроль качества товаров и упрощение процедуры возврата",
      actions: [
        "Ввести дополнительную проверку товаров перед отправкой для сокращения жалоб на брак.",
        "Упростить процесс возврата: понятные инструкции в личном кабинете и онлайн-отслеживание статуса.",
        "Сократить сроки обработки возвратов до 5–7 рабочих дней с уведомлением клиентов на каждом этапе.",
      ],
      potentialGrowth: { min: 7, max: 12 },
    },
    {
      title: "Модернизация программы лояльности",
      actions: [
        "Исправить сбои в начислении и списании баллов, обеспечить стабильную отправку SMS-кодов.",
        "Добавить в личный кабинет раздел с историей операций и инструментами управления баллами.",
        "Провести разъяснительную кампанию о правилах программы.",
      ],
      potentialGrowth: { min: 3, max: 5 },
    },
    {
      title: "Улучшение информирования клиентов",
      actions: [
        "Обновлять данные о наличии товаров в магазинах на сайте в реальном времени.",
        "Разместить чёткие условия акций и скидок, избегая двусмысленностей.",
        "Создать раздел с контактной информацией магазинов и интерактивной картой.",
      ],
      potentialGrowth: { min: 2, max: 4 },
    },
  ],
  conclusion:
    "Выявленные проблемы — технические сбои, сложности с доставкой, качество товаров, недостатки программы лояльности и информирования — негативно влияют на клиентский опыт и продажи магазина. Реализация предложенных рекомендаций позволит устранить эти недостатки, повысить удовлетворённость покупателей и укрепить репутацию бренда. Приоритетные направления — модернизация сайта, оптимизация логистики и упрощение возвратов: они вызывают наибольшее число жалоб.",
  totalPotentialGrowth: { min: 27, max: 46 },
};

export const recommendedServices: CatalogService[] = [
  {
    id: "qa-control",
    name: "Контроль качества звонков",
    description: "Выборочная и сплошная оценка диалогов по чек-листам.",
    category: "QA",
    price: "от 22 000 ₽/мес",
    features: [
      "Гибкие чек-листы под ваши процессы",
      "Отчёт по каждому оператору",
      "Eженедельная сводка для руководителя",
    ],
    demoAvailable: false,
    recommendReason:
      "Видим рост тематики «возврат средств» +23% — стоит закрепить стандарт ответа.",
    badges: [{ label: "Новинка", variant: "new" }],
    promo: {
      eyebrow: "Новая функция",
      headline: "Контроль качества звонков",
      blurb: "Оценим 10 диалогов в неделю по вашему чек-листу — бесплатно в первый месяц.",
      cta: "connect",
      illustration: "qa",
      tone: "violet",
      tag: "Подборка",
    },
  },
  {
    id: "chatbot",
    name: "Нейроассистент",
    description: "Снимает до 40% типовых обращений до перевода на оператора.",
    category: "вход",
    price: "от 18 000 ₽/мес",
    features: [
      "Готовые сценарии для eCommerce",
      "Передача оператору без потери контекста",
      "Аналитика тем и проседающих веток",
    ],
    demoAvailable: true,
    recommendReason: "30% ваших обращений — типовые: статус заказа и условия доставки.",
    badges: [{ label: "Подходит вашей отрасли", variant: "industry" }],
    promo: {
      eyebrow: "Сезонная нагрузка",
      headline: "Нейроассистент",
      blurb: "Снимет до 40% типовых обращений и разгрузит операторов в пик.",
      cta: "request",
      illustration: "assistant",
      tone: "amber",
      tag: "Подборка",
    },
  },
  {
    id: "quarter-report",
    name: "Ежеквартальный ИИ-отчёт",
    description:
      "Анализ обращений за квартал и рекомендации по улучшению сервиса с прогнозом эффекта на продажи.",
    category: "аналитика",
    price: "от 25 000 ₽/квартал",
    features: [
      "Анализ 100% обращений за квартал",
      "Карта проблем по тематикам с цифрами",
      "Рекомендации с прогнозом эффекта на продажи",
      "Презентация результатов команде",
    ],
    recommendReason:
      "У клиентов нашей отрасли реализация рекомендаций повышает продажи на 15–25% за квартал.",
    badges: [
      { label: "Новинка", variant: "new" },
      { label: "Подходит вашей отрасли", variant: "industry" },
    ],
    promo: {
      eyebrow: "Подходит вашей отрасли",
      headline: "Ежеквартальный ИИ-отчёт",
      blurb:
        "Карта проблем по обращениям и рекомендации с прогнозом роста продаж на 15–25%.",
      cta: "try",
      illustration: "analytics",
      tone: "copper",
      tag: "Подборка",
    },
  },
];

export const catalogServices: CatalogService[] = [
  // ── ВХОД ──
  {
    id: "hotline-247",
    name: "Горячая линия 24/7",
    description: "Круглосуточный приём входящих обращений с гарантией SLA.",
    category: "вход",
    price: "от 45 000 ₽/мес",
    features: [
      "Поминутная тарификация или пакеты минут",
      "Гарантированный SLA 80/20",
      "Запись и расшифровка диалогов",
    ],
    badges: [],
  },
  {
    id: "hotline-fte",
    name: "Выделенная команда (FTE)",
    description: "Закреплённые операторы под ваш проект — работают по вашим скриптам.",
    category: "вход",
    price: "от 90 000 ₽/мес",
    features: [
      "Команда от 2 до 12 операторов",
      "Работа по вашим скриптам и регламентам",
      "Без общих очередей с другими клиентами",
    ],
    badges: [],
  },
  {
    id: "chatbot",
    name: "Нейроассистент на входящую линию",
    description: "Снимает до 60% типовых обращений до перевода на оператора.",
    category: "вход",
    price: "от 13 ₽/диалог",
    features: [
      "Текстовые каналы: чат на сайте, Telegram, WhatsApp",
      "Голосовой канал — нейроассистент на телефоне",
      "Эскалация на оператора при сложных вопросах",
    ],
    badges: [],
  },
  {
    id: "chat-handling",
    name: "Обработка чатов",
    description: "Операторы O'LINE обрабатывают чаты на сайте, в Telegram, WhatsApp.",
    category: "вход",
    price: "от 22 000 ₽/мес",
    features: [
      "Единая команда для всех мессенджеров",
      "Интеграция с вашей CRM и базой знаний",
      "Поминутная или пакетная тарификация",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "virtual-secretary",
    name: "Виртуальный секретарь",
    description: "Приём и маршрутизация звонков в нерабочее время.",
    category: "вход",
    price: "от 12 000 ₽/мес",
    features: [
      "Приём вызовов 24/7",
      "Маршрутизация по правилам",
      "Запись для последующего разбора",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "blackfriday",
    name: "Кампания к Чёрной пятнице",
    description: "Усиление линии под пиковый сезонный трафик распродаж.",
    category: "вход",
    price: "от 80 000 ₽",
    badges: [{ label: "Сезонное", variant: "season" }],
  },

  // ── ИСХОД ──
  {
    id: "outbound",
    name: "Исходящая кампания",
    description: "Прозвон базы под задачу: продажи, опросы, реактивация.",
    category: "исход",
    price: "от 60 000 ₽/мес",
    features: [
      "До 3 попыток дозвона на контакт",
      "Скрипты под вашу задачу",
      "Отчётность по конверсии и стоимости лида",
    ],
    badges: [],
  },
  {
    id: "base-refresh",
    name: "Актуализация базы",
    description: "Прозвон базы для проверки и обновления контактных данных.",
    category: "исход",
    price: "от 35 000 ₽/мес",
    features: [
      "Проверка номеров и контактных лиц",
      "Обновление должности и компании",
      "Выгрузка очищенной базы в вашу CRM",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "notification",
    name: "Информирование",
    description:
      "Массовое информирование клиентов: акции, новости, обновления услуг.",
    category: "исход",
    price: "от 30 000 ₽/мес",
    features: [
      "Сценарии под целевую аудиторию",
      "Live-оператор или автоматическое сообщение",
      "Фиксация реакции клиента (согласие / отказ)",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "nps-survey",
    name: "NPS-опрос",
    description: "Опрос лояльности клиентов после покупки или сервисного взаимодействия.",
    category: "исход",
    price: "от 28 000 ₽/мес",
    features: [
      "Скрипт NPS + дополнительные вопросы",
      "Сегментация по NPS-баллу (промоутер / нейтрал / детрактор)",
      "Отчёт с инсайтами по причинам оценок",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "voicebot-demo",
    name: "Тест-драйв нейроассистента на 100 звонков",
    description: "Демо нейроассистента на вашем сценарии: 100 звонков бесплатно.",
    category: "исход",
    badges: [],
    soon: true,
  },

  // ── АНАЛИТИКА ──
  {
    id: "quarter-report",
    name: "Ежеквартальный ИИ-отчёт",
    description:
      "Анализ обращений за квартал и рекомендации по улучшению сервиса с прогнозом эффекта на продажи.",
    category: "аналитика",
    price: "от 25 000 ₽/квартал",
    features: [
      "Анализ 100% обращений за квартал",
      "Карта проблем по тематикам с цифрами",
      "Рекомендации с прогнозом эффекта на продажи",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },

  // ── КАЧЕСТВО ──
  {
    id: "qa-control",
    name: "Контроль качества звонков",
    description: "Оценка диалогов по чек-листам, отчётность по операторам.",
    category: "QA",
    price: "от 22 000 ₽/мес",
    features: [
      "Гибкие чек-листы под ваши процессы",
      "Отчёт по каждому оператору",
      "Еженедельная сводка для руководителя",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "ai-suffler",
    name: "ИИ-суфлёр",
    description:
      "Подсказки оператору в реальном времени: триггеры, скрипты, контр-аргументы.",
    category: "QA",
    price: "от 18 000 ₽/мес",
    features: [
      "Подсветка триггеров и возражений в моменте",
      "Контекстные скрипты на экране оператора",
      "Логирование подсказок для тренинга",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
  {
    id: "ai-trainer",
    name: "ИИ-тренер",
    description: "Автоматический тренажёр для операторов на основе ИИ.",
    category: "QA",
    price: "от 25 000 ₽/мес",
    features: [
      "Симуляция типовых клиентских кейсов",
      "Разбор ошибок с примерами лучших операторов",
      "Прогресс-трекинг по каждому оператору",
    ],
    badges: [{ label: "Новинка", variant: "new" }],
  },
];

export type AlertItem = {
  id: string;
  text: string;
  tone: "warning" | "info" | "success";
  date: string;
  soon?: boolean;
  unread: boolean;
};

export const alerts: AlertItem[] = [
  // Непрочитанные — сверху на главной
  {
    id: "a-1",
    text: "Превышение нагрузки 14.05 14:00–15:00, рекомендуем рассмотреть расширение пакета",
    tone: "warning",
    date: "14.05.2026, 15:12",
    unread: true,
  },
  {
    id: "a-2",
    text: "Новая тематика обращений: «возврат средств» — +23% за неделю",
    tone: "info",
    date: "13.05.2026, 09:30",
    soon: true,
    unread: true,
  },
  {
    id: "a-3",
    text: "Ежемесячный отчёт за апрель готов",
    tone: "success",
    date: "01.05.2026, 08:00",
    unread: true,
  },
  // Прочитанные — для модалки «Все уведомления»
  {
    id: "a-4",
    text: "Заявка «Расширение пакета операторов» согласована",
    tone: "success",
    date: "29.04.2026, 14:20",
    unread: false,
  },
  {
    id: "a-5",
    text: "Договор на услугу «Нейроассистент» подписан",
    tone: "success",
    date: "27.04.2026, 11:05",
    unread: false,
  },
  {
    id: "a-6",
    text: "ASA вышел за SLA в окне 14:00–15:00 (3.7 мин против 2 мин по договору)",
    tone: "warning",
    date: "21.04.2026, 15:45",
    unread: false,
  },
  {
    id: "a-7",
    text: "Счёт за март 2026 оплачен",
    tone: "success",
    date: "05.04.2026, 10:12",
    unread: false,
  },
  {
    id: "a-8",
    text: "Новая версия портала — теперь видны вызовы в реальном времени",
    tone: "info",
    date: "01.04.2026, 09:00",
    unread: false,
  },
  // Q1 2026
  {
    id: "a-9",
    text: "Запуск исходящей кампании Q2 2026 согласован",
    tone: "success",
    date: "20.03.2026, 17:05",
    unread: false,
  },
  {
    id: "a-10",
    text: "Сезонный пик трафика 8 марта пройден — SLA 96%",
    tone: "info",
    date: "09.03.2026, 11:30",
    unread: false,
  },
  {
    id: "a-11",
    text: "Изменение тарифа: с 01.04.2026 повышение стоимости минуты на 4%",
    tone: "warning",
    date: "15.02.2026, 14:00",
    unread: false,
  },
  // Q4 2025
  {
    id: "a-12",
    text: "Итоговый отчёт за 2025 год готов к выгрузке",
    tone: "success",
    date: "15.01.2026, 10:00",
    unread: false,
  },
  {
    id: "a-13",
    text: "Перенос горячей линии на новую инфраструктуру завершён",
    tone: "success",
    date: "22.12.2025, 22:40",
    unread: false,
  },
  {
    id: "a-14",
    text: "Чёрная пятница: суточный пик 4 200 обращений, SLA удержан 91%",
    tone: "info",
    date: "29.11.2025, 23:55",
    unread: false,
  },
];

export type ReportKind = "kpi" | "heatmap" | "topn";
export type Report = {
  id: string;
  title: string;
  description: string;
  kind: ReportKind;
  queue: 1 | 2;
  conditional?: "callback" | "fte";
};

export const reports: Report[] = [
  { id: "asa", title: "ASA — среднее время ожидания", description: "Динамика времени ответа за период", kind: "kpi", queue: 1 },
  { id: "call-volume", title: "Объём звонков", description: "Поступило / принято / пропущено / перезвон / переводы", kind: "kpi", queue: 1 },
  { id: "sla", title: "SLA по проекту", description: "Доля звонков в пределах норматива", kind: "kpi", queue: 1 },
  { id: "aht", title: "AHT — среднее время разговора", description: "Средняя длительность обработки обращения", kind: "kpi", queue: 1 },
  { id: "heatmap", title: "Теплокарта загрузки операторов", description: "Распределение нагрузки по дням и часам", kind: "heatmap", queue: 1 },
  { id: "monthly", title: "Ежемесячный отчёт", description: "Сводный отчёт за календарный месяц", kind: "kpi", queue: 1 },
  { id: "topics", title: "Тематики обращений (топ-N)", description: "Структура обращений по темам", kind: "topn", queue: 1 },
  { id: "repeat", title: "% повторных обращений", description: "Доля клиентов, обратившихся повторно", kind: "kpi", queue: 1 },
  { id: "callback-time", title: "Время перезвона по заявкам", description: "Скорость обратного звонка по заявкам", kind: "kpi", queue: 1, conditional: "callback" },
  { id: "outbound-kpi", title: "Исходящая: конверсия и дозвон", description: "Конверсия, дозвон, стоимость лида, покрытие базы", kind: "kpi", queue: 1 },
  { id: "agents", title: "Статистика по операторам", description: "Показатели в разрезе операторов", kind: "topn", queue: 1, conditional: "fte" },
  { id: "result-duration", title: "Длительность результативного звонка (исход)", description: "Время до результата в исходящих", kind: "kpi", queue: 2 },
  { id: "objections", title: "% возражений по типам (исход)", description: "Структура возражений в исходящих", kind: "topn", queue: 2 },
  { id: "period-compare", title: "Сравнение показателей по периодам", description: "Сопоставление метрик между периодами", kind: "kpi", queue: 2 },
];

// Динамика для KPI-отчётов (тип 1)
export const trendSeries = [
  { period: "Пн", current: 21, prev: 25 },
  { period: "Вт", current: 19, prev: 24 },
  { period: "Ср", current: 18, prev: 23 },
  { period: "Чт", current: 17, prev: 22 },
  { period: "Пт", current: 20, prev: 26 },
  { period: "Сб", current: 16, prev: 19 },
  { period: "Вс", current: 14, prev: 17 },
];

// Теплокарта (тип 2): дни × часы
export const heatmapHours = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
export const heatmapDays = ["Пн", "Вт", "Ср", "Чт", "Пт"];
export const heatmapData: number[][] = heatmapDays.map((_, d) =>
  heatmapHours.map((_, h) => {
    const base = Math.sin((h + d) / 2) * 40 + 55;
    return Math.max(5, Math.round(base + (h === 5 || h === 6 ? 35 : 0)));
  })
);

// Топ-N (тип 3): тематики обращений
export const topTopics = [
  { name: "Статус заказа", count: 4120, share: 31, change: "+4%" },
  { name: "Возврат средств", count: 2890, share: 22, change: "+23%" },
  { name: "Технический вопрос", count: 2210, share: 17, change: "−2%" },
  { name: "Условия доставки", count: 1740, share: 13, change: "+1%" },
  { name: "Оплата и счета", count: 1180, share: 9, change: "−5%" },
  { name: "Прочее", count: 1010, share: 8, change: "0%" },
];

// Аналитика: долгосрочный прогноз на 12 месяцев
export const forecast12m = [
  { month: "Янв", value: 24500 },
  { month: "Фев", value: 23800 },
  { month: "Мар", value: 26100 },
  { month: "Апр", value: 27400 },
  { month: "Май", value: 28740 },
  { month: "Июн", value: 31200 },
  { month: "Июл", value: 29800 },
  { month: "Авг", value: 28100 },
  { month: "Сен", value: 30500 },
  { month: "Окт", value: 33200 },
  { month: "Ноя", value: 41800 },
  { month: "Дек", value: 38600 },
];

export const scriptRecommendations = [
  "Установление контакта проседает на 12% — проверить блок открытия диалога.",
  "Этап выявления потребности короче нормы на 18 сек — операторы спешат к презентации.",
  "Отработка возражения «дорого» успешна лишь в 41% случаев — обновить аргументацию.",
  "Закрытие без фиксации следующего шага в 27% звонков — добавить обязательный summary.",
];

export const analyticsEvents = [
  { date: "16.05.2026", text: "Резкий рост тематики «возврат средств»: +23% за неделю." },
  { date: "12.05.2026", text: "ASA вышел за SLA в окне 14:00–15:00 14.05 — пиковая нагрузка." },
  { date: "05.05.2026", text: "Конверсия исходящей кампании выросла до 23.4% (+2.1 п.п.)." },
];

export const soonAnalytics = [
  { title: "AI Forecast — детальный прогноз на месяц", description: "Помесячный прогноз нагрузки с разбивкой по дням, неделям и сценариям." },
  { title: "ИИ-рекомендации по улучшению работы", description: "Персональные рекомендации по скриптам и процессам на основе разбора звонков." },
  { title: "Ежеквартальный ИИ-отчёт", description: "Автоматический аналитический отчёт за квартал с выводами и приоритетами." },
  { title: "Сравнение с бенчмарками отрасли", description: "Ваши метрики против среднего по отрасли и лучших практик." },
  { title: "Глубокая аналитика по сегментам", description: "Срезы по сегментам клиентов, регионам и периодам." },
  { title: "Тренды разговоров — вход", description: "Автоматическое выявление новых тематик во входящих обращениях." },
  { title: "Тренды разговоров — исход", description: "Этапы срыва сделки и карта возражений в исходящих." },
  { title: "A/B-тесты скриптов", description: "Сравнение версий скриптов по конверсии и длительности." },
];

export const launchSteps = [
  { title: "Заявка получена", owner: "Отдел продаж O'LINE", date: "10.01.2026", state: "done" as const },
  { title: "Согласование договора", owner: "Юридический отдел O'LINE", date: "18.01.2026", state: "done" as const },
  { title: "Подготовка инфраструктуры", owner: "Технический отдел O'LINE", date: "26.01.2026", state: "done" as const },
  { title: "Обучение операторов", owner: "Тренинг-менеджер O'LINE", date: "до 24.05.2026", state: "current" as const, progress: 65 },
  { title: "Пилотный запуск", owner: "Руководитель проекта O'LINE", date: "план 27.05.2026", state: "pending" as const },
  { title: "Полный запуск", owner: "Руководитель проекта O'LINE", date: "план 03.06.2026", state: "pending" as const },
];

export type DocType = "Счёт" | "Акт";
export type DocStatus = "К оплате" | "Оплачен" | "Подписан" | "Ожидает подписи";

export type DocumentItem = {
  date: string; // дата выставления
  number: string;
  type: DocType;
  period: string; // отчётный период
  amount: string;
  status: DocStatus;
  fileSizeKb: number; // размер PDF-скана
};

// Каждый месяц — пара: счёт + акт. Самый свежий — сверху.
// ───────────── Архив отчётов (раздел «Управление») ─────────────

export type ArchivedReport = {
  id: string;
  service: string;
  serviceId: string;
  period: string;
  type: "monthly" | "quarterly";
  publishedAt: string;
  fileSizeKb: number;
};

export const archivedReports: ArchivedReport[] = [
  // Hotline 24/7 — ежемесячные
  { id: "r-247-2026-05", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Май 2026", type: "monthly", publishedAt: "05.06.2026", fileSizeKb: 246 },
  { id: "r-247-2026-04", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Апрель 2026", type: "monthly", publishedAt: "05.05.2026", fileSizeKb: 232 },
  { id: "r-247-2026-03", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Март 2026", type: "monthly", publishedAt: "05.04.2026", fileSizeKb: 251 },
  { id: "r-247-2026-02", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Февраль 2026", type: "monthly", publishedAt: "05.03.2026", fileSizeKb: 228 },
  { id: "r-247-2026-01", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Январь 2026", type: "monthly", publishedAt: "05.02.2026", fileSizeKb: 244 },
  { id: "r-247-2025-12", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Декабрь 2025", type: "monthly", publishedAt: "05.01.2026", fileSizeKb: 268 },
  { id: "r-247-2025-11", service: "Горячая Линия Панго Карс", serviceId: "hotline-247", period: "Ноябрь 2025", type: "monthly", publishedAt: "05.12.2025", fileSizeKb: 290 },
  // Hotline FTE — ежемесячные
  { id: "r-chatbot-2026-05", service: "Нейроассистент на входящую линию", serviceId: "chatbot", period: "Май 2026", type: "monthly", publishedAt: "05.06.2026", fileSizeKb: 164 },
  { id: "r-chatbot-2026-04", service: "Нейроассистент на входящую линию", serviceId: "chatbot", period: "Апрель 2026", type: "monthly", publishedAt: "05.05.2026", fileSizeKb: 156 },
  // Исходящие кампании — поквартально, по имени кампании (разовые проекты)
  { id: "r-out-q1-2026", service: "Исходящая Q1 — Реактивация спящих", serviceId: "outbound-q2", period: "Q1 2026", type: "quarterly", publishedAt: "10.04.2026", fileSizeKb: 380 },
  { id: "r-out-q4-2025", service: "Исходящая Q4 — Чёрная пятница 2025", serviceId: "outbound-q2", period: "Q4 2025", type: "quarterly", publishedAt: "12.01.2026", fileSizeKb: 420 },
  { id: "r-out-q3-2025", service: "Исходящая Q3 — Опрос NPS базы", serviceId: "outbound-q2", period: "Q3 2025", type: "quarterly", publishedAt: "08.10.2025", fileSizeKb: 290 },
  { id: "r-fte-2026-05", service: "Горячая Линия Адамас", serviceId: "hotline-fte", period: "Май 2026", type: "monthly", publishedAt: "05.06.2026", fileSizeKb: 198 },
  { id: "r-fte-2026-04", service: "Горячая Линия Адамас", serviceId: "hotline-fte", period: "Апрель 2026", type: "monthly", publishedAt: "05.05.2026", fileSizeKb: 192 },
  { id: "r-fte-2026-03", service: "Горячая Линия Адамас", serviceId: "hotline-fte", period: "Март 2026", type: "monthly", publishedAt: "05.04.2026", fileSizeKb: 205 },
  // Квартальные ИИ-отчёты
  { id: "r-q-2026-q1", service: "Ежеквартальный ИИ-отчёт", serviceId: "quarter-report", period: "Q1 2026", type: "quarterly", publishedAt: "15.04.2026", fileSizeKb: 580 },
  { id: "r-q-2025-q4", service: "Ежеквартальный ИИ-отчёт", serviceId: "quarter-report", period: "Q4 2025", type: "quarterly", publishedAt: "15.01.2026", fileSizeKb: 540 },
  { id: "r-q-2025-q3", service: "Ежеквартальный ИИ-отчёт", serviceId: "quarter-report", period: "Q3 2025", type: "quarterly", publishedAt: "15.10.2025", fileSizeKb: 512 },
];

export const documents: DocumentItem[] = [
  // Апрель 2026 — текущий период оплаты
  { date: "30.04.2026", number: "СЧ-2026-04-127", type: "Счёт", period: "Апрель 2026", amount: "487 200 ₽", status: "К оплате", fileSizeKb: 218 },
  { date: "30.04.2026", number: "АКТ-2026-04-127", type: "Акт", period: "Апрель 2026", amount: "487 200 ₽", status: "Ожидает подписи", fileSizeKb: 195 },
  // Март 2026 — закрыт
  { date: "31.03.2026", number: "СЧ-2026-03-098", type: "Счёт", period: "Март 2026", amount: "452 800 ₽", status: "Оплачен", fileSizeKb: 214 },
  { date: "31.03.2026", number: "АКТ-2026-03-098", type: "Акт", period: "Март 2026", amount: "452 800 ₽", status: "Подписан", fileSizeKb: 192 },
  // Февраль 2026
  { date: "28.02.2026", number: "СЧ-2026-02-076", type: "Счёт", period: "Февраль 2026", amount: "441 600 ₽", status: "Оплачен", fileSizeKb: 211 },
  { date: "28.02.2026", number: "АКТ-2026-02-076", type: "Акт", period: "Февраль 2026", amount: "441 600 ₽", status: "Подписан", fileSizeKb: 188 },
  // Январь 2026
  { date: "31.01.2026", number: "СЧ-2026-01-042", type: "Счёт", period: "Январь 2026", amount: "418 900 ₽", status: "Оплачен", fileSizeKb: 207 },
  { date: "31.01.2026", number: "АКТ-2026-01-042", type: "Акт", period: "Январь 2026", amount: "418 900 ₽", status: "Подписан", fileSizeKb: 184 },
  // Декабрь 2025
  { date: "31.12.2025", number: "СЧ-2025-12-318", type: "Счёт", period: "Декабрь 2025", amount: "512 400 ₽", status: "Оплачен", fileSizeKb: 226 },
  { date: "31.12.2025", number: "АКТ-2025-12-318", type: "Акт", period: "Декабрь 2025", amount: "512 400 ₽", status: "Подписан", fileSizeKb: 201 },
  // Ноябрь 2025
  { date: "30.11.2025", number: "СЧ-2025-11-287", type: "Счёт", period: "Ноябрь 2025", amount: "476 300 ₽", status: "Оплачен", fileSizeKb: 215 },
  { date: "30.11.2025", number: "АКТ-2025-11-287", type: "Акт", period: "Ноябрь 2025", amount: "476 300 ₽", status: "Подписан", fileSizeKb: 190 },
];

export const notifications = [
  "Ежемесячный отчёт за апрель готов",
  "Заявка «Расширение пакета операторов» согласована",
  "Превышение нагрузки 14.05 — рекомендуем расширение пакета",
];

// ───────────────────────── ВЫЗОВЫ ─────────────────────────

export type CallStatus = "answered" | "missed" | "callback";

export type Call = {
  id: string;
  serviceId: string; // к какой подключённой услуге относится
  uid: string;
  date: string; // "DD.MM.YYYY"
  time: string; // "HH:mm:ss"
  operator: { id: string; name: string };
  queue: { id: string; name: string };
  caller: string; // номер звонящего
  destination: string; // номер назначения
  status: CallStatus;
  waitSec: number;
  durationSec: number;
  holdSec: number;
  hasRecording: boolean;
  hasTranscript: boolean;
  reviewed: boolean;
  dropped: boolean;
  rating?: number; // 0-100 КЛН (контроль линии)
  topic?: string;
  ai?: {
    summary: string;
    category: string;
    subcategory: string;
    scriptMatch: number; // %
    triggers: { label: string; tone: "ok" | "warn" | "info" }[];
  };
  transcript?: { speaker: "agent" | "client"; text: string; time: string }[];
};

const SAMPLE_TRANSCRIPT_1: Call["transcript"] = [
  { speaker: "agent", text: "Вас приветствует компания O'LINE, меня зовут Мария. Чем могу помочь?", time: "00:00" },
  { speaker: "client", text: "Здравствуйте, я по статусу заказа № 4452.", time: "00:06" },
  { speaker: "agent", text: "Сейчас посмотрю. Назовите, пожалуйста, телефон, на который оформлен заказ.", time: "00:11" },
  { speaker: "client", text: "+7 999 121 ... 39", time: "00:18" },
  { speaker: "agent", text: "Заказ передан в доставку, курьер свяжется с вами завтра до 12:00.", time: "00:24" },
  { speaker: "client", text: "Отлично, спасибо!", time: "00:31" },
  { speaker: "agent", text: "Хорошего дня, обращайтесь.", time: "00:33" },
];

const SAMPLE_TRANSCRIPT_2: Call["transcript"] = [
  { speaker: "agent", text: "Добрый день, O'LINE, Дмитрий слушает.", time: "00:00" },
  { speaker: "client", text: "Здравствуйте, хочу вернуть товар.", time: "00:04" },
  { speaker: "agent", text: "Понял. Подскажите, пожалуйста, номер заказа и причину возврата.", time: "00:08" },
  { speaker: "client", text: "Номер 3318, не подошёл размер.", time: "00:15" },
  { speaker: "agent", text: "Оформляю заявку на возврат. Деньги поступят на карту в течение 7 рабочих дней.", time: "00:22" },
  { speaker: "client", text: "Спасибо, до свидания.", time: "00:34" },
];

export const calls: Call[] = [
  {
    id: "c-1",
    serviceId: "hotline-247",
    uid: "1777671007.22225000",
    date: "02.05.2026",
    time: "00:30:08",
    operator: { id: "4293", name: "Сенк Мария" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (499) 649-62-39",
    destination: "242",
    status: "answered",
    waitSec: 10,
    durationSec: 33,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Статус заказа",
    ai: {
      summary: "Абонент уточнил статус заказа №4452. Оператор предоставил информацию о доставке курьером на следующий день до 12:00.",
      category: "Заказы и доставка",
      subcategory: "Статус заказа",
      scriptMatch: 91.67,
      triggers: [
        { label: "Приветствие соблюдено", tone: "ok" },
        { label: "Идентификация клиента", tone: "ok" },
        { label: "Прощание", tone: "ok" },
      ],
    },
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-2",
    serviceId: "hotline-247",
    uid: "1777671008.22225041",
    date: "02.05.2026",
    time: "09:50:12",
    operator: { id: "6613", name: "Бердик Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (391) 245-88-88",
    destination: "242",
    status: "answered",
    waitSec: 5,
    durationSec: 49,
    holdSec: 8,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Возврат",
    ai: {
      summary: "Клиент оформил возврат товара (заказ 3318, причина — размер). Возврат средств в течение 7 рабочих дней.",
      category: "Возвраты",
      subcategory: "Возврат по размеру",
      scriptMatch: 88.4,
      triggers: [
        { label: "Приветствие соблюдено", tone: "ok" },
        { label: "Уточнение причины возврата", tone: "ok" },
        { label: "Не предложен обмен", tone: "warn" },
      ],
    },
    transcript: SAMPLE_TRANSCRIPT_2,
  },
  {
    id: "c-3",
    serviceId: "hotline-247",
    uid: "1777671010.22225082",
    date: "02.05.2026",
    time: "10:24:05",
    operator: { id: "7299", name: "Горянова Наталья" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (921) 322-23-21",
    destination: "242",
    status: "missed",
    waitSec: 5,
    durationSec: 8,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: true,
    topic: "—",
  },
  {
    id: "c-4",
    serviceId: "hotline-247",
    uid: "1777671020.22225105",
    date: "02.05.2026",
    time: "10:58:31",
    operator: { id: "6613", name: "Бердик Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (903) 402-90-08",
    destination: "242",
    status: "answered",
    waitSec: 5,
    durationSec: 125,
    holdSec: 12,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Технический вопрос",
    ai: {
      summary: "Клиент сообщил о проблеме с активацией промокода. Оператор уточнил детали, передал обращение в техподдержку второй линии.",
      category: "Технические вопросы",
      subcategory: "Промокоды и акции",
      scriptMatch: 79.2,
      triggers: [
        { label: "Приветствие соблюдено", tone: "ok" },
        { label: "Эскалация во вторую линию", tone: "info" },
        { label: "Не зафиксировано подтверждение", tone: "warn" },
      ],
    },
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-5",
    serviceId: "hotline-247",
    uid: "1777671031.22225140",
    date: "02.05.2026",
    time: "11:54:18",
    operator: { id: "4051", name: "Залевская Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (967) 820-45-51",
    destination: "242",
    status: "answered",
    waitSec: 6,
    durationSec: 74,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: true,
    reviewed: false,
    dropped: false,
    rating: 100,
    topic: "Условия доставки",
    ai: {
      summary: "Клиент уточнял зоны и сроки доставки в Подмосковье. Оператор перечислил тарифные зоны и время.",
      category: "Заказы и доставка",
      subcategory: "Доставка",
      scriptMatch: 94.1,
      triggers: [
        { label: "Приветствие соблюдено", tone: "ok" },
        { label: "Сценарий доставки соблюдён", tone: "ok" },
      ],
    },
    transcript: SAMPLE_TRANSCRIPT_2,
  },
  {
    id: "c-6",
    serviceId: "hotline-fte",
    uid: "1777671055.22225180",
    date: "02.05.2026",
    time: "13:12:45",
    operator: { id: "4293", name: "Сенк Мария" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (916) 220-11-22",
    destination: "242",
    status: "answered",
    waitSec: 8,
    durationSec: 152,
    holdSec: 22,
    hasRecording: true,
    hasTranscript: true,
    reviewed: false,
    dropped: false,
    rating: 92,
    topic: "Корпоративный счёт",
    ai: {
      summary: "Звонок от юр. лица по корпоративному счёту. Переведён на отдел продаж.",
      category: "Продажи B2B",
      subcategory: "Корпоративный счёт",
      scriptMatch: 86.0,
      triggers: [
        { label: "Идентифицирован сегмент B2B", tone: "ok" },
        { label: "Корректный перевод на отдел", tone: "ok" },
      ],
    },
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-7",
    serviceId: "hotline-247",
    uid: "1777671060.22225210",
    date: "02.05.2026",
    time: "14:01:22",
    operator: { id: "4051", name: "Залевская Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (985) 100-99-88",
    destination: "242",
    status: "answered",
    waitSec: 4,
    durationSec: 41,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Статус заказа",
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-8",
    serviceId: "hotline-fte",
    uid: "1777671075.22225240",
    date: "02.05.2026",
    time: "15:30:09",
    operator: { id: "6613", name: "Бердик Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (903) 555-44-33",
    destination: "242",
    status: "callback",
    waitSec: 18,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    topic: "Перезвон",
  },
  {
    id: "c-9",
    serviceId: "hotline-247",
    uid: "1777671088.22225305",
    date: "01.05.2026",
    time: "11:22:18",
    operator: { id: "7299", name: "Горянова Наталья" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (905) 200-77-66",
    destination: "242",
    status: "answered",
    waitSec: 12,
    durationSec: 187,
    holdSec: 35,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 88,
    topic: "Возврат",
    transcript: SAMPLE_TRANSCRIPT_2,
  },
  {
    id: "c-10",
    serviceId: "hotline-fte",
    uid: "1777671099.22225344",
    date: "01.05.2026",
    time: "14:45:55",
    operator: { id: "4293", name: "Сенк Мария" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (495) 770-12-34",
    destination: "242",
    status: "missed",
    waitSec: 33,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: true,
    topic: "—",
  },

  // ────────── СЕГОДНЯ (04.06.2026) ──────────
  {
    id: "c-101",
    serviceId: "hotline-247",
    uid: "1780670000.30001001",
    date: "04.06.2026",
    time: "09:15:23",
    operator: { id: "4293", name: "Сенк Мария" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (916) 311-44-58",
    destination: "242",
    status: "answered",
    waitSec: 6,
    durationSec: 68,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: true,
    reviewed: false,
    dropped: false,
    rating: 100,
    topic: "Статус заказа",
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-102",
    serviceId: "hotline-247",
    uid: "1780670010.30001012",
    date: "04.06.2026",
    time: "10:42:08",
    operator: { id: "7299", name: "Горянова Наталья" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (905) 822-19-30",
    destination: "242",
    status: "missed",
    waitSec: 22,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: true,
    topic: "—",
  },
  {
    id: "c-103",
    serviceId: "hotline-247",
    uid: "1780670020.30001023",
    date: "04.06.2026",
    time: "12:08:55",
    operator: { id: "6613", name: "Бердик Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (964) 200-33-77",
    destination: "242",
    status: "answered",
    waitSec: 7,
    durationSec: 142,
    holdSec: 15,
    hasRecording: true,
    hasTranscript: true,
    reviewed: false,
    dropped: false,
    rating: 95,
    topic: "Возврат",
    transcript: SAMPLE_TRANSCRIPT_2,
  },
  {
    id: "c-104",
    serviceId: "hotline-fte",
    uid: "1780670025.30001034",
    date: "04.06.2026",
    time: "11:30:12",
    operator: { id: "F0291", name: "Соколова Анастасия" },
    queue: { id: "8243", name: "Горячая линия FTE" },
    caller: "+7 (495) 521-78-90",
    destination: "243",
    status: "answered",
    waitSec: 8,
    durationSec: 198,
    holdSec: 22,
    hasRecording: true,
    hasTranscript: true,
    reviewed: false,
    dropped: false,
    rating: 92,
    topic: "Корпоративный счёт",
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-105",
    serviceId: "hotline-247",
    uid: "1780670035.30001045",
    date: "04.06.2026",
    time: "14:20:33",
    operator: { id: "4051", name: "Залевская Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (903) 412-66-21",
    destination: "242",
    status: "answered",
    waitSec: 4,
    durationSec: 56,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    rating: 100,
    topic: "Условия доставки",
  },
  {
    id: "c-106",
    serviceId: "hotline-fte",
    uid: "1780670045.30001056",
    date: "04.06.2026",
    time: "15:50:01",
    operator: { id: "F1845", name: "Белов Дмитрий" },
    queue: { id: "8243", name: "Горячая линия FTE" },
    caller: "+7 (812) 446-22-15",
    destination: "243",
    status: "callback",
    waitSec: 25,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    topic: "Перезвон",
  },
  {
    id: "c-107",
    serviceId: "hotline-247",
    uid: "1780670055.30001067",
    date: "04.06.2026",
    time: "17:33:18",
    operator: { id: "4128", name: "Соколова Анна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (915) 800-11-44",
    destination: "242",
    status: "answered",
    waitSec: 6,
    durationSec: 72,
    holdSec: 8,
    hasRecording: true,
    hasTranscript: true,
    reviewed: false,
    dropped: false,
    rating: 100,
    topic: "Оплата и счета",
    transcript: SAMPLE_TRANSCRIPT_1,
  },

  // ────────── ВЧЕРА (03.06.2026) ──────────
  {
    id: "c-110",
    serviceId: "hotline-247",
    uid: "1780580000.30002001",
    date: "03.06.2026",
    time: "09:50:42",
    operator: { id: "7299", name: "Горянова Наталья" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (921) 555-12-90",
    destination: "242",
    status: "answered",
    waitSec: 5,
    durationSec: 84,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: false,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Статус заказа",
  },
  {
    id: "c-111",
    serviceId: "hotline-247",
    uid: "1780580010.30002012",
    date: "03.06.2026",
    time: "11:18:33",
    operator: { id: "4293", name: "Сенк Мария" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (985) 622-33-88",
    destination: "242",
    status: "answered",
    waitSec: 8,
    durationSec: 155,
    holdSec: 20,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 92,
    topic: "Возврат",
    transcript: SAMPLE_TRANSCRIPT_2,
  },
  {
    id: "c-112",
    serviceId: "hotline-fte",
    uid: "1780580020.30002023",
    date: "03.06.2026",
    time: "14:30:18",
    operator: { id: "F1845", name: "Белов Дмитрий" },
    queue: { id: "8243", name: "Горячая линия FTE" },
    caller: "+7 (495) 770-19-22",
    destination: "243",
    status: "answered",
    waitSec: 9,
    durationSec: 220,
    holdSec: 18,
    hasRecording: true,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    rating: 90,
    topic: "Технический вопрос",
  },
  {
    id: "c-113",
    serviceId: "hotline-247",
    uid: "1780580030.30002034",
    date: "03.06.2026",
    time: "16:42:55",
    operator: { id: "6613", name: "Бердик Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (909) 100-88-77",
    destination: "242",
    status: "missed",
    waitSec: 28,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: true,
    topic: "—",
  },
  {
    id: "c-114",
    serviceId: "hotline-fte",
    uid: "1780580040.30002045",
    date: "03.06.2026",
    time: "17:05:20",
    operator: { id: "F2317", name: "Кузнецов Евгений" },
    queue: { id: "8243", name: "Горячая линия FTE" },
    caller: "+7 (812) 220-44-66",
    destination: "243",
    status: "answered",
    waitSec: 11,
    durationSec: 178,
    holdSec: 15,
    hasRecording: true,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    rating: 95,
    topic: "Изменение условий",
  },

  // ────────── ЭТА НЕДЕЛЯ (28–31.05.2026) ──────────
  {
    id: "c-120",
    serviceId: "hotline-247",
    uid: "1780490000.30003001",
    date: "31.05.2026",
    time: "10:15:23",
    operator: { id: "4128", name: "Соколова Анна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (903) 718-22-44",
    destination: "242",
    status: "answered",
    waitSec: 4,
    durationSec: 92,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: false,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Статус заказа",
  },
  {
    id: "c-121",
    serviceId: "hotline-247",
    uid: "1780490010.30003012",
    date: "30.05.2026",
    time: "11:42:08",
    operator: { id: "5034", name: "Белов Денис" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (964) 332-11-90",
    destination: "242",
    status: "answered",
    waitSec: 6,
    durationSec: 168,
    holdSec: 25,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 88,
    topic: "Технический вопрос",
    transcript: SAMPLE_TRANSCRIPT_1,
  },
  {
    id: "c-122",
    serviceId: "hotline-fte",
    uid: "1780490020.30003023",
    date: "29.05.2026",
    time: "14:30:12",
    operator: { id: "F3402", name: "Орлова Наталья" },
    queue: { id: "8243", name: "Горячая линия FTE" },
    caller: "+7 (495) 880-22-11",
    destination: "243",
    status: "answered",
    waitSec: 10,
    durationSec: 245,
    holdSec: 30,
    hasRecording: true,
    hasTranscript: false,
    reviewed: true,
    dropped: false,
    rating: 92,
    topic: "Корпоративный счёт",
  },
  {
    id: "c-123",
    serviceId: "hotline-247",
    uid: "1780490030.30003034",
    date: "28.05.2026",
    time: "16:11:33",
    operator: { id: "6201", name: "Кузнецов Евгений" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (916) 545-66-77",
    destination: "242",
    status: "answered",
    waitSec: 7,
    durationSec: 110,
    holdSec: 0,
    hasRecording: true,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    rating: 95,
    topic: "Оплата и счета",
  },

  // ────────── ЭТОТ МЕСЯЦ (08–20.05.2026) ──────────
  {
    id: "c-130",
    serviceId: "hotline-247",
    uid: "1779200000.30004001",
    date: "20.05.2026",
    time: "09:30:08",
    operator: { id: "4293", name: "Сенк Мария" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (905) 100-44-22",
    destination: "242",
    status: "answered",
    waitSec: 5,
    durationSec: 178,
    holdSec: 20,
    hasRecording: true,
    hasTranscript: true,
    reviewed: true,
    dropped: false,
    rating: 100,
    topic: "Возврат",
    transcript: SAMPLE_TRANSCRIPT_2,
  },
  {
    id: "c-131",
    serviceId: "hotline-247",
    uid: "1779200010.30004012",
    date: "15.05.2026",
    time: "13:00:12",
    operator: { id: "7299", name: "Горянова Наталья" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (921) 622-99-88",
    destination: "242",
    status: "callback",
    waitSec: 35,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: false,
    topic: "Перезвон",
  },
  {
    id: "c-132",
    serviceId: "hotline-fte",
    uid: "1779200020.30004023",
    date: "12.05.2026",
    time: "11:15:33",
    operator: { id: "F0291", name: "Соколова Анастасия" },
    queue: { id: "8243", name: "Горячая линия FTE" },
    caller: "+7 (495) 770-33-11",
    destination: "243",
    status: "answered",
    waitSec: 9,
    durationSec: 210,
    holdSec: 25,
    hasRecording: true,
    hasTranscript: false,
    reviewed: true,
    dropped: false,
    rating: 92,
    topic: "Корпоративный счёт",
  },
  {
    id: "c-133",
    serviceId: "hotline-247",
    uid: "1779200030.30004034",
    date: "08.05.2026",
    time: "16:25:55",
    operator: { id: "4051", name: "Залевская Татьяна" },
    queue: { id: "8242", name: "Горячая Линия Панго Карс" },
    caller: "+7 (903) 233-44-55",
    destination: "242",
    status: "missed",
    waitSec: 31,
    durationSec: 0,
    holdSec: 0,
    hasRecording: false,
    hasTranscript: false,
    reviewed: false,
    dropped: true,
    topic: "—",
  },
];

// ──────────────────── СКРИПТЫ ОПЕРАТОРОВ ────────────────────

export type ScriptBlockTone = "green" | "blue" | "red" | "orange";
export type CalloutTone = "warn" | "info" | "ok";

export type ScriptBlock =
  | {
      kind: "header";
      lineNumber?: string;
      greeting: string;
      intro: string;
      hint?: string;
      topics?: { left: string; right: string }[];
    }
  | {
      kind: "callout";
      tone: CalloutTone;
      text: string;
    }
  | {
      kind: "expandable";
      tone: ScriptBlockTone;
      title: string;
      content: string;
    };

export type ServiceScript = {
  serviceName: string;
  version: string;
  updatedAt: string;
  approvedBy: string;
  context: string;
  blocks: ScriptBlock[];
};

// Цвет блока — это смысловой код:
// green  — обычные темы, стандартная процедура
// blue   — информационные / нейтральные (доступ, оплата, сертификаты)
// red    — деньги клиента / отмена / возврат / спорные ситуации
// orange — внимательно: идентификация, эскалация, отказ
// callout warn / info / ok — постоянно видимые заметки, не сворачиваются.

export const serviceScripts: Record<string, ServiceScript> = {
  "hotline-247": {
    serviceName: "Горячая Линия Панго Карс",
    version: "3.2",
    updatedAt: "18.05.2026",
    approvedBy: "Иванов И.И. (руководитель клиентского сервиса Панго Карс)",
    context:
      "Скрипт входящей линии 8800 интернет-магазина автозапчастей Панго Карс. Используется операторами при обработке всех типов обращений.",
    blocks: [
      {
        kind: "header",
        lineNumber: "8800",
        greeting: "Добрый день! / Здравствуйте!",
        intro:
          "Компания **Панго Карс**, меня зовут [Имя], чем я могу Вам помочь?",
        hint:
          "Обязательно проговорить вслух тему обращения — это фиксируется в карточке и помогает быстрее найти решение.",
        topics: [
          { left: "Где мой заказ / трек-номер", right: "Возврат денег" },
          { left: "Отмена заказа", right: "Гарантия и обмен" },
          { left: "Не подошла запчасть", right: "Подбор по VIN" },
          { left: "Доставка и сроки", right: "Оплата и сертификаты" },
        ],
      },
      {
        kind: "expandable",
        tone: "green",
        title: "О компании",
        content:
          "Панго Карс — интернет-магазин автозапчастей. Работаем с 2014 года, более 2,5 млн SKU в каталоге, доставка по всей России.\n\nГолосовая линия работает **круглосуточно**, чат и email — 9:00–22:00 МСК.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Доступ в личный кабинет",
        content:
          "Логин — это **email или телефон**, который клиент указал при регистрации.\n\nЕсли клиент не помнит пароль — отправляем ссылку на восстановление на привязанный email. Если email недоступен — переводим обращение в безопасность через эскалацию (см. блок ниже).",
      },
      {
        kind: "callout",
        tone: "warn",
        text:
          "**Важно!** Если клиент сообщает о подозрительной активности в личном кабинете (чужие заказы, смена пароля без его ведома) — сразу переводим звонок старшему оператору. Не пытаемся разбираться сами.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Где мой заказ / трек-номер",
        content:
          "1. Уточняем номер заказа или ФИО + телефон в карточке.\n2. Открываем заказ в админке, смотрим текущий статус и трек.\n3. Если заказ **в пути** — называем трек-номер и службу доставки, предлагаем отследить на сайте перевозчика.\n4. Если заказ **задерживается** более чем на 2 дня сверх плана — фиксируем обращение и обещаем перезвонить в течение 4 часов после уточнения у склада.\n\nНикогда не обещаем конкретный час доставки — только день.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Подбор запчастей по VIN",
        content:
          "Если клиент не уверен, подойдёт ли деталь:\n\n• Просим VIN автомобиля (17 символов).\n• Открываем подбор по VIN в админке.\n• Проверяем совместимость по артикулу.\n\nЕсли совместимость **не подтверждена** — не оформляем заказ, предлагаем связаться через сутки после проверки у поставщика.",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Возврат денег / отмена заказа",
        content:
          "**Не называем «отменой»** до момента, пока деньги не вернулись клиенту. Говорим: «оформим возврат».\n\nСроки возврата:\n• Карта — 5–10 рабочих дней\n• СБП — 1–3 рабочих дня\n• Наложенный платёж — на карту по заявлению, 10 рабочих дней\n\nПричину возврата фиксируем обязательно: «не подошло», «передумал», «нашёл дешевле», «брак».",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Обмен / возврат товара",
        content:
          "Товар надлежащего качества возвращается **в течение 14 дней** с момента получения, при сохранении товарного вида и упаковки.\n\nТовар с дефектом — в течение **гарантийного срока** (указан в карточке товара). Просим фото/видео дефекта, передаём в отдел качества.\n\nКрупногабарит (двигатели, КПП, кузовные элементы) — забирает наша служба доставки, оплачивает Панго Карс.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Гарантия на запчасти",
        content:
          "Гарантийный срок указан в карточке товара (от 30 дней до 3 лет).\n\nГарантия **не покрывает**:\n• естественный износ\n• повреждения от неправильной установки\n• работы в неавторизованном сервисе для оригинальных запчастей\n\nДля гарантийной заявки нужны: заказ, фото детали, акт установки из сервиса.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Оплата, сертификаты, бонусы",
        content:
          "Способы оплаты: карта, СБП, наложенный платёж, юр. лицу — счёт.\n\nПодарочные сертификаты — номинал 1 000 / 3 000 / 5 000 ₽, срок действия 12 месяцев с момента покупки. Применяются в корзине через ввод кода.\n\nБонусы: 1% с каждого оплаченного заказа, можно списать до 30% от суммы следующего заказа.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Идентификация клиента",
        content:
          "Минимально: **ФИО + номер заказа** или **ФИО + телефон в карточке**.\n\nДля операций с деньгами (возврат, изменение реквизитов) дополнительно сверяем последние 4 цифры карты или email из заказа.\n\nЕсли клиент **не может пройти идентификацию** — не сообщаем никаких данных о заказе, предлагаем восстановить доступ через личный кабинет.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Эскалация / старший оператор",
        content:
          "Эскалируем в следующих случаях:\n• клиент в негативе и просит руководителя\n• заказ от 50 000 ₽ с проблемой\n• подозрение на мошенничество\n• непонятная техническая ситуация (нет ответа от склада, ошибка системы)\n\nПередаём через внутренний канал, **не кладём трубку** — представляем клиента старшему оператору.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Жалобы, отзывы, предложения",
        content:
          "Фиксируем в карточке обращения с тегом «жалоба» / «предложение».\n\nЕсли клиент очень недоволен — предлагаем промокод на следующий заказ (5–10% по решению старшего оператора).\n\nЖалоба на оператора — обязательно эскалируем, не пытаемся защищать коллегу.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Завершение разговора",
        content:
          "1. Подытоживаем: что договорились / какой срок ожидания.\n2. Спрашиваем: «Могу ли я ещё чем-то помочь?»\n3. Прощаемся: «Спасибо за обращение в Панго Карс, хорошего дня!»\n\n**Не кладём трубку первыми** — ждём, пока клиент завершит звонок.",
      },
    ],
  },

  "hotline-fte": {
    serviceName: "Горячая Линия Адамас",
    version: "2.5",
    updatedAt: "02.06.2026",
    approvedBy: "Петрова Е.С. (директор по работе с корп. клиентами Адамас)",
    context:
      "Скрипт корпоративной линии для B2B-клиентов Адамас: ювелирные сети, корпоративные подарки, спецзаказы. Работаем только в рабочее время.",
    blocks: [
      {
        kind: "header",
        lineNumber: "8800-корп",
        greeting: "Добрый день!",
        intro:
          "Корпоративный сервис **Адамас**, меня зовут [Имя], чем я могу Вам помочь?",
        hint:
          "Уточнить **наименование компании** и ФИО собеседника до перехода к сути запроса — это ускорит поиск договора в системе.",
        topics: [
          { left: "Заказ по договору", right: "Спецзаказ / индивидуально" },
          { left: "Изменение договора", right: "Срок поставки" },
          { left: "Возврат / обмен", right: "Сертификаты подлинности" },
          { left: "Претензия", right: "Эскалация" },
        ],
      },
      {
        kind: "expandable",
        tone: "green",
        title: "О компании",
        content:
          "Адамас — крупнейшая ювелирная сеть России. B2B-направление: корпоративные подарки, изделия с логотипом, спецзаказы для ритейл-сетей.\n\nКорпоративная линия работает **Пн–Пт, 9:00–19:00 МСК**. В выходные обращения принимает email-канал.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Авторизация корпоративного клиента",
        content:
          "Обязательно сверяем **до обсуждения деталей заказа**:\n\n• Наименование юр. лица (ИНН в системе)\n• ФИО и должность собеседника (из карточки контактов договора)\n• Номер договора\n\nЕсли собеседник **не указан в карточке контактов** — не озвучиваем коммерческие условия, просим направить официальный запрос на email менеджера.",
      },
      {
        kind: "callout",
        tone: "warn",
        text:
          "**Важно: цены и спецусловия — только по договору.** Никогда не озвучиваем розничные цены корпоративному клиенту — только цены из его прайс-листа. Если прайс не привязан — переводим звонок персональному менеджеру.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Заказ из ассортимента (по договору)",
        content:
          "1. Сверяем ассортимент с прайсом договора.\n2. Уточняем артикулы, количество, требуемую дату поставки.\n3. Озвучиваем срок производства/отгрузки **из системы**, без обещаний от себя.\n4. Высылаем спецификацию на email клиента, ждём подтверждения.\n5. Передаём в производство **только после письменного подтверждения**.\n\nУстные договорённости не принимаем в работу — фиксируем письменно.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Спецзаказ / индивидуальное изделие",
        content:
          "Этапы:\n\n1. **ТЗ** — собираем от клиента: эскиз, материалы, тираж, дедлайн.\n2. **Расчёт** — передаём в производственный отдел, срок 2–3 рабочих дня.\n3. **Согласование** — высылаем КП, ждём подтверждения.\n4. **Аванс** — 50% по счёту до начала работ.\n5. **Производство** — срок зависит от сложности (от 3 недель).\n6. **Приёмка** — фото, при необходимости — выезд клиента в производство.\n\n**Не озвучиваем сроки и стоимость до расчёта производственным отделом.**",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Изменение договора / спецификации",
        content:
          "Изменения к договору оформляются только **дополнительным соглашением**. Устные правки в работу не принимаются.\n\nЕсли клиент просит срочное изменение по уже запущенному в производство заказу:\n• уточняем стадию готовности у производства\n• оцениваем возможность и стоимость переделки\n• передаём расчёт менеджеру для согласования с клиентом\n\n**Не обещаем «бесплатно переделать»** — каждое изменение оплачивается отдельно по факту.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Срок поставки и логистика",
        content:
          "Стандартный срок отгрузки указан в договоре (обычно 14–21 рабочий день после оплаты).\n\nЛогистика:\n• до МКАД — собственная курьерская служба\n• регионы — СДЭК, Деловые Линии, по выбору клиента из спецификации\n• международная — оформляется отдельно через ВЭД-отдел\n\n**Страхование** — обязательно для отправлений свыше 500 000 ₽.",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Возврат и обмен",
        content:
          "B2B-возвраты регулируются договором — обычно:\n• **Брак производства** — обмен/возврат в течение 30 дней с момента приёмки\n• **Несоответствие спецификации** — возврат с компенсацией доставки\n• **Передумали** — не принимаем (изделие изготовлено под заказ)\n\nПретензия принимается **только в письменном виде** с фото/актом приёмки. Срок рассмотрения — 10 рабочих дней.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Сертификаты подлинности и пробы",
        content:
          "На каждое изделие из драгметалла оформляется:\n• Сертификат подлинности Адамас\n• Бирка с пробой\n• Геммологическое заключение (для изделий с камнями свыше 0,3 карата)\n\nДубликат сертификата — оформляется по заявлению, срок 5 рабочих дней, стоимость по тарифу.\n\nСвоего рода «гарантийный талон» — отдельно не выпускаем, гарантия фиксируется договором.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Претензии и спорные ситуации",
        content:
          "Принимаем претензию **только письменно** на email клиентского сервиса.\n\nЭтапы:\n1. Регистрация претензии — в течение 1 рабочего дня.\n2. Запрос дополнительных материалов (фото, акт, экспертиза) — если нужно.\n3. Рассмотрение — до 10 рабочих дней.\n4. Письменный ответ.\n\n**Никаких устных обещаний компенсации** до завершения рассмотрения. Если клиент в негативе — фиксируем и переводим на руководителя направления.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Эскалация на персонального менеджера",
        content:
          "Эскалируем, если:\n• клиент просит руководителя\n• сумма спорного вопроса свыше 1 млн ₽\n• запрос не покрыт договором (нужно отдельное решение)\n• клиент сообщает об угрозе расторжения договора\n\nПередаём через внутренний канал с краткой выжимкой ситуации. **Не пытаемся «сгладить»** — задача оператора зафиксировать и передать.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Завершение разговора",
        content:
          "1. Подытоживаем договорённости и сроки.\n2. Сообщаем, что вышлем подтверждение на email.\n3. «Спасибо за обращение в корпоративный сервис Адамас, хорошего дня!»\n\nОбязательно — **письменное подтверждение** всех договорённостей на email в течение 30 минут после звонка.",
      },
    ],
  },

  "outbound-q2": {
    serviceName: "Исходящая кампания · Q2 2026",
    version: "1.4",
    updatedAt: "20.05.2026",
    approvedBy: "Соколов Д.А. (руководитель отдела продаж)",
    context:
      "Скрипт холодного звонка по базе B2B-клиентов. Цель — назначение онлайн-встречи с менеджером для презентации.",
    blocks: [
      {
        kind: "header",
        lineNumber: "Исходящая · Q2",
        greeting: "Добрый день!",
        intro:
          "Меня зовут [Имя], компания **O'LINE**. Звоню по поводу автоматизации обработки входящих обращений в Вашей компании. Удобно сейчас 2 минуты поговорить?",
        hint:
          "Не пытаться продать в первый звонок. Цель — **назначить встречу на 20 минут** с менеджером. Всё остальное — побочные исходы.",
        topics: [
          { left: "Открытие звонка", right: "Возражение «дорого»" },
          { left: "Выявление потребностей", right: "Возражение «нет времени»" },
          { left: "Презентация", right: "«Уже работаем с другим»" },
          { left: "Закрытие на встречу", right: "Корректный отказ" },
        ],
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Открытие звонка",
        content:
          "Если клиент **отвечает «удобно»** → переходим к выявлению потребностей.\n\nЕсли **«занят»** → «Понимаю, тогда когда удобно перезвонить — сегодня после обеда или завтра утром?» — и фиксируем время в CRM.\n\nЕсли **«а откуда у вас мой номер»** → «Ваша компания в открытых каталогах B2B, я ничего не покупал и базы у меня нет — обзваниваем точечно по отрасли. Если разговор не будет полезен — больше не побеспокою, обещаю».",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Выявление потребностей",
        content:
          "**Не презентуем** до выявления — задаём вопросы:\n\n• Кто сейчас обрабатывает входящие звонки клиентов?\n• Сколько примерно обращений в месяц?\n• Бывают ли пропущенные звонки, особенно в пик / в нерабочее время?\n• Что больше всего мешает в текущей схеме?\n\nЕсли клиент **много жалуется на текучку операторов или пропуски** — это сильный сигнал к презентации.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Презентация продукта",
        content:
          "Презентуем **только под выявленную боль**:\n\n• Текучка → «у нас аутсорс-операторы, мы решаем проблему с заменами»\n• Пропуски → «24/7 линия + резервная команда»\n• Сезонные пики → «масштабируем линию на 2–3 недели без изменения договора»\n• Хочет ИИ → «Нейроассистент закрывает 60–70% диалогов без оператора»\n\n**Не перечисляем всё подряд** — это сразу выдаёт скрипт. Один-два аргумента под боль.",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Возражение: «Дорого»",
        content:
          "**Не сравниваем цены** в звонке. Перенаправляем:\n\n«Я не озвучиваю стоимость в звонке, потому что она зависит от объёма обращений и графика — это считает менеджер. Стандартный пакет от [X] обращений в месяц обычно укладывается в [Y] тыс./мес., но точную цифру под Ваш случай менеджер посчитает за 1 рабочий день после короткой встречи. Согласуем встречу?»",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Возражение: «Нет времени»",
        content:
          "«Понимаю, и встреча займёт **не больше 20 минут**. Менеджер просто покажет, как обработка обращений устроена у клиентов вашей отрасли, и если станет понятно, что вам это не интересно — мы расстанемся друзьями. Когда удобнее: завтра в первой половине или в среду?»\n\n**Даём бинарный выбор времени**, а не «когда хотите».",
      },
      {
        kind: "expandable",
        tone: "red",
        title: "Возражение: «Уже работаем с другим подрядчиком»",
        content:
          "«Отлично, значит, вы уже на этапе, когда понимаете специфику. Я ни в коем случае не предлагаю переезжать прямо сейчас — но имеет смысл познакомиться, чтобы вы знали запасной вариант. У многих клиентов мы становимся резервной линией на пиковые периоды или эскалации. 20 минут с менеджером?»\n\nЕсли клиент **категорически отказывается** — фиксируем «работают с конкурентом» + название (если назвал) и прощаемся вежливо.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Возражение: «Я подумаю / пришлите презентацию»",
        content:
          "«Презентацию вышлю обязательно. Чтобы она была не про всё подряд, а под вашу ситуацию — давайте 15 минут пообщаемся с менеджером, и он подготовит материал именно под ваш кейс. Иначе это будет 40 слайдов, из которых вам интересны 2».\n\nЕсли клиент всё равно настаивает — **отправляем общую презентацию** + ставим задачу на повторный звонок через 5 рабочих дней.",
      },
      {
        kind: "expandable",
        tone: "green",
        title: "Закрытие на встречу",
        content:
          "Бинарный выбор времени:\n\n«Тогда давайте определимся со временем. У менеджера завтра в 11:00 или в четверг в 14:00 — что удобнее?»\n\nПосле согласования:\n1. Уточняем email для приглашения.\n2. Отправляем календарное приглашение **в течение 5 минут после звонка**.\n3. За день до встречи менеджер дублирует подтверждение.\n\n**Не отпускаем без даты в календаре** — иначе вероятность встречи падает в 3 раза.",
      },
      {
        kind: "expandable",
        tone: "blue",
        title: "Корректный отказ / прощание",
        content:
          "Если клиент после всех попыток отказался — **не давим**:\n\n«Понял, в таком случае не буду отнимать время. Если ситуация поменяется — наш сайт oline.ru, можно оставить заявку. Спасибо за разговор, хорошего дня!»\n\nВ CRM фиксируем причину отказа: «нет потребности», «работают с конкурентом», «слишком мелкая компания», «не ЛПР» — это нужно для отчёта по кампании.",
      },
      {
        kind: "expandable",
        tone: "orange",
        title: "Перенос звонка / попали не на ЛПР",
        content:
          "Если попали на секретаря / ассистента:\n\n«Подскажите, с кем в компании можно обсудить вопрос обработки клиентских обращений? Это руководитель клиентского сервиса или операционный директор обычно».\n\nЕсли секретарь блокирует → не давим, оставляем сайт и email для обратной связи. **Не вступаем в спор с «гейткипером»** — это портит репутацию бренда.",
      },
    ],
  },
};

// ──────────────────── ОТЧЁТ ПО ИСХОДЯЩЕЙ КАМПАНИИ ────────────────────

export type OutboundReport = {
  campaign: {
    name: string;
    startDate: string;       // "02.04.2026"
    endDate: string;         // "30.06.2026"
    today: string;           // "04.06.2026"
    baseTotal: number;       // 12 500
    baseProcessed: number;   // 5 750
    daysLeft: number;        // 26
    pacePerDay: number;      // 260
    onTrack: boolean;        // true/false
    statusNote: string;      // "успеем в срок ✓"
    leads: number;           // 1 020
    costPerLead: number;     // 850
    roi: number;             // 285 (в %)
  };
  funnel: {
    contactsProcessed: number;  // 5 750 — уникальных контактов в работе
    totalAttempts: number;      // 10 350 — попыток сделано всего
    attemptsPerContact: number; // 1.8 — среднее
    reached: number;            // 3 900 — дозвонились
    reachedPct: number;         // 68
    notReached: number;         // 1 850 — после 3 попыток не получилось
    notReachedPct: number;      // 32
    reachedByAttempt: {         // на какой попытке дозвонились
      first: number;            // 2 100
      second: number;           // 1 100
      third: number;            // 700
    };
    targets: number;            // 915
    conversionPct: number;      // 23.4
  };
  quality: {
    avgTalkTime: string;     // "2 мин 45 сек"
    timeToResult: string;    // "1 мин 48 сек"
    scriptMatch: number;     // 91
    objectionRate: number;   // 38
  };
  leadsDestinations: { name: string; count: number; pct: number }[];
  scriptStages: {
    name: string;
    count: number;
    pct: number;
  }[];
  objections: {
    name: string;
    count: number;
    pct: number;
    resolveRate: number;
  }[];
  baseSegments: {
    name: string;
    contacts: number;
    conversionPct: number;
    targets: number;
    costPerLead: number;
    tone: "ok" | "warn" | "neutral";
  }[];
  heatmap: {
    days: string[];          // ["Пн", "Вт", ...]
    hours: string[];         // ["09", "10", ..., "20"]
    data: number[][];        // % дозвона
  };
  operators: {
    name: string;
    operatorId: string;
    callCount: number;
    avgTalkSec: number;
    reachedPct: number;
    conversionPct: number;
    targets: number;
    revenuePerContact: number;
  }[];
  weeklyDynamics: {
    week: string;
    attempts: number | null;
    reached: number | null;
    targets: number | null;
    forecastAttempts?: number;
    forecastReached?: number;
    forecastTargets?: number;
  }[];
  campaignCompare: {
    metric: string;
    prev: string;
    curr: string;
    delta: string;
    tone: ReportTone;
  }[];
  forecast: {
    label: string;
    value: string;
    note: string;
    tone: "ok" | "warn" | "neutral";
  }[];
  insight: string;
  recommendations: {
    title: string;
    body: string;
    effect: string;
  }[];
};

export const outboundReports: Record<string, OutboundReport> = {
  "outbound-q2": {
    campaign: {
      name: "Исходящая кампания Q2 2026",
      startDate: "02.04.2026",
      endDate: "30.06.2026",
      today: "04.06.2026",
      baseTotal: 12500,
      baseProcessed: 5750,
      daysLeft: 26,
      pacePerDay: 260,
      onTrack: true,
      statusNote: "успеваем в срок — запас 0 дней при текущем темпе",
      leads: 1020,
      costPerLead: 850,
      roi: 285,
    },
    funnel: {
      contactsProcessed: 5750,
      totalAttempts: 10350,
      attemptsPerContact: 1.8,
      reached: 3900,
      reachedPct: 68,
      notReached: 1850,
      notReachedPct: 32,
      reachedByAttempt: {
        first: 2100,
        second: 1100,
        third: 700,
      },
      targets: 915,
      conversionPct: 23.4,
    },
    quality: {
      avgTalkTime: "2 мин 45 сек",
      timeToResult: "1 мин 48 сек",
      scriptMatch: 91,
      objectionRate: 38,
    },
    leadsDestinations: [
      { name: "В CRM (Bitrix24)", count: 332, pct: 68 },
      { name: "На отдел продаж", count: 103, pct: 21 },
      { name: "В email-цепочку", count: 56, pct: 11 },
    ],
    scriptStages: [
      { name: "1. Установление контакта", count: 2042, pct: 97 },
      { name: "2. Выявление потребности", count: 1870, pct: 89 },
      { name: "3. Презентация решения", count: 1412, pct: 67 },
      { name: "4. Отработка возражений", count: 798, pct: 38 },
      { name: "5. Закрытие со след. шагом", count: 491, pct: 23 },
    ],
    objections: [
      { name: "Уже работаем с другим", count: 258, pct: 32, resolveRate: 41 },
      { name: "Дорого", count: 214, pct: 27, resolveRate: 38 },
      { name: "Не сейчас, перезвоните", count: 142, pct: 18, resolveRate: 56 },
      { name: "Не интересно", count: 94, pct: 12, resolveRate: 22 },
      { name: "Нет полномочий решать", count: 52, pct: 7, resolveRate: 18 },
      { name: "Прочее", count: 38, pct: 5, resolveRate: 0 },
    ],
    baseSegments: [
      {
        name: "Тёплая база",
        contacts: 1250,
        conversionPct: 38,
        targets: 470,
        costPerLead: 420,
        tone: "ok",
      },
      {
        name: "Возвраты к покупке",
        contacts: 950,
        conversionPct: 32,
        targets: 304,
        costPerLead: 480,
        tone: "ok",
      },
      {
        name: "Холодная база",
        contacts: 2100,
        conversionPct: 8,
        targets: 168,
        costPerLead: 1850,
        tone: "warn",
      },
      {
        name: "Опрос NPS",
        contacts: 800,
        conversionPct: 56,
        targets: 448,
        costPerLead: 220,
        tone: "ok",
      },
    ],
    heatmap: {
      days: ["Пн", "Вт", "Ср", "Чт", "Пт"],
      hours: ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
      // % дозвона по часам — зелёный 75%+, жёлтый 50-75%, красный <50%
      data: [
        [62, 78, 82, 75, 64, 70, 78, 76, 68, 55, 42, 30],   // Пн
        [70, 84, 87, 81, 70, 76, 83, 80, 72, 58, 45, 32],   // Вт
        [72, 86, 89, 83, 72, 78, 85, 82, 74, 60, 47, 34],   // Ср
        [70, 84, 87, 81, 70, 76, 83, 80, 72, 58, 45, 32],   // Чт
        [58, 72, 76, 70, 60, 65, 72, 68, 60, 48, 36, 25],   // Пт
      ],
    },
    operators: [
      { name: "Иванова Анна", operatorId: "O0451", callCount: 412, avgTalkSec: 158, reachedPct: 74, conversionPct: 29, targets: 88, revenuePerContact: 1240 },
      { name: "Петров Борис", operatorId: "O0608", callCount: 388, avgTalkSec: 172, reachedPct: 70, conversionPct: 24, targets: 65, revenuePerContact: 980 },
      { name: "Сидорова Наталья", operatorId: "O0729", callCount: 348, avgTalkSec: 190, reachedPct: 68, conversionPct: 21, targets: 51, revenuePerContact: 875 },
      { name: "Соколов Виктор", operatorId: "O0834", callCount: 322, avgTalkSec: 168, reachedPct: 69, conversionPct: 27, targets: 60, revenuePerContact: 1105 },
      { name: "Залевская Мария", operatorId: "O0922", callCount: 305, avgTalkSec: 175, reachedPct: 65, conversionPct: 19, targets: 38, revenuePerContact: 720 },
      { name: "Белов Денис", operatorId: "O1034", callCount: 285, avgTalkSec: 185, reachedPct: 63, conversionPct: 17, targets: 32, revenuePerContact: 615 },
      { name: "Кузнецов Евгений", operatorId: "O1207", callCount: 190, avgTalkSec: 198, reachedPct: 60, conversionPct: 14, targets: 18, revenuePerContact: 480 },
    ],
    weeklyDynamics: [
      // 9 фактических недель + 4 прогнозных (до 30 июня)
      { week: "Нед 1 (1–7 апр)",    attempts: 220,  reached: 130,  targets: 18 },
      { week: "Нед 2 (8–14 апр)",   attempts: 380,  reached: 240,  targets: 38 },
      { week: "Нед 3 (15–21 апр)",  attempts: 540,  reached: 350,  targets: 68 },
      { week: "Нед 4 (22–28 апр)",  attempts: 620,  reached: 410,  targets: 92 },
      { week: "Нед 5 (29 апр–5 мая)", attempts: 580,  reached: 380,  targets: 88 },
      { week: "Нед 6 (6–12 мая)",   attempts: 700,  reached: 480,  targets: 115 },
      { week: "Нед 7 (13–19 мая)",  attempts: 740,  reached: 510,  targets: 124 },
      { week: "Нед 8 (20–26 мая)",  attempts: 720,  reached: 490,  targets: 118 },
      { week: "Нед 9 (27 мая–2 июн)", attempts: 685,  reached: 470,  targets: 110 },
      // Прогноз (с подсветкой пунктиром)
      { week: "Нед 10 (3–9 июн)",  attempts: null, reached: null, targets: null,
        forecastAttempts: 720, forecastReached: 490, forecastTargets: 120 },
      { week: "Нед 11 (10–16 июн)", attempts: null, reached: null, targets: null,
        forecastAttempts: 700, forecastReached: 475, forecastTargets: 115 },
      { week: "Нед 12 (17–23 июн)", attempts: null, reached: null, targets: null,
        forecastAttempts: 720, forecastReached: 490, forecastTargets: 120 },
      { week: "Нед 13 (24–30 июн)", attempts: null, reached: null, targets: null,
        forecastAttempts: 660, forecastReached: 450, forecastTargets: 105 },
    ],
    campaignCompare: [
      { metric: "База контактов",       prev: "9 800",  curr: "12 500", delta: "+27%",  tone: "up" },
      { metric: "Дозвон",                prev: "64%",    curr: "68%",    delta: "+4 п.п.", tone: "up" },
      { metric: "Конверсия",             prev: "19.2%",  curr: "23.4%",  delta: "+4.2 п.п.", tone: "up" },
      { metric: "Целевых действий",      prev: "1 205",  curr: "1 020 + прогноз 1 380", delta: "прогноз ×2", tone: "up" },
      { metric: "Стоимость лида",        prev: "980 ₽",  curr: "850 ₽",  delta: "−13%",  tone: "ok" },
      { metric: "Соответствие скрипту",  prev: "87%",    curr: "91%",    delta: "+4 п.п.", tone: "up" },
    ],
    forecast: [
      {
        label: "Прозвоним до 30 июня",
        value: "≈ 7 200 контактов",
        note: "при текущем темпе 260/день, останется 50 непрозвоненных",
        tone: "ok",
      },
      {
        label: "Целевых до конца Q2",
        value: "≈ 1 700",
        note: "1 020 уже + 680 прогноз — превысим план Q1 на 41%",
        tone: "ok",
      },
      {
        label: "Уложимся в срок",
        value: "до 30 июня",
        note: "без буфера — стоит ускорить темп на 5% или вынести 50 контактов в Q3",
        tone: "warn",
      },
      {
        label: "Стоимость лида",
        value: "≈ 870 ₽",
        note: "стабильно ниже Q1 (980 ₽) — экономика кампании в норме",
        tone: "ok",
      },
    ],
    insight:
      "За 9 недель команда сделала 5 750 попыток дозвона при темпе 260/день. Конверсия 23.4% — лучший результат за 3 кампании. Тёплая база и возвраты дали 770 из 1 020 целевых. Стоимость лида 850 ₽ — на 13% ниже Q1.",
    recommendations: [
      {
        title: "Утреннее окно 09:00–10:30 — лучший дозвон",
        body: "Конверсия в этом окне +35% к среднему дню (29% vs 23%). Перераспределение 20% звонков с послеобеденного слота даст ≈ +60 целевых за оставшийся месяц. Скрипт уже готов, команда обучена.",
        effect: "+60 целевых · ROI +27 000 ₽",
      },
      {
        title: "Обновление скрипта по возражению «дорого»",
        body: "Возражение «дорого» составляет 27% всех отказов и сейчас отрабатывается в 38% случаев — у рыночного среднего 52%. Подготовка блока «3 преимущества vs цена» с готовыми кейсами поднимет до 50% и даст +30 целевых до конца Q2.",
        effect: "+30 целевых · ROI +14 000 ₽",
      },
      {
        title: "Пополнение тёплой базы из реактивации",
        body: "Тёплая база даёт 38% конверсии vs 8% у холодной — разница в 4.7×. Расширение тёплой базы на 500 контактов из реактивации спящих клиентов 2024–2025 даст +190 целевых при той же команде.",
        effect: "+190 целевых · рост выручки на 17%",
      },
    ],
  },
};

// ──────────────────── АНАЛИТИКА ПО ИСХОДЯЩЕЙ КАМПАНИИ ────────────────────

export type OutboundAnalytics = {
  period: string;
  insights: AiInsight[];
  segmentRoi: {
    name: string;
    contacts: number;
    conversionPct: number;
    targets: number;
    spend: number;
    revenue: number;
    roi: number; // %
    tone: "ok" | "warn" | "neutral";
  }[];
  objectionsTrend: {
    name: string;
    count: number;
    pct: number;
    resolveRate: number;
    trendLabel: string;
    trendTone: ReportTone;
  }[];
  campaignTrend: {
    metric: string;
    label: string;
    values: { campaign: string; value: number }[];
    unit: string;
    trendTone: ReportTone;
  }[];
  benchmarks: {
    industry: string;
    items: {
      metric: string;
      unit: string;
      you: number;
      median: number;
      top10: number;
      higherIsBetter: boolean;
      tooltip: string;
    }[];
  };
  bestOperatorsInsight: {
    operator: string;
    conversionPct: number;
    bullets: string[];
  }[];
  whatIfBase: {
    contacts: number;
    operators: number;
    hotShare: number;
  };
};

export const outboundAnalytics: Record<string, OutboundAnalytics> = {
  "outbound-q2": {
    period: "Q2 2026 (по 04.06.2026)",
    insights: [
      {
        severity: "high",
        title: "Сезонный пик категории к октябрю — +35% к среднему",
        body: "По историческим данным аналогичных кампаний в Q4 объём целевых действий вырастает на 35–45%. Это окно для удвоения охвата и роста выручки.",
        suggestion: "Запланировать расширение базы и пакета минут до сентября — обсудите с менеджером доступные варианты.",
      },
      {
        severity: "med",
        title: "28% клиентов после согласия спрашивают о смежных продуктах",
        body: "После целевого действия многие клиенты интересуются дополнительными услугами и сервисами компании. Сейчас эти запросы уходят без сопровождения.",
        suggestion: "Подготовить материалы по сопутствующим продуктам для вашего отдела продаж — типовой рост среднего чека 15–20%.",
      },
      {
        severity: "low",
        title: "Региональная карта дозвона: Поволжье и Урал — топ",
        body: "В этих регионах уровень дозвона 78–82% — на 12 п.п. выше среднего по стране. Конверсия там тоже на 4 п.п. выше: целевая аудитория откликается активнее.",
        suggestion: "Усилить долю этих регионов в следующей базе — потенциально +50 целевых действий за кампанию.",
      },
      {
        severity: "ok",
        title: "Конверсия растёт 4 квартал подряд",
        body: "С Q3 2025 показатель вырос с 18.2% до 23.4% (+5.2 п.п.). Бизнес-модель кампании работает в правильном направлении — стабильный восходящий тренд.",
      },
    ],
    segmentRoi: [
      { name: "Тёплая база",      contacts: 1250, conversionPct: 38, targets: 470, spend: 198000, revenue: 705000, roi: 256, tone: "ok" },
      { name: "Возвраты к покупке", contacts: 950,  conversionPct: 32, targets: 304, spend: 146000, revenue: 456000, roi: 212, tone: "ok" },
      { name: "NPS-опрос",         contacts: 800,  conversionPct: 56, targets: 448, spend: 99000,  revenue: 0,      roi: 0,   tone: "neutral" },
      { name: "Холодная база",     contacts: 2100, conversionPct: 8,  targets: 168, spend: 311000, revenue: 252000, roi: -19, tone: "warn" },
    ],
    objectionsTrend: [
      { name: "Уже работаем с другим", count: 258, pct: 32, resolveRate: 41, trendLabel: "+18% к Q1", trendTone: "warn" },
      { name: "Дорого",                count: 214, pct: 27, resolveRate: 38, trendLabel: "−8 п.п. отработки", trendTone: "down" },
      { name: "Не сейчас, перезвоните", count: 142, pct: 18, resolveRate: 56, trendLabel: "стабильно", trendTone: "neutral" },
      { name: "Не интересно",          count: 94, pct: 12, resolveRate: 22, trendLabel: "падает отработка", trendTone: "down" },
      { name: "Нет полномочий",        count: 52, pct: 7,  resolveRate: 18, trendLabel: "стабильно", trendTone: "neutral" },
    ],
    campaignTrend: [
      {
        metric: "conversion",
        label: "Конверсия",
        unit: "%",
        values: [
          { campaign: "Q3 2025", value: 18.2 },
          { campaign: "Q4 2025", value: 20.5 },
          { campaign: "Q1 2026", value: 19.2 },
          { campaign: "Q2 2026", value: 23.4 },
        ],
        trendTone: "up",
      },
      {
        metric: "cpl",
        label: "Стоимость лида",
        unit: "₽",
        values: [
          { campaign: "Q3 2025", value: 1080 },
          { campaign: "Q4 2025", value: 980 },
          { campaign: "Q1 2026", value: 980 },
          { campaign: "Q2 2026", value: 850 },
        ],
        trendTone: "ok",
      },
      {
        metric: "roi",
        label: "ROI",
        unit: "%",
        values: [
          { campaign: "Q3 2025", value: 198 },
          { campaign: "Q4 2025", value: 232 },
          { campaign: "Q1 2026", value: 241 },
          { campaign: "Q2 2026", value: 285 },
        ],
        trendTone: "up",
      },
      {
        metric: "reach",
        label: "Уровень дозвона",
        unit: "%",
        values: [
          { campaign: "Q3 2025", value: 60 },
          { campaign: "Q4 2025", value: 63 },
          { campaign: "Q1 2026", value: 64 },
          { campaign: "Q2 2026", value: 68 },
        ],
        trendTone: "up",
      },
    ],
    benchmarks: {
      industry:
        "Средние показатели исходящих КЦ в eCommerce / B2B — открытые отраслевые исследования рынка, 2025",
      items: [
        { metric: "Уровень дозвона",     unit: "%",  you: 68,    median: 55,    top10: 75,    higherIsBetter: true,  tooltip: "Доля контактов, до которых удалось дозвониться за 3 попытки" },
        { metric: "Конверсия",            unit: "%",  you: 23.4,  median: 14,    top10: 28,    higherIsBetter: true,  tooltip: "Доля дозвонившихся, которые сделали целевое действие" },
        { metric: "Стоимость лида (CPL)",  unit: "₽",  you: 850,   median: 1200,  top10: 720,   higherIsBetter: false, tooltip: "Затраты на одно целевое действие" },
        { metric: "Время до результата",   unit: "сек", you: 108,  median: 160,   top10: 90,    higherIsBetter: false, tooltip: "Среднее время разговора до целевого действия" },
      ],
    },
    bestOperatorsInsight: [
      {
        operator: "Иванова Анна",
        conversionPct: 29,
        bullets: [
          "Использует 3 типовые формулировки преимуществ — другие операторы 1–2",
          "Закрывает на «второй встрече» в 41% против среднего 19%",
          "Отрабатывает возражение «дорого» в 58% случаев vs среднее 38%",
          "В её диалогах клиент формулирует возражение позже на 28 сек",
        ],
      },
      {
        operator: "Соколов Виктор",
        conversionPct: 27,
        bullets: [
          "92% диалогов с активным слушанием (пересказывает клиента)",
          "Использует кейсы из похожего бизнеса клиента в 71% разговоров",
          "Длительность презентации в среднем на 22 сек короче — выходит на возражения раньше",
        ],
      },
    ],
    whatIfBase: {
      contacts: 12500,
      operators: 4,
      hotShare: 25,
    },
  },
};

// ──────────────────── ИСХОДЯЩИЕ ЗВОНКИ ────────────────────

export type OutboundCallStatus = "target" | "reached" | "not_reached";

export const OUTBOUND_STATUS_LABEL: Record<OutboundCallStatus, string> = {
  target: "Целевое",
  reached: "Дозвон",
  not_reached: "Нет дозвона",
};

export type OutboundCall = {
  id: string;
  serviceId: string;
  date: string;
  time: string;
  operator: { id: string; name: string };
  contactNumber: string;
  segment: string;          // "Тёплая база" / "Холодная" / "Возвраты" / "NPS"
  attempt: 1 | 2 | 3;
  status: OutboundCallStatus;
  durationSec: number;
  topic?: string;
};

export const outboundCalls: OutboundCall[] = [
  // ── СЕГОДНЯ (04.06.2026) — 8 звонков ──
  { id: "oc-101", serviceId: "outbound-q2", date: "04.06.2026", time: "09:15:08", operator: { id: "O0451", name: "Иванова Анна" },     contactNumber: "+7 (916) 311-44-58", segment: "Тёплая база",        attempt: 1, status: "target",      durationSec: 187, topic: "Согласие на встречу" },
  { id: "oc-102", serviceId: "outbound-q2", date: "04.06.2026", time: "09:48:22", operator: { id: "O0608", name: "Петров Борис" },     contactNumber: "+7 (905) 822-19-30", segment: "Холодная база",      attempt: 1, status: "not_reached", durationSec: 8 },
  { id: "oc-103", serviceId: "outbound-q2", date: "04.06.2026", time: "10:22:14", operator: { id: "O0729", name: "Сидорова Наталья" }, contactNumber: "+7 (964) 200-33-77", segment: "Возвраты к покупке", attempt: 2, status: "target",      durationSec: 165, topic: "Заказ оформлен" },
  { id: "oc-104", serviceId: "outbound-q2", date: "04.06.2026", time: "11:05:42", operator: { id: "O0834", name: "Соколов Виктор" },   contactNumber: "+7 (903) 412-66-21", segment: "Тёплая база",        attempt: 1, status: "reached",     durationSec: 92,  topic: "Возражение «дорого»" },
  { id: "oc-105", serviceId: "outbound-q2", date: "04.06.2026", time: "12:18:33", operator: { id: "O0451", name: "Иванова Анна" },     contactNumber: "+7 (915) 800-11-44", segment: "NPS-опрос",          attempt: 1, status: "target",      durationSec: 134, topic: "Оценка 9/10" },
  { id: "oc-106", serviceId: "outbound-q2", date: "04.06.2026", time: "14:42:11", operator: { id: "O0922", name: "Залевская Мария" }, contactNumber: "+7 (812) 446-22-15", segment: "Холодная база",      attempt: 3, status: "not_reached", durationSec: 5 },
  { id: "oc-107", serviceId: "outbound-q2", date: "04.06.2026", time: "15:30:55", operator: { id: "O1034", name: "Белов Денис" },     contactNumber: "+7 (985) 622-33-88", segment: "Возвраты к покупке", attempt: 1, status: "target",      durationSec: 198, topic: "Заказ оформлен" },
  { id: "oc-108", serviceId: "outbound-q2", date: "04.06.2026", time: "17:08:14", operator: { id: "O0608", name: "Петров Борис" },     contactNumber: "+7 (495) 521-78-90", segment: "Тёплая база",        attempt: 2, status: "reached",     durationSec: 115, topic: "Возражение «уже с конкурентом»" },

  // ── ВЧЕРА (03.06.2026) — 6 звонков ──
  { id: "oc-110", serviceId: "outbound-q2", date: "03.06.2026", time: "09:45:18", operator: { id: "O0729", name: "Сидорова Наталья" }, contactNumber: "+7 (921) 555-12-90", segment: "Тёплая база",        attempt: 1, status: "target",      durationSec: 178, topic: "Согласие" },
  { id: "oc-111", serviceId: "outbound-q2", date: "03.06.2026", time: "11:22:31", operator: { id: "O0834", name: "Соколов Виктор" },   contactNumber: "+7 (985) 622-33-88", segment: "Холодная база",      attempt: 2, status: "reached",     durationSec: 88, topic: "Не сейчас" },
  { id: "oc-112", serviceId: "outbound-q2", date: "03.06.2026", time: "13:55:09", operator: { id: "O0451", name: "Иванова Анна" },     contactNumber: "+7 (903) 555-44-33", segment: "Возвраты к покупке", attempt: 1, status: "target",      durationSec: 245, topic: "Заказ оформлен" },
  { id: "oc-113", serviceId: "outbound-q2", date: "03.06.2026", time: "15:42:55", operator: { id: "O0922", name: "Залевская Мария" }, contactNumber: "+7 (909) 100-88-77", segment: "Холодная база",      attempt: 1, status: "not_reached", durationSec: 6 },
  { id: "oc-114", serviceId: "outbound-q2", date: "03.06.2026", time: "16:18:42", operator: { id: "O1207", name: "Кузнецов Евгений" }, contactNumber: "+7 (812) 220-44-66", segment: "NPS-опрос",          attempt: 2, status: "target",      durationSec: 122, topic: "Оценка 8/10" },
  { id: "oc-115", serviceId: "outbound-q2", date: "03.06.2026", time: "17:30:20", operator: { id: "O1034", name: "Белов Денис" },     contactNumber: "+7 (903) 412-66-21", segment: "Тёплая база",        attempt: 1, status: "reached",     durationSec: 134, topic: "Думает" },

  // ── ЭТА НЕДЕЛЯ (28–31.05.2026) — 5 звонков ──
  { id: "oc-120", serviceId: "outbound-q2", date: "31.05.2026", time: "10:15:23", operator: { id: "O0451", name: "Иванова Анна" },     contactNumber: "+7 (903) 718-22-44", segment: "Тёплая база",        attempt: 1, status: "target",      durationSec: 192, topic: "Согласие" },
  { id: "oc-121", serviceId: "outbound-q2", date: "30.05.2026", time: "11:42:08", operator: { id: "O0729", name: "Сидорова Наталья" }, contactNumber: "+7 (964) 332-11-90", segment: "Холодная база",      attempt: 3, status: "not_reached", durationSec: 9 },
  { id: "oc-122", serviceId: "outbound-q2", date: "29.05.2026", time: "14:30:12", operator: { id: "O0834", name: "Соколов Виктор" },   contactNumber: "+7 (495) 880-22-11", segment: "Возвраты к покупке", attempt: 1, status: "target",      durationSec: 215, topic: "Заказ" },
  { id: "oc-123", serviceId: "outbound-q2", date: "29.05.2026", time: "16:11:33", operator: { id: "O0608", name: "Петров Борис" },     contactNumber: "+7 (916) 545-66-77", segment: "NPS-опрос",          attempt: 1, status: "target",      durationSec: 105, topic: "Оценка 10/10" },
  { id: "oc-124", serviceId: "outbound-q2", date: "28.05.2026", time: "12:08:42", operator: { id: "O0922", name: "Залевская Мария" }, contactNumber: "+7 (985) 100-99-88", segment: "Тёплая база",        attempt: 2, status: "reached",     durationSec: 142, topic: "Возражение «дорого»" },

  // ── ЭТОТ МЕСЯЦ (08–22.05.2026) — 4 звонка ──
  { id: "oc-130", serviceId: "outbound-q2", date: "22.05.2026", time: "10:18:20", operator: { id: "O0451", name: "Иванова Анна" },     contactNumber: "+7 (905) 100-44-22", segment: "Тёплая база",        attempt: 1, status: "target",      durationSec: 158, topic: "Согласие" },
  { id: "oc-131", serviceId: "outbound-q2", date: "18.05.2026", time: "12:45:08", operator: { id: "O0834", name: "Соколов Виктор" },   contactNumber: "+7 (921) 622-99-88", segment: "Холодная база",      attempt: 1, status: "reached",     durationSec: 88, topic: "Не интересно" },
  { id: "oc-132", serviceId: "outbound-q2", date: "12.05.2026", time: "15:32:42", operator: { id: "O1034", name: "Белов Денис" },     contactNumber: "+7 (495) 770-33-11", segment: "Возвраты к покупке", attempt: 2, status: "target",      durationSec: 218, topic: "Заказ" },
  { id: "oc-133", serviceId: "outbound-q2", date: "08.05.2026", time: "16:25:55", operator: { id: "O1207", name: "Кузнецов Евгений" }, contactNumber: "+7 (903) 233-44-55", segment: "Холодная база",      attempt: 1, status: "not_reached", durationSec: 7 },
];

// ──────────────────── ДИАЛОГИ НЕЙРОАССИСТЕНТА ────────────────────

export type DialogChannel = "telegram" | "whatsapp" | "phone" | "chat";

export const DIALOG_CHANNEL_LABEL: Record<DialogChannel, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  phone: "Телефон",
  chat: "Чат",
};

export type Dialog = {
  id: string;
  serviceId: string;
  date: string; // "DD.MM.YYYY"
  time: string; // "HH:mm:ss"
  channel: DialogChannel;
  topic: string;
  escalated: boolean;
  durationSec: number;
  rating?: number; // оценка пользователем 1–5
  ai?: {
    summary: string;
    category: string;
    subcategory: string;
  };
  // Стенограмма: bot = реплики нейроассистента, user = клиент, agent = оператор (после эскалации)
  transcript?: { speaker: "bot" | "user" | "agent"; text: string; time: string }[];
  hasRecording?: boolean; // голосовая запись (для phone-канала и эскалированных диалогов)
};

const DIALOG_TRANSCRIPT_ORDER: Dialog["transcript"] = [
  { speaker: "bot", text: "Здравствуйте! Я нейроассистент бренда. Чем могу помочь?", time: "00:00" },
  { speaker: "user", text: "Хочу узнать, где мой заказ № 4452.", time: "00:04" },
  { speaker: "bot", text: "Сейчас посмотрю. Подождите пару секунд...", time: "00:06" },
  { speaker: "bot", text: "Ваш заказ передан в курьерскую службу. Доставка завтра до 12:00. Курьер позвонит за 30 минут.", time: "00:09" },
  { speaker: "user", text: "Отлично, спасибо!", time: "00:18" },
  { speaker: "bot", text: "Хорошего дня! Если будут вопросы — пишите.", time: "00:20" },
];

const DIALOG_TRANSCRIPT_RETURN: Dialog["transcript"] = [
  { speaker: "bot", text: "Здравствуйте! Чем могу помочь?", time: "00:00" },
  { speaker: "user", text: "Хочу оформить возврат, не подошёл размер.", time: "00:03" },
  { speaker: "bot", text: "Подскажите номер заказа, пожалуйста.", time: "00:06" },
  { speaker: "user", text: "3318", time: "00:10" },
  { speaker: "bot", text: "Нашёл заказ. Подтверждаю: возврат можно оформить. Срок поступления денег на карту — 5 рабочих дней. Подтвердите оформление?", time: "00:13" },
  { speaker: "user", text: "Да, оформляйте.", time: "00:24" },
  { speaker: "bot", text: "Готово! Заявка на возврат № R-8821. На почту отправлена инструкция для отправки товара.", time: "00:26" },
];

const DIALOG_TRANSCRIPT_ESCALATION: Dialog["transcript"] = [
  { speaker: "bot", text: "Здравствуйте! Я нейроассистент. Чем могу помочь?", time: "00:00" },
  { speaker: "user", text: "У меня не получается синхронизировать ваш гаджет с приложением — выдает ошибку 504.", time: "00:05" },
  { speaker: "bot", text: "Уточните, пожалуйста, модель гаджета и версию приложения.", time: "00:11" },
  { speaker: "user", text: "Модель X-2200, приложение 4.7.1.", time: "00:18" },
  { speaker: "bot", text: "Я попробую несколько стандартных решений. Очистите кэш приложения и переустановите.", time: "00:22" },
  { speaker: "user", text: "Уже делал, не помогает.", time: "00:35" },
  { speaker: "bot", text: "Понятно. Передаю вас оператору технической поддержки — он подключится в течение минуты.", time: "00:38" },
  { speaker: "agent", text: "Здравствуйте, я Дмитрий, техподдержка. Вижу вашу ошибку 504 — это связано с обновлением прошивки. Сейчас проведу удалённую диагностику.", time: "01:15" },
  { speaker: "user", text: "Хорошо, спасибо.", time: "01:28" },
];

// Привязываем стенограммы и AI-карточки к отдельным диалогам
const ENRICH_DIALOG: Record<string, Pick<Dialog, "ai" | "transcript" | "hasRecording">> = {
  "d-101": {
    ai: {
      summary: "Клиент уточнил статус заказа №4452. Нейроассистент предоставил информацию о курьерской доставке на следующий день до 12:00.",
      category: "Заказы и доставка",
      subcategory: "Статус заказа",
    },
    transcript: DIALOG_TRANSCRIPT_ORDER,
  },
  "d-102": {
    ai: {
      summary: "Клиент оформил возврат товара (заказ 3318, причина — размер). Возврат средств в течение 5 рабочих дней.",
      category: "Возвраты",
      subcategory: "Возврат по размеру",
    },
    transcript: DIALOG_TRANSCRIPT_RETURN,
  },
  "d-103": {
    ai: {
      summary: "Технический вопрос по синхронизации гаджета X-2200. Нейроассистент попробовал стандартные решения, эскалация на оператора техподдержки для удалённой диагностики.",
      category: "Технические вопросы",
      subcategory: "Синхронизация с приложением",
    },
    transcript: DIALOG_TRANSCRIPT_ESCALATION,
    hasRecording: true,
  },
  "d-107": {
    ai: {
      summary: "Вечерний запрос: статус заказа. Нейроассистент моментально предоставил данные о доставке.",
      category: "Заказы и доставка",
      subcategory: "Статус заказа",
    },
    transcript: DIALOG_TRANSCRIPT_ORDER,
  },
  "d-111": {
    ai: {
      summary: "Сложный возврат: товар повреждён при доставке. Эскалация на оператора для оформления компенсации.",
      category: "Возвраты",
      subcategory: "Повреждённый товар",
    },
    transcript: DIALOG_TRANSCRIPT_ESCALATION,
    hasRecording: true,
  },
  "d-113": {
    ai: {
      summary: "Технический вопрос: ошибка авторизации в личном кабинете. Нейроассистент не смог решить, эскалация на оператора.",
      category: "Технические вопросы",
      subcategory: "Авторизация",
    },
    transcript: DIALOG_TRANSCRIPT_ESCALATION,
    hasRecording: true,
  },
  "d-130": {
    ai: {
      summary: "Голосовой звонок через телефон — пользователь предпочёл голосовое общение. Нейроассистент в голосовом режиме предоставил информацию о статусе заказа.",
      category: "Заказы и доставка",
      subcategory: "Статус заказа",
    },
    transcript: DIALOG_TRANSCRIPT_ORDER,
    hasRecording: true,
  },
  "d-132": {
    ai: {
      summary: "Возврат с эскалацией на оператора для согласования индивидуальных условий компенсации.",
      category: "Возвраты",
      subcategory: "Индивидуальный случай",
    },
    transcript: DIALOG_TRANSCRIPT_ESCALATION,
    hasRecording: true,
  },
};

const RAW_DIALOGS: Dialog[] = [
  // ── СЕГОДНЯ (04.06.2026) — 7 диалогов ──
  { id: "d-101", serviceId: "chatbot", date: "04.06.2026", time: "09:12:08", channel: "chat", topic: "Статус заказа", escalated: false, durationSec: 64, rating: 5 },
  { id: "d-102", serviceId: "chatbot", date: "04.06.2026", time: "10:34:22", channel: "telegram", topic: "Возврат", escalated: false, durationSec: 142, rating: 4 },
  { id: "d-103", serviceId: "chatbot", date: "04.06.2026", time: "11:48:55", channel: "telegram", topic: "Технический вопрос", escalated: true, durationSec: 218 },
  { id: "d-104", serviceId: "chatbot", date: "04.06.2026", time: "13:22:11", channel: "whatsapp", topic: "Условия доставки", escalated: false, durationSec: 92, rating: 5 },
  { id: "d-105", serviceId: "chatbot", date: "04.06.2026", time: "15:05:42", channel: "chat", topic: "Проверка совместимости товара", escalated: false, durationSec: 124, rating: 5 },
  { id: "d-106", serviceId: "chatbot", date: "04.06.2026", time: "17:18:33", channel: "telegram", topic: "Оплата и счета", escalated: false, durationSec: 78 },
  { id: "d-107", serviceId: "chatbot", date: "04.06.2026", time: "21:42:09", channel: "chat", topic: "Статус заказа", escalated: false, durationSec: 52, rating: 5 },

  // ── ВЧЕРА (03.06.2026) — 5 диалогов ──
  { id: "d-110", serviceId: "chatbot", date: "03.06.2026", time: "10:08:14", channel: "telegram", topic: "Статус заказа", escalated: false, durationSec: 58, rating: 5 },
  { id: "d-111", serviceId: "chatbot", date: "03.06.2026", time: "12:22:31", channel: "whatsapp", topic: "Возврат", escalated: true, durationSec: 194 },
  { id: "d-112", serviceId: "chatbot", date: "03.06.2026", time: "14:55:09", channel: "telegram", topic: "Бонусные баллы", escalated: false, durationSec: 88, rating: 4 },
  { id: "d-113", serviceId: "chatbot", date: "03.06.2026", time: "18:42:55", channel: "chat", topic: "Технический вопрос", escalated: true, durationSec: 256 },
  { id: "d-114", serviceId: "chatbot", date: "03.06.2026", time: "22:18:42", channel: "chat", topic: "Статус заказа", escalated: false, durationSec: 64, rating: 5 },

  // ── ЭТА НЕДЕЛЯ (28–31.05.2026) — 4 диалога ──
  { id: "d-120", serviceId: "chatbot", date: "31.05.2026", time: "11:25:18", channel: "chat", topic: "Доставка", escalated: false, durationSec: 92, rating: 5 },
  { id: "d-121", serviceId: "chatbot", date: "30.05.2026", time: "13:08:42", channel: "telegram", topic: "Возврат", escalated: false, durationSec: 168, rating: 4 },
  { id: "d-122", serviceId: "chatbot", date: "29.05.2026", time: "16:50:33", channel: "whatsapp", topic: "Проверка совместимости товара", escalated: false, durationSec: 142 },
  { id: "d-123", serviceId: "chatbot", date: "28.05.2026", time: "20:12:55", channel: "telegram", topic: "Технический вопрос", escalated: true, durationSec: 286 },

  // ── ЭТОТ МЕСЯЦ (08–22.05.2026) — 4 диалога ──
  { id: "d-130", serviceId: "chatbot", date: "22.05.2026", time: "10:18:20", channel: "phone", topic: "Статус заказа", escalated: false, durationSec: 72, rating: 5 },
  { id: "d-131", serviceId: "chatbot", date: "18.05.2026", time: "12:45:08", channel: "chat", topic: "Оплата и счета", escalated: false, durationSec: 95, rating: 4 },
  { id: "d-132", serviceId: "chatbot", date: "12.05.2026", time: "15:32:42", channel: "telegram", topic: "Возврат", escalated: true, durationSec: 218 },
  { id: "d-133", serviceId: "chatbot", date: "08.05.2026", time: "21:08:55", channel: "chat", topic: "Статус заказа", escalated: false, durationSec: 58, rating: 5 },
];

// Применяем обогащение (стенограмма, AI-карточка, запись) к диалогам по id
export const dialogs: Dialog[] = RAW_DIALOGS.map((d) => ({
  ...d,
  ...(ENRICH_DIALOG[d.id] ?? {}),
}));

export const callStats = {
  total: 1786,
  answered: 1786,
  missed: 0,
  avgWait: 8,
  avgDuration: 87,
};

// ──────────────────── ОТЧЁТЫ ПО УСЛУГАМ (вход) ────────────────────

export type ReportTone = "up" | "down" | "ok" | "warn" | "neutral";

export type OperatorStat = {
  name: string;
  operatorId: string;
  callCount: number;
  pctOfTotal: number;
  totalTalkSec: number;
  avgTalkSec: number;
};

export type PeriodSnapshot = {
  rangeLabel: string;      // "4 июня 2026" / "29 мая – 4 июня"
  compareLabel: string;    // "к 3 июня" / "к прошлой неделе"
  kpis: { label: string; value: string; delta: string; tone: ReportTone }[];
  transfers: {
    total: number;
    pctOfIncoming: number;
    deltaLabel: string;
    deltaTone: ReportTone;
    destinations: { name: string; count: number; pct: number }[];
  };
};

export type ServiceReport = {
  period: string;
  currentLabel: string; // подпись закрытого месяца (по умолчанию)
  previousLabel: string; // подпись предыдущего закрытого месяца
  mtdCurrentLabel?: string; // подпись текущего MTD-окна
  mtdPreviousLabel?: string; // подпись прошлого месяца за то же количество дней
  mtdDayCount?: number; // сколько дней уже прошло в текущем месяце
  kpisCurrentMonthLabel?: string; // явная подпись к KPI-блоку (Июнь 2026 (с 1 по 4))
  // Данные KPI/переведённых для разных скоупов времени.
  // Используется верхним переключателем периода (Сегодня/Вчера/Неделя/Месяц/Период).
  kpisByPeriod?: Record<"today" | "yesterday" | "week" | "month" | "custom", PeriodSnapshot>;
  kpis: {
    label: string;
    value: string;
    delta: string;
    tone: ReportTone;
    tooltip?: string;
  }[];
  // Годовой отчёт по месяцам с возможностью переключаться между годами
  yearlyReports?: Record<
    string,
    {
      rows: {
        metric: string;
        values: (string | null)[]; // 12 значений Янв-Дек, null если данных нет
      }[];
      insight: string; // короткий вывод по году для менеджера
    }
  >;
  // Динамика по месяцам за 12 последних месяцев + прогноз на 2 месяца вперёд
  monthlyDynamics12?: {
    month: string;
    incoming?: number;
    answered?: number;
    abandoned?: number;
    forecastIncoming?: number;
    forecastAnswered?: number;
    forecastAbandoned?: number;
  }[];
  // Вызовы по операторам — Фамилия Имя, количество, суммарное и среднее время разговора
  operatorStats?: OperatorStat[];
  // Тот же набор операторов, но по разным окнам времени
  operatorStatsByPeriod?: Record<"today" | "yesterday" | "week" | "month" | "custom", OperatorStat[]>;
  // Распределение по каналам — для услуг с разными источниками входа (нейроассистент)
  channels?: {
    total: number;
    items: { name: string; count: number; pct: number }[];
  };
  // Переведённые вызовы — куда уходят звонки 2-й линии
  transfers?: {
    total: number;
    pctOfIncoming: number;
    deltaLabel: string;
    deltaTone: ReportTone;
    destinations: { name: string; count: number; pct: number }[];
  };
  insight: string;
  dynamics: {
    date: string;
    incoming: number;
    answered: number;
    abandoned: number;
  }[];
  monthOverMonth: {
    metric: string;
    prev: string;
    current: string;
    delta: string;
    tone: ReportTone;
  }[];
  // Тот же набор показателей, но за MTD: текущий месяц на N дней vs прошлый месяц за тот же диапазон дней
  monthOverMonthMtd?: {
    metric: string;
    prev: string;
    current: string;
    delta: string;
    tone: ReportTone;
  }[];
  distribution?: { name: string; value: number; color: string }[];
  heatmap: { days: string[]; hours: string[]; data: number[][] };
  forecast: {
    label: string;
    value: string;
    note: string;
    tone: "neutral" | "ok" | "warn";
  }[];
  recommendations: { title: string; body: string; effect: string }[];
};

const HOURS_12 = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
const DAYS_5 = ["Пн", "Вт", "Ср", "Чт", "Пт"];

// 24 часа × 7 дней — для красивой теплокарты в духе screenshot'а пользователя
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const DAYS_7 = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Генератор: 24/7 — пиковая активность 11-15 в будни, выходные ниже на 30%
function makeHeat247(): number[][] {
  return DAYS_7.map((_, d) => {
    const isWeekend = d >= 5;
    const weekendMult = isWeekend ? 0.55 : 1;
    return HOURS_24.map((_, h) => {
      // Ночные часы 0-6: 0-3 звонка
      if (h < 7) return Math.max(0, Math.round((1 + Math.sin(h + d) * 1) * weekendMult));
      // Утро 7-8: разогрев
      if (h < 9) return Math.round((10 + Math.sin(h + d) * 5) * weekendMult);
      // Пик 9-19
      if (h >= 9 && h <= 19) {
        const base = 60 + Math.cos((h - 12) * 0.6) * 35 + Math.sin(d) * 8;
        return Math.max(20, Math.round(base * weekendMult));
      }
      // Вечер 20-23: спад
      return Math.round((25 - (h - 20) * 5 + Math.sin(d) * 3) * weekendMult);
    });
  });
}

// ──────────────────── АНАЛИТИКА ПО УСЛУГАМ ────────────────────

export type AiInsight = {
  severity: "high" | "med" | "low" | "ok";
  title: string;
  body: string;
  suggestion?: string;
};

export type ForecastPoint = {
  month: string;
  actual?: number;
  forecast?: number;
  low?: number;
  high?: number;
};

export type TopicTrend = {
  name: string;
  current: number; // % share
  delta: string; // например, "+5 п.п."
  state: "new" | "growing" | "stable" | "declining" | "lost";
};

// Топ-5 тематик с историей за 6 месяцев и инсайтом
export type TopTopic = {
  name: string;
  currentShare: number; // % сейчас
  delta30d: string; // изменение за 30 дней
  trend: "up" | "down" | "stable";
  history6m: { month: string; value: number }[];
  insight?: string;
};

// Новые тематики (появились в последние 30 дней)
export type NewTopic = {
  name: string;
  appearedAt: string;
  count: number;
  share: number; // % от потока
  insight?: string;
};

// Уходящие тематики (резко снизились или пропали)
export type LostTopic = {
  name: string;
  previousShare: number;
  currentShare: number; // 0 если ушла
  lastSeen: string;
  reason?: string;
};

// Связи тем (часто идут вместе)
export type TopicConnection = {
  from: string;
  to: string;
  strength: number; // % переходов
  avgGap: string; // временной интервал
  insight?: string;
};

export type Benchmark = {
  metric: string;
  unit: string;
  you: number;
  median: number;
  top10: number;
  higherIsBetter: boolean;
  tooltip?: string;
};

export type ServiceAnalytics = {
  period: string;
  insights: AiInsight[];
  forecast: {
    points: ForecastPoint[];
    implications: string[];
  };
  topics: {
    top: TopTopic[];
    new: NewTopic[];
    lost: LostTopic[];
    connections: TopicConnection[];
  };
  benchmarks: {
    industry: string;
    items: Benchmark[];
  };
};

export const serviceAnalytics: Record<string, ServiceAnalytics> = {
  "hotline-247": {
    period: "Май 2026, накоплено 6 месяцев данных",
    insights: [
      {
        severity: "high",
        title: "Тема «возврат средств» растёт +23% за 14 дней",
        body: "Доля обращений с темой «возврат» выросла с 18% до 22%. Половина связана с задержками возврата на карту >7 дней.",
        suggestion: "Сократить SLA по возвратам до 5 дней или добавить статус-чек в личный кабинет.",
      },
      {
        severity: "med",
        title: "Пятница 11:00–13:00 — пик недели",
        body: "В пятничный обед поток на 18% выше среднего часа недели. Большая часть — статусы возвратов и оплаты от ваших клиентов перед выходными.",
        suggestion: "Авто-уведомления о статусе платежа в email/push могут снять до 30% таких обращений.",
      },
      {
        severity: "low",
        title: "Новая тематика: «статус приоритета заказа»",
        body: "За последние 2 недели появилось 78 обращений на эту тему (4% от потока). Клиенты хотят понимать, на каком этапе находится их посылка.",
        suggestion: "Открыть FAQ-страницу с автоматическим статусом — оценочно снимет до 60% таких обращений.",
      },
      {
        severity: "ok",
        title: "Доля негативных диалогов −5 п.п. за месяц",
        body: "С 12% до 7% — лучший результат за полгода. Ваши клиенты заметно реже выражают раздражение в разговоре.",
      },
    ],
    forecast: {
      points: [
        // Историческое (фактическое)
        { month: "Дек 25", actual: 3180 },
        { month: "Янв 26", actual: 2576 },
        { month: "Фев 26", actual: 2380 },
        { month: "Мар 26", actual: 2440 },
        { month: "Апр 26", actual: 2144 },
        { month: "Май 26", actual: 2576 },
        // Прогноз
        { month: "Июн 26", forecast: 2800, low: 2650, high: 2950 },
        { month: "Июл 26", forecast: 2600, low: 2400, high: 2800 },
        { month: "Авг 26", forecast: 2450, low: 2250, high: 2650 },
        { month: "Сен 26", forecast: 2900, low: 2700, high: 3100 },
        { month: "Окт 26", forecast: 3150, low: 2900, high: 3400 },
        { month: "Ноя 26", forecast: 3650, low: 3300, high: 4000 },
      ],
      implications: [
        "С октября ожидается рост на 22% — рассмотреть расширение пакета.",
        "В ноябре пиковая нагрузка (Чёрная пятница): +42% к среднему за полгода.",
        "В июле-августе типичный объём — подходящее время для запуска кросс-кампаний и активаций.",
      ],
    },
    topics: {
      top: [
        {
          name: "Статус заказа",
          currentShare: 31,
          delta30d: "−2 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 32 },
            { month: "Янв", value: 33 },
            { month: "Фев", value: 32 },
            { month: "Мар", value: 31 },
            { month: "Апр", value: 33 },
            { month: "Май", value: 31 },
          ],
          insight: "Базовая нагрузка — стабильна 6 месяцев. Снимается через статус заказа в личном кабинете.",
        },
        {
          name: "Возврат средств",
          currentShare: 22,
          delta30d: "+5 п.п. за 30 дней",
          trend: "up",
          history6m: [
            { month: "Дек", value: 12 },
            { month: "Янв", value: 14 },
            { month: "Фев", value: 16 },
            { month: "Мар", value: 18 },
            { month: "Апр", value: 17 },
            { month: "Май", value: 22 },
          ],
          insight: "Половина обращений связана с задержкой возврата на карту > 7 дней. Сократить SLA до 5 дней.",
        },
        {
          name: "Технический вопрос",
          currentShare: 17,
          delta30d: "+1 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 18 },
            { month: "Янв", value: 16 },
            { month: "Фев", value: 17 },
            { month: "Мар", value: 17 },
            { month: "Апр", value: 16 },
            { month: "Май", value: 17 },
          ],
          insight: "Рост на 47% обращений по теме «восстановление пароля» — проверьте сервис отправки писем.",
        },
        {
          name: "Доставка",
          currentShare: 13,
          delta30d: "−3 п.п.",
          trend: "down",
          history6m: [
            { month: "Дек", value: 18 },
            { month: "Янв", value: 17 },
            { month: "Фев", value: 16 },
            { month: "Мар", value: 16 },
            { month: "Апр", value: 16 },
            { month: "Май", value: 13 },
          ],
          insight: "Снижение благодаря отслеживанию посылок в реальном времени, запущенному в марте.",
        },
        {
          name: "Оплата и счета",
          currentShare: 9,
          delta30d: "−1 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 10 },
            { month: "Янв", value: 10 },
            { month: "Фев", value: 9 },
            { month: "Мар", value: 10 },
            { month: "Апр", value: 10 },
            { month: "Май", value: 9 },
          ],
        },
      ],
      new: [
        {
          name: "Статус приоритета заказа",
          appearedAt: "12.05.2026",
          count: 78,
          share: 4,
          insight: "Появилась после запуска приоритетной доставки. Открыть FAQ-страницу — снимет ~60% обращений.",
        },
        {
          name: "Подписка отменена сама",
          appearedAt: "01.05.2026",
          count: 34,
          share: 1.8,
          insight: "Возможен сбой в биллинге автопродления. Проверить логи за 28–30 апреля.",
        },
        {
          name: "Возврат бонусов",
          appearedAt: "20.05.2026",
          count: 19,
          share: 1,
        },
      ],
      lost: [
        {
          name: "Промокоды",
          previousShare: 8,
          currentShare: 1,
          lastSeen: "20.04.2026",
          reason: "Завершилась весенняя акция «20% на всё»",
        },
        {
          name: "Заказ для друга",
          previousShare: 3,
          currentShare: 0,
          lastSeen: "30.03.2026",
          reason: "Реферальная программа перенесена в мобильное приложение",
        },
        {
          name: "Дозаказ к существующему",
          previousShare: 2,
          currentShare: 0,
          lastSeen: "10.04.2026",
          reason: "Появилась кнопка «добавить к заказу» в личном кабинете",
        },
      ],
      connections: [
        {
          from: "Качество товара",
          to: "Возврат средств",
          strength: 78,
          avgGap: "2–3 дня",
          insight: "Жалоба на качество → возврат в 78% случаев. Превентивный контроль качества снимет до 30% возвратов.",
        },
        {
          from: "Доставка",
          to: "Жалоба на курьера",
          strength: 54,
          avgGap: "в том же звонке",
        },
        {
          from: "Тех. вопрос",
          to: "Восстановление пароля",
          strength: 41,
          avgGap: "в том же звонке",
        },
        {
          from: "Статус заказа",
          to: "Изменение адреса",
          strength: 33,
          avgGap: "1–2 минуты",
        },
      ],
    },
    benchmarks: {
      industry:
        "Средние показатели контакт-центров в eCommerce / ритейле — включая собственные КЦ компаний (открытые отраслевые исследования рынка, 2025)",
      items: [
        {
          metric: "Скорость ответа",
          unit: "сек",
          you: 13,
          median: 38,
          top10: 12,
          higherIsBetter: false,
          tooltip: "Среднее время ответа на звонок",
        },
        {
          metric: "Service Level",
          unit: "%",
          you: 97,
          median: 74,
          top10: 95,
          higherIsBetter: true,
          tooltip: "Доля звонков в пределах норматива",
        },
        {
          metric: "Доля брошенных",
          unit: "%",
          you: 4.2,
          median: 11.8,
          top10: 3.5,
          higherIsBetter: false,
          tooltip: "Доля звонков, на которые клиент не дождался ответа",
        },
        {
          metric: "Время обработки",
          unit: "сек",
          you: 214,
          median: 320,
          top10: 190,
          higherIsBetter: false,
          tooltip: "Средняя длительность разговора на одно обращение",
        },
        {
          metric: "Решение с первого обращения",
          unit: "%",
          you: 84,
          median: 62,
          top10: 88,
          higherIsBetter: true,
          tooltip:
            "Доля обращений, по которым вопрос решён сразу без повторных звонков",
        },
      ],
    },
  },
  "hotline-fte": {
    period: "Май 2026, накоплено 3 месяца данных",
    insights: [
      {
        severity: "med",
        title: "Поток обращений растёт +8% за квартал",
        body: "При сохранении тренда к августу выйдете за рамки текущего пакета — возможно снижение SL до 88%.",
        suggestion: "Рассмотреть расширение пакета или перераспределение части потока на поминутную линию.",
      },
      {
        severity: "ok",
        title: "ASA стабилен в пиковые часы",
        body: "В отличие от поминутной линии, выделенная команда держит ASA 22 сек ±3 сек даже в пик 11–13.",
      },
    ],
    forecast: {
      points: [
        { month: "Мар 26", actual: 1370 },
        { month: "Апр 26", actual: 1370 },
        { month: "Май 26", actual: 1480 },
        { month: "Июн 26", forecast: 1550, low: 1480, high: 1620 },
        { month: "Июл 26", forecast: 1480, low: 1400, high: 1560 },
        { month: "Авг 26", forecast: 1400, low: 1320, high: 1480 },
        { month: "Сен 26", forecast: 1620, low: 1540, high: 1700 },
        { month: "Окт 26", forecast: 1780, low: 1680, high: 1880 },
        { month: "Ноя 26", forecast: 1950, low: 1820, high: 2080 },
      ],
      implications: [
        "К ноябрю ожидается рост до 1 950 обращений (+32% к текущему уровню).",
        "К октябрю стоит обсудить расширение пакета — чтобы команда успела пройти онбординг до старта высокого сезона.",
        "Лето — низкий сезон. Хорошее окно для запуска дополнительных каналов: чат, исходящие активации.",
      ],
    },
    topics: {
      top: [
        {
          name: "Корпоративные счета",
          currentShare: 38,
          delta30d: "+3 п.п.",
          trend: "up",
          history6m: [
            { month: "Дек", value: 32 },
            { month: "Янв", value: 34 },
            { month: "Фев", value: 35 },
            { month: "Мар", value: 36 },
            { month: "Апр", value: 35 },
            { month: "Май", value: 38 },
          ],
          insight: "Рост из-за расширения B2B-сегмента. Расширенный FAQ по корпоративным счетам может снять до 20% типовых обращений.",
        },
        {
          name: "Технический вопрос",
          currentShare: 24,
          delta30d: "0 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 25 },
            { month: "Янв", value: 24 },
            { month: "Фев", value: 25 },
            { month: "Мар", value: 24 },
            { month: "Апр", value: 24 },
            { month: "Май", value: 24 },
          ],
        },
        {
          name: "Изменение условий",
          currentShare: 18,
          delta30d: "+1 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 17 },
            { month: "Янв", value: 17 },
            { month: "Фев", value: 18 },
            { month: "Мар", value: 17 },
            { month: "Апр", value: 17 },
            { month: "Май", value: 18 },
          ],
        },
        {
          name: "Подключение услуг",
          currentShare: 11,
          delta30d: "−2 п.п.",
          trend: "down",
          history6m: [
            { month: "Дек", value: 15 },
            { month: "Янв", value: 14 },
            { month: "Фев", value: 13 },
            { month: "Мар", value: 13 },
            { month: "Апр", value: 13 },
            { month: "Май", value: 11 },
          ],
          insight: "Снижение, потому что часть подключений ушла в личный кабинет на сайт.",
        },
        {
          name: "Эскалация",
          currentShare: 9,
          delta30d: "−1 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 10 },
            { month: "Янв", value: 10 },
            { month: "Фев", value: 9 },
            { month: "Мар", value: 10 },
            { month: "Апр", value: 10 },
            { month: "Май", value: 9 },
          ],
        },
      ],
      new: [
        {
          name: "Запрос API-документации",
          appearedAt: "08.05.2026",
          count: 24,
          share: 1.6,
          insight: "После публикации нового продукта в портале для разработчиков — ожидаемо.",
        },
        {
          name: "Биллинг по новой системе",
          appearedAt: "01.05.2026",
          count: 18,
          share: 1.2,
        },
      ],
      lost: [
        {
          name: "Сертификаты ЭЦП",
          previousShare: 4,
          currentShare: 0,
          lastSeen: "15.03.2026",
          reason: "Внедрён онлайн-сервис выпуска ЭЦП без участия оператора",
        },
      ],
      connections: [
        {
          from: "Технический вопрос",
          to: "Эскалация",
          strength: 62,
          avgGap: "в том же звонке",
          insight: "Большая часть тех. вопросов всё ещё уходит на 2-ю линию. Закрепить эксперта на 1-й линии.",
        },
        {
          from: "Изменение условий",
          to: "Корпоративные счета",
          strength: 47,
          avgGap: "3–5 дней",
        },
      ],
    },
    benchmarks: {
      industry:
        "Средние показатели B2B контакт-центров — включая собственные КЦ компаний (открытые отраслевые исследования рынка, 2025)",
      items: [
        { metric: "Скорость ответа", unit: "сек", you: 22, median: 48, top10: 18, higherIsBetter: false, tooltip: "Среднее время ответа на звонок" },
        { metric: "Service Level", unit: "%", you: 92, median: 71, top10: 94, higherIsBetter: true, tooltip: "Доля звонков в пределах норматива" },
        { metric: "Доля брошенных", unit: "%", you: 4.8, median: 10.2, top10: 3.5, higherIsBetter: false, tooltip: "Доля звонков, на которые клиент не дождался ответа" },
        { metric: "Качество диалогов", unit: "/10", you: 8.2, median: 6.5, top10: 9.0, higherIsBetter: true, tooltip: "Средний балл по чек-листу качества обслуживания" },
      ],
    },
  },
  "chatbot": {
    period: "Май 2026, накоплено 6 месяцев данных",
    insights: [
      {
        severity: "high",
        title: "Тема «отмена заказа в чате» растёт +28% за 14 дней",
        body: "Доля обращений с темой «отмена заказа» в чате выросла с 6% до 8%. Большая часть связана с долгой обработкой заявок на отмену в личном кабинете.",
        suggestion: "Добавить кнопку «отменить заказ» в личный кабинет — снимет до 70% таких диалогов.",
      },
      {
        severity: "med",
        title: "Вечернее окно 20:00–23:00 даёт 38% дневного потока",
        body: "Клиенты заходят в чат с домашних устройств после работы. В это время голосовая линия (если есть) уже закрыта — нейроассистент покрывает «слепое окно».",
        suggestion: "Расширить FAQ по самым частым вечерним темам — статусы заказов, оплата, доставка.",
      },
      {
        severity: "low",
        title: "Новая тематика: «проверка совместимости товара»",
        body: "За последние 2 недели появилось 64 диалога на эту тему (4% от потока). Клиенты задают вопросы по совместимости аксессуаров и комплектующих перед покупкой.",
        suggestion: "Подключить product feed с характеристиками — нейроассистент сможет давать точные ответы и стимулировать продажи.",
      },
      {
        severity: "ok",
        title: "Доля эскалаций −2 п.п. за месяц",
        body: "С 14% до 12% — лучший результат с момента запуска. Модель дообучается на ваших темах и закрывает всё больше запросов самостоятельно.",
      },
    ],
    forecast: {
      points: [
        { month: "Дек 25", actual: 1850 },
        { month: "Янв 26", actual: 1720 },
        { month: "Фев 26", actual: 1580 },
        { month: "Мар 26", actual: 1640 },
        { month: "Апр 26", actual: 1720 },
        { month: "Май 26", actual: 1800 },
        { month: "Июн 26", forecast: 1950, low: 1850, high: 2050 },
        { month: "Июл 26", forecast: 1820, low: 1720, high: 1920 },
        { month: "Авг 26", forecast: 1700, low: 1600, high: 1800 },
        { month: "Сен 26", forecast: 2050, low: 1950, high: 2150 },
        { month: "Окт 26", forecast: 2250, low: 2100, high: 2400 },
        { month: "Ноя 26", forecast: 2750, low: 2550, high: 2950 },
      ],
      implications: [
        "С октября ожидается рост на 25% — стоит проверить, что база знаний нейроассистента покрывает все сезонные темы.",
        "В ноябре пиковая нагрузка (Чёрная пятница): +53% к среднему за полгода — нейроассистент выдержит без расширения, в отличие от голосовой линии.",
        "В июле–августе типичный объём — подходящее время для запуска новых сценариев и тематических FAQ.",
      ],
    },
    topics: {
      top: [
        {
          name: "Статус заказа",
          currentShare: 34,
          delta30d: "−1 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 35 },
            { month: "Янв", value: 36 },
            { month: "Фев", value: 35 },
            { month: "Мар", value: 34 },
            { month: "Апр", value: 35 },
            { month: "Май", value: 34 },
          ],
          insight: "Базовая нагрузка — стабильна. ИИ закрывает 95% таких диалогов автономно (через интеграцию с системой отслеживания).",
        },
        {
          name: "Возврат средств",
          currentShare: 20,
          delta30d: "+4 п.п. за 30 дней",
          trend: "up",
          history6m: [
            { month: "Дек", value: 11 },
            { month: "Янв", value: 13 },
            { month: "Фев", value: 15 },
            { month: "Мар", value: 17 },
            { month: "Апр", value: 16 },
            { month: "Май", value: 20 },
          ],
          insight: "Половина диалогов связана с задержкой возврата на карту > 7 дней. Сократить SLA до 5 дней.",
        },
        {
          name: "Технический вопрос",
          currentShare: 15,
          delta30d: "0 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 16 },
            { month: "Янв", value: 15 },
            { month: "Фев", value: 16 },
            { month: "Мар", value: 15 },
            { month: "Апр", value: 15 },
            { month: "Май", value: 15 },
          ],
          insight: "Основные эскалации происходят отсюда — сложные кейсы передаются операторам.",
        },
        {
          name: "Доставка",
          currentShare: 12,
          delta30d: "−2 п.п.",
          trend: "down",
          history6m: [
            { month: "Дек", value: 17 },
            { month: "Янв", value: 16 },
            { month: "Фев", value: 15 },
            { month: "Мар", value: 14 },
            { month: "Апр", value: 14 },
            { month: "Май", value: 12 },
          ],
          insight: "Снижение благодаря интеграции с трекингом — клиенты сразу видят статус, не доходя до чата.",
        },
        {
          name: "Оплата и счета",
          currentShare: 9,
          delta30d: "−1 п.п.",
          trend: "stable",
          history6m: [
            { month: "Дек", value: 10 },
            { month: "Янв", value: 10 },
            { month: "Фев", value: 9 },
            { month: "Мар", value: 10 },
            { month: "Апр", value: 10 },
            { month: "Май", value: 9 },
          ],
        },
      ],
      new: [
        {
          name: "Проверка совместимости товара",
          appearedAt: "10.05.2026",
          count: 64,
          share: 3.6,
          insight: "Новая тема — клиенты задают вопросы перед покупкой. Подключите product feed, чтобы ИИ отвечал автономно.",
        },
        {
          name: "Бонусные баллы",
          appearedAt: "05.05.2026",
          count: 32,
          share: 1.8,
        },
      ],
      lost: [
        {
          name: "Подтверждение по email",
          previousShare: 5,
          currentShare: 0,
          lastSeen: "20.03.2026",
          reason: "Внедрена авто-отправка письма — клиенты больше не пишут уточнения",
        },
      ],
      connections: [
        {
          from: "Статус заказа",
          to: "Возврат средств",
          strength: 38,
          avgGap: "5–8 дней",
          insight: "Часто после уточнения статуса (задержка) клиент приходит за возвратом. Прозрачный SLA по доставке снизит конверсию в возвраты.",
        },
        {
          from: "Технический вопрос",
          to: "Эскалация на оператора",
          strength: 71,
          avgGap: "в том же диалоге",
        },
      ],
    },
    benchmarks: {
      industry:
        "Средние показатели AI-чатов в eCommerce / ритейле — открытые отраслевые исследования рынка, 2025",
      items: [
        { metric: "Среднее время ответа", unit: "сек", you: 0.8, median: 3.5, top10: 0.5, higherIsBetter: false, tooltip: "Время до первого ответа нейроассистента" },
        { metric: "Доля автономной обработки", unit: "%", you: 88, median: 65, top10: 92, higherIsBetter: true, tooltip: "Доля диалогов, закрытых ИИ без передачи оператору" },
        { metric: "Доля эскалаций", unit: "%", you: 12, median: 35, top10: 8, higherIsBetter: false, tooltip: "Доля диалогов, переданных живому оператору" },
        { metric: "Среднее время диалога", unit: "сек", you: 90, median: 165, top10: 75, higherIsBetter: false, tooltip: "Средняя длительность одного диалога" },
      ],
    },
  },
};

export const serviceReports: Record<string, ServiceReport> = {
  "hotline-247": {
    period: "Май 2026",
    currentLabel: "Май 2026",
    previousLabel: "Апрель 2026",
    mtdCurrentLabel: "Июнь (1–4)",
    mtdPreviousLabel: "Май (1–4)",
    mtdDayCount: 4,
    // KPI-блок показывает текущий месяц (Июнь, MTD) — оперативная картина
    kpisCurrentMonthLabel: "Июнь 2026 (с 1 по 4)",
    kpisByPeriod: {
      today: {
        rangeLabel: "Сегодня · 4 июня 2026",
        compareLabel: "к 3 июня",
        kpis: [
          { label: "Входящие", value: "78", delta: "−7%", tone: "neutral" },
          { label: "Принято", value: "68", delta: "−8%", tone: "neutral" },
          { label: "Пропущено", value: "10", delta: "+0%", tone: "neutral" },
          { label: "Service Level", value: "95/20", delta: "−1 п.п.", tone: "neutral" },
          { label: "Ср. ответ (ASA)", value: "16 сек", delta: "+2 сек", tone: "neutral" },
          { label: "Ср. обработка (AHT)", value: "2 мин 15 сек", delta: "+3 сек", tone: "neutral" },
        ],
        transfers: {
          total: 11,
          pctOfIncoming: 14.1,
          deltaLabel: "−8%",
          deltaTone: "ok",
          destinations: [
            { name: "Отдел продаж", count: 4, pct: 36 },
            { name: "Техническая поддержка", count: 3, pct: 27 },
            { name: "Бухгалтерия и финансы", count: 2, pct: 18 },
            { name: "Юридический отдел", count: 1, pct: 9 },
            { name: "Руководитель проекта", count: 1, pct: 10 },
          ],
        },
      },
      yesterday: {
        rangeLabel: "Вчера · 3 июня 2026",
        compareLabel: "к 2 июня",
        kpis: [
          { label: "Входящие", value: "84", delta: "+5%", tone: "up" },
          { label: "Принято", value: "74", delta: "+8%", tone: "up" },
          { label: "Пропущено", value: "10", delta: "−17%", tone: "ok" },
          { label: "Service Level", value: "96/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "14 сек", delta: "−2 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "2 мин 12 сек", delta: "−1 сек", tone: "ok" },
        ],
        transfers: {
          total: 12,
          pctOfIncoming: 14.3,
          deltaLabel: "−15%",
          deltaTone: "ok",
          destinations: [
            { name: "Отдел продаж", count: 5, pct: 42 },
            { name: "Техническая поддержка", count: 3, pct: 25 },
            { name: "Бухгалтерия и финансы", count: 2, pct: 17 },
            { name: "Юридический отдел", count: 1, pct: 8 },
            { name: "Руководитель проекта", count: 1, pct: 8 },
          ],
        },
      },
      week: {
        rangeLabel: "Неделя · 29 мая – 4 июня",
        compareLabel: "к 22–28 мая",
        kpis: [
          { label: "Входящие", value: "568", delta: "+4%", tone: "up" },
          { label: "Принято", value: "498", delta: "+6%", tone: "up" },
          { label: "Пропущено", value: "70", delta: "−9%", tone: "ok" },
          { label: "Service Level", value: "96/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "14 сек", delta: "−2 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "2 мин 13 сек", delta: "−1 сек", tone: "ok" },
        ],
        transfers: {
          total: 80,
          pctOfIncoming: 14.1,
          deltaLabel: "−6%",
          deltaTone: "ok",
          destinations: [
            { name: "Отдел продаж", count: 31, pct: 39 },
            { name: "Техническая поддержка", count: 22, pct: 28 },
            { name: "Бухгалтерия и финансы", count: 12, pct: 15 },
            { name: "Юридический отдел", count: 9, pct: 11 },
            { name: "Руководитель проекта", count: 4, pct: 5 },
            { name: "Прочее", count: 2, pct: 2 },
          ],
        },
      },
      month: {
        rangeLabel: "Июнь 2026 (с 1 по 4)",
        compareLabel: "к маю 1–4",
        kpis: [
          { label: "Входящие", value: "326", delta: "+6%", tone: "up" },
          { label: "Принято", value: "286", delta: "+9%", tone: "up" },
          { label: "Пропущено", value: "40", delta: "−14%", tone: "ok" },
          { label: "Service Level", value: "96/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "14 сек", delta: "−2 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "2 мин 13 сек", delta: "−1 сек", tone: "ok" },
        ],
        transfers: {
          total: 46,
          pctOfIncoming: 14.1,
          deltaLabel: "−10%",
          deltaTone: "ok",
          destinations: [
            { name: "Отдел продаж", count: 18, pct: 39 },
            { name: "Техническая поддержка", count: 13, pct: 28 },
            { name: "Бухгалтерия и финансы", count: 7, pct: 15 },
            { name: "Юридический отдел", count: 5, pct: 11 },
            { name: "Руководитель проекта", count: 2, pct: 4 },
            { name: "Прочее", count: 1, pct: 3 },
          ],
        },
      },
      custom: {
        rangeLabel: "15 апреля – 15 мая 2026",
        compareLabel: "к 15 мар – 15 апр",
        kpis: [
          { label: "Входящие", value: "2 380", delta: "+11%", tone: "up" },
          { label: "Принято", value: "2 062", delta: "+14%", tone: "up" },
          { label: "Пропущено", value: "318", delta: "−6%", tone: "ok" },
          { label: "Service Level", value: "96/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "16 сек", delta: "−6 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "2 мин 14 сек", delta: "+1 сек", tone: "neutral" },
        ],
        transfers: {
          total: 332,
          pctOfIncoming: 13.9,
          deltaLabel: "−9%",
          deltaTone: "ok",
          destinations: [
            { name: "Отдел продаж", count: 128, pct: 39 },
            { name: "Техническая поддержка", count: 92, pct: 28 },
            { name: "Бухгалтерия и финансы", count: 50, pct: 15 },
            { name: "Юридический отдел", count: 35, pct: 11 },
            { name: "Руководитель проекта", count: 17, pct: 5 },
            { name: "Прочее", count: 10, pct: 3 },
          ],
        },
      },
    },
    kpis: [
      { label: "Входящие", value: "326", delta: "+6%", tone: "up" },
      { label: "Принято", value: "286", delta: "+9%", tone: "up" },
      { label: "Пропущено", value: "40", delta: "−14%", tone: "ok" },
      { label: "Service Level", value: "96/20", delta: "+1 п.п.", tone: "up" },
      { label: "Ср. ответ (ASA)", value: "14 сек", delta: "−2 сек", tone: "ok" },
      { label: "Ср. обработка (AHT)", value: "2 мин 13 сек", delta: "−1 сек", tone: "ok" },
    ],
    yearlyReports: {
      "2026": {
        rows: [
          { metric: "Входящие",      values: ["2 576", "2 380", "2 440", "2 144", "2 576", null, null, null, null, null, null, null] },
          { metric: "Принятые",      values: ["2 200", "2 040", "2 080", "1 798", "2 250", null, null, null, null, null, null, null] },
          { metric: "Пропущенные",   values: ["376", "340", "360", "346", "326", null, null, null, null, null, null, null] },
          { metric: "Доля пропущенных",            values: ["14.6%", "14.3%", "14.8%", "16.1%", "12.7%", null, null, null, null, null, null, null] },
          { metric: "Service Level", values: ["96/20", "96/20", "95/20", "95/20", "97/20", null, null, null, null, null, null, null] },
          { metric: "Среднее время ответа",           values: ["18 сек", "20 сек", "25 сек", "37 сек", "13 сек", null, null, null, null, null, null, null] },
          { metric: "Длительность разговоров, мин", values: ["7 700", "7 170", "7 350", "6 350", "8 030", null, null, null, null, null, null, null] },
          { metric: "Среднее время разговора",           values: ["3:30", "3:31", "3:32", "3:32", "3:34", null, null, null, null, null, null, null] },
          { metric: "Переведённые",  values: ["340", "330", "360", "459", "364", null, null, null, null, null, null, null] },
        ],
        insight: "За первые 5 месяцев принято 10 368 обращений — на 12% больше января-мая 2025. Общий объём разговоров — около 36 300 минут (среднее время разговора 3:32). Максимум потока пришёлся на январь и май.",
      },
      "2025": {
        rows: [
          { metric: "Входящие",      values: ["2 200", "2 050", "2 300", "2 100", "2 200", "2 050", "1 980", "2 020", "2 240", "2 480", "3 240", "3 180"] },
          { metric: "Принятые",      values: ["1 900", "1 780", "1 980", "1 800", "1 880", "1 805", "1 742", "1 800", "1 970", "2 160", "2 770", "2 720"] },
          { metric: "Пропущенные",   values: ["300", "270", "320", "300", "320", "245", "238", "220", "270", "320", "470", "460"] },
          { metric: "Доля пропущенных",            values: ["13.6%", "13.2%", "13.9%", "14.3%", "14.5%", "12.0%", "12.0%", "10.9%", "12.1%", "12.9%", "14.5%", "14.5%"] },
          { metric: "Service Level", values: ["94/20", "95/20", "95/20", "94/20", "94/20", "96/20", "96/20", "97/20", "96/20", "95/20", "93/20", "93/20"] },
          { metric: "Среднее время ответа",           values: ["22 сек", "20 сек", "21 сек", "24 сек", "25 сек", "18 сек", "18 сек", "16 сек", "19 сек", "22 сек", "30 сек", "32 сек"] },
          { metric: "Длительность разговоров, мин", values: ["6 590", "6 140", "6 900", "6 300", "6 520", "6 200", "5 950", "6 120", "6 800", "7 520", "9 930", "9 660"] },
          { metric: "Среднее время разговора",           values: ["3:28", "3:27", "3:29", "3:30", "3:28", "3:26", "3:25", "3:24", "3:27", "3:29", "3:35", "3:33"] },
          { metric: "Переведённые",  values: ["310", "290", "330", "320", "340", "280", "265", "240", "300", "380", "560", "540"] },
        ],
        insight: "Год активного роста: принято 26 425 обращений (+35% к 2024). Общий объём разговоров — около 93 200 минут. Пиковые месяцы — ноябрь (Чёрная пятница, 3 240 поступивших) и декабрь (новогодний всплеск).",
      },
      "2024": {
        rows: [
          { metric: "Входящие",      values: ["1 580", "1 480", "1 620", "1 540", "1 720", "1 650", "1 580", "1 620", "1 800", "2 050", "2 680", "2 580"] },
          { metric: "Принятые",      values: ["1 340", "1 270", "1 380", "1 320", "1 470", "1 410", "1 350", "1 380", "1 540", "1 750", "2 240", "2 180"] },
          { metric: "Пропущенные",   values: ["240", "210", "240", "220", "250", "240", "230", "240", "260", "300", "440", "400"] },
          { metric: "Доля пропущенных",            values: ["15.2%", "14.2%", "14.8%", "14.3%", "14.5%", "14.5%", "14.6%", "14.8%", "14.4%", "14.6%", "16.4%", "15.5%"] },
          { metric: "Service Level", values: ["91/20", "92/20", "92/20", "91/20", "91/20", "92/20", "92/20", "93/20", "92/20", "91/20", "89/20", "90/20"] },
          { metric: "Среднее время ответа",           values: ["30 сек", "28 сек", "29 сек", "32 сек", "31 сек", "26 сек", "26 сек", "24 сек", "27 сек", "32 сек", "42 сек", "40 сек"] },
          { metric: "Длительность разговоров, мин", values: ["4 510", "4 260", "4 650", "4 490", "4 970", "4 700", "4 460", "4 550", "5 160", "5 920", "7 840", "7 560"] },
          { metric: "Среднее время разговора",           values: ["3:22", "3:21", "3:22", "3:24", "3:23", "3:20", "3:18", "3:18", "3:21", "3:23", "3:30", "3:28"] },
          { metric: "Переведённые",  values: ["240", "220", "250", "240", "270", "210", "200", "190", "240", "300", "440", "420"] },
        ],
        insight: "Базовый год сотрудничества: принято 19 870 обращений, общий объём разговоров около 67 500 минут. Сезонность характерна для eCommerce — пик в Q4 (Чёрная пятница + новогодний период), летний минимум в феврале.",
      },
    },
    monthlyDynamics12: [
      { month: "Июн 25", incoming: 2050, answered: 1805, abandoned: 245 },
      { month: "Июл 25", incoming: 1980, answered: 1742, abandoned: 238 },
      { month: "Авг 25", incoming: 2020, answered: 1800, abandoned: 220 },
      { month: "Сен 25", incoming: 2240, answered: 1970, abandoned: 270 },
      { month: "Окт 25", incoming: 2480, answered: 2160, abandoned: 320 },
      { month: "Ноя 25", incoming: 3240, answered: 2770, abandoned: 470 },
      { month: "Дек 25", incoming: 3180, answered: 2720, abandoned: 460 },
      { month: "Янв 26", incoming: 2576, answered: 2200, abandoned: 376 },
      { month: "Фев 26", incoming: 2380, answered: 2040, abandoned: 340 },
      { month: "Мар 26", incoming: 2440, answered: 2080, abandoned: 360 },
      { month: "Апр 26", incoming: 2144, answered: 1798, abandoned: 346 },
      // Текущий месяц — точка-стык: actual + forecast одинаковы
      {
        month: "Май 26",
        incoming: 2576,
        answered: 2250,
        abandoned: 326,
        forecastIncoming: 2576,
        forecastAnswered: 2250,
        forecastAbandoned: 326,
      },
      { month: "Июн 26", forecastIncoming: 2800, forecastAnswered: 2440, forecastAbandoned: 360 },
      { month: "Июл 26", forecastIncoming: 2600, forecastAnswered: 2260, forecastAbandoned: 340 },
    ],
    operatorStats: [
      { name: "Сенк Мария", operatorId: "4293", callCount: 52, pctOfTotal: 18.2, totalTalkSec: 7124, avgTalkSec: 137 },
      { name: "Бердик Татьяна", operatorId: "6613", callCount: 49, pctOfTotal: 17.1, totalTalkSec: 6566, avgTalkSec: 134 },
      { name: "Горянова Наталья", operatorId: "7299", callCount: 44, pctOfTotal: 15.4, totalTalkSec: 5720, avgTalkSec: 130 },
      { name: "Залевская Татьяна", operatorId: "4051", callCount: 41, pctOfTotal: 14.3, totalTalkSec: 5412, avgTalkSec: 132 },
      { name: "Соколова Анна", operatorId: "4128", callCount: 39, pctOfTotal: 13.6, totalTalkSec: 5382, avgTalkSec: 138 },
      { name: "Белов Денис", operatorId: "5034", callCount: 36, pctOfTotal: 12.6, totalTalkSec: 4608, avgTalkSec: 128 },
      { name: "Кузнецов Евгений", operatorId: "6201", callCount: 25, pctOfTotal: 8.8, totalTalkSec: 3625, avgTalkSec: 145 },
    ],
    operatorStatsByPeriod: {
      today: [
        { name: "Сенк Мария", operatorId: "4293", callCount: 13, pctOfTotal: 19.1, totalTalkSec: 1781, avgTalkSec: 137 },
        { name: "Бердик Татьяна", operatorId: "6613", callCount: 12, pctOfTotal: 17.6, totalTalkSec: 1608, avgTalkSec: 134 },
        { name: "Горянова Наталья", operatorId: "7299", callCount: 10, pctOfTotal: 14.7, totalTalkSec: 1300, avgTalkSec: 130 },
        { name: "Залевская Татьяна", operatorId: "4051", callCount: 10, pctOfTotal: 14.7, totalTalkSec: 1320, avgTalkSec: 132 },
        { name: "Соколова Анна", operatorId: "4128", callCount: 9, pctOfTotal: 13.2, totalTalkSec: 1242, avgTalkSec: 138 },
        { name: "Белов Денис", operatorId: "5034", callCount: 9, pctOfTotal: 13.2, totalTalkSec: 1152, avgTalkSec: 128 },
        { name: "Кузнецов Евгений", operatorId: "6201", callCount: 5, pctOfTotal: 7.5, totalTalkSec: 725, avgTalkSec: 145 },
      ],
      yesterday: [
        { name: "Сенк Мария", operatorId: "4293", callCount: 14, pctOfTotal: 18.9, totalTalkSec: 1918, avgTalkSec: 137 },
        { name: "Бердик Татьяна", operatorId: "6613", callCount: 13, pctOfTotal: 17.6, totalTalkSec: 1742, avgTalkSec: 134 },
        { name: "Горянова Наталья", operatorId: "7299", callCount: 11, pctOfTotal: 14.9, totalTalkSec: 1430, avgTalkSec: 130 },
        { name: "Залевская Татьяна", operatorId: "4051", callCount: 11, pctOfTotal: 14.9, totalTalkSec: 1452, avgTalkSec: 132 },
        { name: "Соколова Анна", operatorId: "4128", callCount: 10, pctOfTotal: 13.5, totalTalkSec: 1380, avgTalkSec: 138 },
        { name: "Белов Денис", operatorId: "5034", callCount: 9, pctOfTotal: 12.2, totalTalkSec: 1152, avgTalkSec: 128 },
        { name: "Кузнецов Евгений", operatorId: "6201", callCount: 6, pctOfTotal: 8.1, totalTalkSec: 870, avgTalkSec: 145 },
      ],
      week: [
        { name: "Сенк Мария", operatorId: "4293", callCount: 91, pctOfTotal: 18.3, totalTalkSec: 12467, avgTalkSec: 137 },
        { name: "Бердик Татьяна", operatorId: "6613", callCount: 86, pctOfTotal: 17.3, totalTalkSec: 11524, avgTalkSec: 134 },
        { name: "Горянова Наталья", operatorId: "7299", callCount: 77, pctOfTotal: 15.5, totalTalkSec: 10010, avgTalkSec: 130 },
        { name: "Залевская Татьяна", operatorId: "4051", callCount: 71, pctOfTotal: 14.3, totalTalkSec: 9372, avgTalkSec: 132 },
        { name: "Соколова Анна", operatorId: "4128", callCount: 68, pctOfTotal: 13.7, totalTalkSec: 9384, avgTalkSec: 138 },
        { name: "Белов Денис", operatorId: "5034", callCount: 63, pctOfTotal: 12.7, totalTalkSec: 8064, avgTalkSec: 128 },
        { name: "Кузнецов Евгений", operatorId: "6201", callCount: 42, pctOfTotal: 8.4, totalTalkSec: 6090, avgTalkSec: 145 },
      ],
      month: [
        { name: "Сенк Мария", operatorId: "4293", callCount: 52, pctOfTotal: 18.2, totalTalkSec: 7124, avgTalkSec: 137 },
        { name: "Бердик Татьяна", operatorId: "6613", callCount: 49, pctOfTotal: 17.1, totalTalkSec: 6566, avgTalkSec: 134 },
        { name: "Горянова Наталья", operatorId: "7299", callCount: 44, pctOfTotal: 15.4, totalTalkSec: 5720, avgTalkSec: 130 },
        { name: "Залевская Татьяна", operatorId: "4051", callCount: 41, pctOfTotal: 14.3, totalTalkSec: 5412, avgTalkSec: 132 },
        { name: "Соколова Анна", operatorId: "4128", callCount: 39, pctOfTotal: 13.6, totalTalkSec: 5382, avgTalkSec: 138 },
        { name: "Белов Денис", operatorId: "5034", callCount: 36, pctOfTotal: 12.6, totalTalkSec: 4608, avgTalkSec: 128 },
        { name: "Кузнецов Евгений", operatorId: "6201", callCount: 25, pctOfTotal: 8.8, totalTalkSec: 3625, avgTalkSec: 145 },
      ],
      custom: [
        { name: "Сенк Мария", operatorId: "4293", callCount: 378, pctOfTotal: 18.3, totalTalkSec: 51786, avgTalkSec: 137 },
        { name: "Бердик Татьяна", operatorId: "6613", callCount: 355, pctOfTotal: 17.2, totalTalkSec: 47570, avgTalkSec: 134 },
        { name: "Горянова Наталья", operatorId: "7299", callCount: 320, pctOfTotal: 15.5, totalTalkSec: 41600, avgTalkSec: 130 },
        { name: "Залевская Татьяна", operatorId: "4051", callCount: 295, pctOfTotal: 14.3, totalTalkSec: 38940, avgTalkSec: 132 },
        { name: "Соколова Анна", operatorId: "4128", callCount: 280, pctOfTotal: 13.6, totalTalkSec: 38640, avgTalkSec: 138 },
        { name: "Белов Денис", operatorId: "5034", callCount: 262, pctOfTotal: 12.7, totalTalkSec: 33536, avgTalkSec: 128 },
        { name: "Кузнецов Евгений", operatorId: "6201", callCount: 172, pctOfTotal: 8.3, totalTalkSec: 24940, avgTalkSec: 145 },
      ],
    },
    transfers: {
      total: 46,
      pctOfIncoming: 14.1,
      deltaLabel: "−10%",
      deltaTone: "ok",
      destinations: [
        { name: "Отдел продаж", count: 18, pct: 39 },
        { name: "Техническая поддержка", count: 13, pct: 28 },
        { name: "Бухгалтерия и финансы", count: 7, pct: 15 },
        { name: "Юридический отдел", count: 5, pct: 11 },
        { name: "Руководитель проекта", count: 2, pct: 4 },
        { name: "Прочее", count: 1, pct: 3 },
      ],
    },
    insight:
      "В мае принято 2 250 обращений — на 25% больше апреля. Service Level держится в пределах норматива: 97/20 при цели по договору 80/20. Команда стабильно справляется с растущим потоком.",
    dynamics: [
      { date: "01.05", incoming: 92, answered: 81, abandoned: 11 },
      { date: "02.05", incoming: 78, answered: 70, abandoned: 8 },
      { date: "03.05", incoming: 71, answered: 64, abandoned: 7 },
      { date: "04.05", incoming: 88, answered: 79, abandoned: 9 },
      { date: "05.05", incoming: 94, answered: 84, abandoned: 10 },
      { date: "06.05", incoming: 102, answered: 91, abandoned: 11 },
      { date: "07.05", incoming: 96, answered: 86, abandoned: 10 },
      { date: "08.05", incoming: 89, answered: 80, abandoned: 9 },
      { date: "09.05", incoming: 83, answered: 75, abandoned: 8 },
      { date: "10.05", incoming: 76, answered: 69, abandoned: 7 },
      { date: "11.05", incoming: 91, answered: 82, abandoned: 9 },
      { date: "12.05", incoming: 87, answered: 78, abandoned: 9 },
      { date: "13.05", incoming: 105, answered: 92, abandoned: 13 },
      { date: "14.05", incoming: 124, answered: 99, abandoned: 25 },
      { date: "15.05", incoming: 98, answered: 89, abandoned: 9 },
      { date: "16.05", incoming: 84, answered: 76, abandoned: 8 },
      { date: "17.05", incoming: 79, answered: 72, abandoned: 7 },
      { date: "18.05", incoming: 88, answered: 80, abandoned: 8 },
      { date: "19.05", incoming: 92, answered: 84, abandoned: 8 },
      { date: "20.05", incoming: 95, answered: 86, abandoned: 9 },
      { date: "21.05", incoming: 87, answered: 79, abandoned: 8 },
      { date: "22.05", incoming: 83, answered: 75, abandoned: 8 },
      { date: "23.05", incoming: 78, answered: 71, abandoned: 7 },
      { date: "24.05", incoming: 72, answered: 65, abandoned: 7 },
      { date: "25.05", incoming: 86, answered: 78, abandoned: 8 },
      { date: "26.05", incoming: 91, answered: 83, abandoned: 8 },
      { date: "27.05", incoming: 89, answered: 81, abandoned: 8 },
      { date: "28.05", incoming: 94, answered: 86, abandoned: 8 },
      { date: "29.05", incoming: 88, answered: 80, abandoned: 8 },
      { date: "30.05", incoming: 81, answered: 74, abandoned: 7 },
    ],
    // Закрытые месяцы: Май vs Апрель (значения по умолчанию, безопасное сравнение)
    monthOverMonth: [
      { metric: "Входящие", prev: "2 144", current: "2 576", delta: "+20%", tone: "up" },
      { metric: "Принятые", prev: "1 798", current: "2 250", delta: "+25%", tone: "up" },
      { metric: "Пропущенные", prev: "346", current: "326", delta: "−6%", tone: "ok" },
      { metric: "Доля пропущенных", prev: "16.1%", current: "12.7%", delta: "−3.4 п.п.", tone: "ok" },
      { metric: "Service Level", prev: "95/20", current: "97/20", delta: "+2 п.п.", tone: "up" },
      { metric: "Среднее время ответа", prev: "37 сек", current: "13 сек", delta: "−24 сек", tone: "ok" },
      { metric: "Длительность разговоров, мин", prev: "6 350", current: "8 030", delta: "+26%", tone: "up" },
      { metric: "Среднее время разговора", prev: "3:32", current: "3:34", delta: "+2 сек", tone: "neutral" },
      { metric: "Переведённые", prev: "459", current: "364", delta: "−21%", tone: "neutral" },
    ],
    // MTD: Июнь (1–5) vs Май (1–5) — сравнение текущего MTD с тем же окном прошлого месяца
    monthOverMonthMtd: [
      { metric: "Входящие", prev: "415", current: "467", delta: "+12.5%", tone: "up" },
      { metric: "Принятые", prev: "365", current: "410", delta: "+12.3%", tone: "up" },
      { metric: "Пропущенные", prev: "50", current: "57", delta: "+14%", tone: "warn" },
      { metric: "Доля пропущенных", prev: "12.0%", current: "12.2%", delta: "+0.2 п.п.", tone: "neutral" },
      { metric: "Service Level", prev: "97/20", current: "96/20", delta: "−1 п.п.", tone: "neutral" },
      { metric: "Среднее время ответа", prev: "13 сек", current: "14 сек", delta: "+1 сек", tone: "neutral" },
      { metric: "Длительность разговоров, мин", prev: "1 300", current: "1 470", delta: "+13%", tone: "up" },
      { metric: "Среднее время разговора", prev: "3:34", current: "3:35", delta: "+1 сек", tone: "neutral" },
      { metric: "Переведённые", prev: "60", current: "70", delta: "+17%", tone: "neutral" },
    ],
    distribution: [
      { name: "Обработанные", value: 2250, color: "#7CB342" },
      { name: "Пропущенные", value: 326, color: "#F59E0B" },
      { name: "Перевод/перезвон", value: 364, color: "#0EA5E9" },
    ],
    heatmap: {
      days: DAYS_7,
      hours: HOURS_24,
      data: makeHeat247(),
    },
    forecast: [
      {
        label: "Прогноз потока",
        value: "2 650 – 2 850",
        note: "обычный сезонный рост к лету: +5–10% к маю",
        tone: "neutral",
      },
      {
        label: "Рабочих дней в месяце",
        value: "21",
        note: "на 2 дня больше мая — ожидается соответствующий прирост обращений",
        tone: "neutral",
      },
      {
        label: "Пик нагрузки",
        value: "10:00 – 13:00",
        note: "8–9% дневного потока приходится на эти часы",
        tone: "neutral",
      },
      {
        label: "Самый загруженный день недели",
        value: "Понедельник",
        note: "ваши клиенты больше всего звонят в понедельник, +18% к среднему",
        tone: "neutral",
      },
    ],
    recommendations: [
      {
        title: "Тематическая исходящая кампания к 14 февраля",
        body: "У eCommerce-клиентов нашей отрасли за 2 недели до Дня Святого Валентина обращения по теме «подарок близким» растут на 35–50%. Запуск тематической исходящей по базе с напоминанием даёт типичную конверсию 8–12% от активных контактов. Можем подготовить скрипт и команду за 5 рабочих дней.",
        effect: "+250–400 продаж за акцию",
      },
      {
        title: "Авто-уведомления при технических сбоях",
        body: "18 мая зафиксирован аномальный всплеск — поток вырос в 2.5 раза за 90 минут, преобладали темы «не работает оплата» и «не открывается сайт». Это типичный признак инцидента на стороне сайта. Интеграция мониторинга с авто-баннером и SMS снизит звонки в такие дни и сохранит NPS.",
        effect: "−40–60% звонков в дни инцидентов, рост лояльности",
      },
      {
        title: "Подготовка к сезонному росту — пакет на вырост",
        body: "Историческая динамика показывает рост в марте на 20–30%. Если ожидаете похожий рост — заранее перейдите на пакет 35 000 минут. По прошлым клиентам видим, что переход «после факта» обходится дороже и тяжелее для линии.",
        effect: "переход на пакет 35 000 мин — 693 000 ₽/мес",
      },
    ],
  },
  "hotline-fte": {
    period: "Май 2026",
    currentLabel: "Май 2026",
    previousLabel: "Апрель 2026",
    mtdCurrentLabel: "Июнь (1–4)",
    mtdPreviousLabel: "Май (1–4)",
    mtdDayCount: 4,
    // KPI-блок показывает текущий месяц (Июнь, MTD) — оперативная картина
    kpisCurrentMonthLabel: "Июнь 2026 (с 1 по 4)",
    kpisByPeriod: {
      today: {
        rangeLabel: "Сегодня · 4 июня 2026",
        compareLabel: "к 3 июня",
        kpis: [
          { label: "Входящие", value: "46", delta: "−6%", tone: "neutral" },
          { label: "Принято", value: "43", delta: "−4%", tone: "neutral" },
          { label: "Пропущено", value: "3", delta: "−25%", tone: "ok" },
          { label: "Service Level", value: "93/20", delta: "+0 п.п.", tone: "neutral" },
          { label: "Ср. ответ (ASA)", value: "22 сек", delta: "+1 сек", tone: "neutral" },
          { label: "Ср. обработка (AHT)", value: "3 мин 02 сек", delta: "+1 сек", tone: "neutral" },
        ],
        transfers: {
          total: 6,
          pctOfIncoming: 13.0,
          deltaLabel: "−14%",
          deltaTone: "ok",
          destinations: [
            { name: "Корпоративный отдел", count: 3, pct: 50 },
            { name: "Техническая поддержка", count: 2, pct: 33 },
            { name: "Бухгалтерия", count: 1, pct: 17 },
          ],
        },
      },
      yesterday: {
        rangeLabel: "Вчера · 3 июня 2026",
        compareLabel: "к 2 июня",
        kpis: [
          { label: "Входящие", value: "49", delta: "+4%", tone: "up" },
          { label: "Принято", value: "45", delta: "+7%", tone: "up" },
          { label: "Пропущено", value: "4", delta: "−20%", tone: "ok" },
          { label: "Service Level", value: "94/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "20 сек", delta: "−2 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "3 мин 00 сек", delta: "−2 сек", tone: "ok" },
        ],
        transfers: {
          total: 7,
          pctOfIncoming: 14.3,
          deltaLabel: "−12%",
          deltaTone: "ok",
          destinations: [
            { name: "Корпоративный отдел", count: 3, pct: 43 },
            { name: "Техническая поддержка", count: 2, pct: 29 },
            { name: "Бухгалтерия", count: 1, pct: 14 },
            { name: "Руководитель проекта", count: 1, pct: 14 },
          ],
        },
      },
      week: {
        rangeLabel: "Неделя · 29 мая – 4 июня",
        compareLabel: "к 22–28 мая",
        kpis: [
          { label: "Входящие", value: "330", delta: "+3%", tone: "up" },
          { label: "Принято", value: "306", delta: "+5%", tone: "up" },
          { label: "Пропущено", value: "24", delta: "−12%", tone: "ok" },
          { label: "Service Level", value: "93/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "21 сек", delta: "−1 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "3 мин 01 сек", delta: "−1 сек", tone: "ok" },
        ],
        transfers: {
          total: 42,
          pctOfIncoming: 12.7,
          deltaLabel: "−7%",
          deltaTone: "ok",
          destinations: [
            { name: "Корпоративный отдел", count: 19, pct: 45 },
            { name: "Техническая поддержка", count: 11, pct: 26 },
            { name: "Бухгалтерия", count: 7, pct: 17 },
            { name: "Руководитель проекта", count: 3, pct: 7 },
            { name: "Прочее", count: 2, pct: 5 },
          ],
        },
      },
      month: {
        rangeLabel: "Июнь 2026 (с 1 по 4)",
        compareLabel: "к маю 1–4",
        kpis: [
          { label: "Входящие", value: "188", delta: "+4%", tone: "up" },
          { label: "Принято", value: "174", delta: "+6%", tone: "up" },
          { label: "Пропущено", value: "14", delta: "−13%", tone: "ok" },
          { label: "Service Level", value: "93/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "21 сек", delta: "−1 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "3 мин 01 сек", delta: "−1 сек", tone: "ok" },
        ],
        transfers: {
          total: 24,
          pctOfIncoming: 12.8,
          deltaLabel: "−4%",
          deltaTone: "ok",
          destinations: [
            { name: "Корпоративный отдел", count: 11, pct: 46 },
            { name: "Техническая поддержка", count: 6, pct: 25 },
            { name: "Бухгалтерия", count: 4, pct: 17 },
            { name: "Руководитель проекта", count: 2, pct: 8 },
            { name: "Прочее", count: 1, pct: 4 },
          ],
        },
      },
      custom: {
        rangeLabel: "15 апреля – 15 мая 2026",
        compareLabel: "к 15 мар – 15 апр",
        kpis: [
          { label: "Входящие", value: "1 420", delta: "+8%", tone: "up" },
          { label: "Принято", value: "1 308", delta: "+11%", tone: "up" },
          { label: "Пропущено", value: "112", delta: "−10%", tone: "ok" },
          { label: "Service Level", value: "92/20", delta: "+1 п.п.", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "23 сек", delta: "−2 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "3 мин 02 сек", delta: "+1 сек", tone: "neutral" },
        ],
        transfers: {
          total: 180,
          pctOfIncoming: 12.7,
          deltaLabel: "−6%",
          deltaTone: "ok",
          destinations: [
            { name: "Корпоративный отдел", count: 80, pct: 44 },
            { name: "Техническая поддержка", count: 46, pct: 26 },
            { name: "Бухгалтерия", count: 30, pct: 17 },
            { name: "Руководитель проекта", count: 16, pct: 9 },
            { name: "Прочее", count: 8, pct: 4 },
          ],
        },
      },
    },
    kpis: [
      { label: "Входящие", value: "188", delta: "+4%", tone: "up" },
      { label: "Принято", value: "174", delta: "+6%", tone: "up" },
      { label: "Пропущено", value: "14", delta: "−13%", tone: "ok" },
      { label: "Service Level", value: "93/20", delta: "+1 п.п.", tone: "up" },
      { label: "Ср. ответ (ASA)", value: "21 сек", delta: "−1 сек", tone: "ok" },
      { label: "Ср. обработка (AHT)", value: "3 мин 01 сек", delta: "−1 сек", tone: "ok" },
    ],
    yearlyReports: {
      "2026": {
        rows: [
          { metric: "Входящие",      values: ["1 350", "1 290", "1 370", "1 370", "1 480", null, null, null, null, null, null, null] },
          { metric: "Принятые",      values: ["1 240", "1 180", "1 250", "1 230", "1 362", null, null, null, null, null, null, null] },
          { metric: "Пропущенные",   values: ["110", "110", "120", "140", "118", null, null, null, null, null, null, null] },
          { metric: "Доля пропущенных",            values: ["8.1%", "8.5%", "8.8%", "10.2%", "8.0%", null, null, null, null, null, null, null] },
          { metric: "Service Level", values: ["91/20", "91/20", "92/20", "90/20", "92/20", null, null, null, null, null, null, null] },
          { metric: "Среднее время ответа",           values: ["24 сек", "23 сек", "25 сек", "27 сек", "22 сек", null, null, null, null, null, null, null] },
          { metric: "Длительность разговоров, мин", values: ["3 720", "3 560", "3 790", "3 790", "4 130", null, null, null, null, null, null, null] },
          { metric: "Среднее время разговора",           values: ["3:00", "3:01", "3:02", "3:05", "3:02", null, null, null, null, null, null, null] },
        ],
        insight: "За первые 5 месяцев — 6 262 обращения принято. Общий объём разговоров около 18 900 минут (среднее 3:02 на обращение). Максимум потока в мае.",
      },
      "2025": {
        rows: [
          { metric: "Входящие",      values: ["1 150", "1 080", "1 200", "1 130", "1 220", "1 180", "1 120", "1 150", "1 280", "1 410", "1 580", "1 520"] },
          { metric: "Принятые",      values: ["1 060", "1 000", "1 110", "1 040", "1 130", "1 100", "1 040", "1 070", "1 180", "1 290", "1 430", "1 380"] },
          { metric: "Пропущенные",   values: ["90", "80", "90", "90", "90", "80", "80", "80", "100", "120", "150", "140"] },
          { metric: "Доля пропущенных",            values: ["7.8%", "7.4%", "7.5%", "8.0%", "7.4%", "6.8%", "7.1%", "7.0%", "7.8%", "8.5%", "9.5%", "9.2%"] },
          { metric: "Service Level", values: ["92/20", "93/20", "93/20", "92/20", "92/20", "93/20", "93/20", "94/20", "92/20", "91/20", "90/20", "90/20"] },
          { metric: "Среднее время ответа",           values: ["22 сек", "21 сек", "22 сек", "24 сек", "23 сек", "20 сек", "20 сек", "19 сек", "23 сек", "26 сек", "28 сек", "27 сек"] },
          { metric: "Длительность разговоров, мин", values: ["3 180", "2 970", "3 330", "3 140", "3 370", "3 260", "3 070", "3 160", "3 520", "3 870", "4 360", "4 160"] },
          { metric: "Среднее время разговора",           values: ["3:00", "2:58", "3:00", "3:01", "2:59", "2:58", "2:57", "2:57", "2:59", "3:00", "3:03", "3:01"] },
        ],
        insight: "Стабильный год: принято 13 830 обращений (+12% к 2024). Общий объём разговоров около 41 500 минут (3:00 в среднем на обращение). Сезонность умеренная — небольшой рост к концу года.",
      },
      "2024": {
        rows: [
          { metric: "Входящие",      values: ["920", "880", "950", "910", "980", "950", "910", "940", "1 020", "1 130", "1 270", "1 220"] },
          { metric: "Принятые",      values: ["840", "810", "870", "830", "890", "870", "840", "870", "930", "1 030", "1 140", "1 100"] },
          { metric: "Пропущенные",   values: ["80", "70", "80", "80", "90", "80", "70", "70", "90", "100", "130", "120"] },
          { metric: "Доля пропущенных",            values: ["8.7%", "8.0%", "8.4%", "8.8%", "9.2%", "8.4%", "7.7%", "7.4%", "8.8%", "8.8%", "10.2%", "9.8%"] },
          { metric: "Service Level", values: ["89/20", "90/20", "90/20", "89/20", "89/20", "90/20", "91/20", "92/20", "90/20", "89/20", "87/20", "88/20"] },
          { metric: "Среднее время ответа",           values: ["30 сек", "28 сек", "30 сек", "32 сек", "31 сек", "27 сек", "26 сек", "25 сек", "29 сек", "33 сек", "37 сек", "35 сек"] },
          { metric: "Длительность разговоров, мин", values: ["2 450", "2 350", "2 540", "2 450", "2 610", "2 520", "2 420", "2 510", "2 710", "3 020", "3 420", "3 260"] },
          { metric: "Среднее время разговора",           values: ["2:55", "2:54", "2:55", "2:57", "2:56", "2:54", "2:53", "2:53", "2:55", "2:56", "3:00", "2:58"] },
        ],
        insight: "Первый полный год выделенной команды: принято 11 220 обращений, общий объём разговоров около 33 000 минут. Сезонность умеренная, заметный рост к концу года.",
      },
    },
    monthlyDynamics12: [
      { month: "Июн 25", incoming: 1180, answered: 1100, abandoned: 80 },
      { month: "Июл 25", incoming: 1120, answered: 1040, abandoned: 80 },
      { month: "Авг 25", incoming: 1150, answered: 1070, abandoned: 80 },
      { month: "Сен 25", incoming: 1280, answered: 1180, abandoned: 100 },
      { month: "Окт 25", incoming: 1410, answered: 1290, abandoned: 120 },
      { month: "Ноя 25", incoming: 1580, answered: 1430, abandoned: 150 },
      { month: "Дек 25", incoming: 1520, answered: 1380, abandoned: 140 },
      { month: "Янв 26", incoming: 1350, answered: 1240, abandoned: 110 },
      { month: "Фев 26", incoming: 1290, answered: 1180, abandoned: 110 },
      { month: "Мар 26", incoming: 1370, answered: 1250, abandoned: 120 },
      { month: "Апр 26", incoming: 1370, answered: 1230, abandoned: 140 },
      {
        month: "Май 26",
        incoming: 1480,
        answered: 1362,
        abandoned: 118,
        forecastIncoming: 1480,
        forecastAnswered: 1362,
        forecastAbandoned: 118,
      },
      { month: "Июн 26", forecastIncoming: 1550, forecastAnswered: 1420, forecastAbandoned: 130 },
      { month: "Июл 26", forecastIncoming: 1480, forecastAnswered: 1360, forecastAbandoned: 120 },
    ],
    operatorStats: [
      { name: "Соколова Анастасия", operatorId: "F0291", callCount: 49, pctOfTotal: 28.2, totalTalkSec: 9065, avgTalkSec: 185 },
      { name: "Белов Дмитрий", operatorId: "F1845", callCount: 46, pctOfTotal: 26.4, totalTalkSec: 8280, avgTalkSec: 180 },
      { name: "Кузнецов Евгений", operatorId: "F2317", callCount: 42, pctOfTotal: 24.1, totalTalkSec: 7476, avgTalkSec: 178 },
      { name: "Орлова Наталья", operatorId: "F3402", callCount: 37, pctOfTotal: 21.3, totalTalkSec: 6808, avgTalkSec: 184 },
    ],
    operatorStatsByPeriod: {
      today: [
        { name: "Соколова Анастасия", operatorId: "F0291", callCount: 12, pctOfTotal: 27.9, totalTalkSec: 2220, avgTalkSec: 185 },
        { name: "Белов Дмитрий", operatorId: "F1845", callCount: 11, pctOfTotal: 25.6, totalTalkSec: 1980, avgTalkSec: 180 },
        { name: "Кузнецов Евгений", operatorId: "F2317", callCount: 11, pctOfTotal: 25.6, totalTalkSec: 1958, avgTalkSec: 178 },
        { name: "Орлова Наталья", operatorId: "F3402", callCount: 9, pctOfTotal: 20.9, totalTalkSec: 1656, avgTalkSec: 184 },
      ],
      yesterday: [
        { name: "Соколова Анастасия", operatorId: "F0291", callCount: 13, pctOfTotal: 28.9, totalTalkSec: 2405, avgTalkSec: 185 },
        { name: "Белов Дмитрий", operatorId: "F1845", callCount: 12, pctOfTotal: 26.7, totalTalkSec: 2160, avgTalkSec: 180 },
        { name: "Кузнецов Евгений", operatorId: "F2317", callCount: 11, pctOfTotal: 24.4, totalTalkSec: 1958, avgTalkSec: 178 },
        { name: "Орлова Наталья", operatorId: "F3402", callCount: 9, pctOfTotal: 20.0, totalTalkSec: 1656, avgTalkSec: 184 },
      ],
      week: [
        { name: "Соколова Анастасия", operatorId: "F0291", callCount: 85, pctOfTotal: 27.8, totalTalkSec: 15725, avgTalkSec: 185 },
        { name: "Белов Дмитрий", operatorId: "F1845", callCount: 80, pctOfTotal: 26.1, totalTalkSec: 14400, avgTalkSec: 180 },
        { name: "Кузнецов Евгений", operatorId: "F2317", callCount: 75, pctOfTotal: 24.5, totalTalkSec: 13350, avgTalkSec: 178 },
        { name: "Орлова Наталья", operatorId: "F3402", callCount: 66, pctOfTotal: 21.6, totalTalkSec: 12144, avgTalkSec: 184 },
      ],
      month: [
        { name: "Соколова Анастасия", operatorId: "F0291", callCount: 49, pctOfTotal: 28.2, totalTalkSec: 9065, avgTalkSec: 185 },
        { name: "Белов Дмитрий", operatorId: "F1845", callCount: 46, pctOfTotal: 26.4, totalTalkSec: 8280, avgTalkSec: 180 },
        { name: "Кузнецов Евгений", operatorId: "F2317", callCount: 42, pctOfTotal: 24.1, totalTalkSec: 7476, avgTalkSec: 178 },
        { name: "Орлова Наталья", operatorId: "F3402", callCount: 37, pctOfTotal: 21.3, totalTalkSec: 6808, avgTalkSec: 184 },
      ],
      custom: [
        { name: "Соколова Анастасия", operatorId: "F0291", callCount: 365, pctOfTotal: 27.9, totalTalkSec: 67525, avgTalkSec: 185 },
        { name: "Белов Дмитрий", operatorId: "F1845", callCount: 344, pctOfTotal: 26.3, totalTalkSec: 61920, avgTalkSec: 180 },
        { name: "Кузнецов Евгений", operatorId: "F2317", callCount: 319, pctOfTotal: 24.4, totalTalkSec: 56782, avgTalkSec: 178 },
        { name: "Орлова Наталья", operatorId: "F3402", callCount: 280, pctOfTotal: 21.4, totalTalkSec: 51520, avgTalkSec: 184 },
      ],
    },
    transfers: {
      total: 24,
      pctOfIncoming: 12.8,
      deltaLabel: "−4%",
      deltaTone: "ok",
      destinations: [
        { name: "Корпоративный отдел", count: 11, pct: 46 },
        { name: "Техническая поддержка", count: 6, pct: 25 },
        { name: "Бухгалтерия", count: 4, pct: 17 },
        { name: "Руководитель проекта", count: 2, pct: 8 },
        { name: "Прочее", count: 1, pct: 4 },
      ],
    },
    insight:
      "В мае выделенная команда обработала 1 362 обращений — на 11% больше апреля. Service Level держится в пределах норматива: 92/20 при цели по договору 80/20. Никаких отклонений по качеству обработки за период.",
    dynamics: [
      { date: "01.05", incoming: 52, answered: 48, abandoned: 4 },
      { date: "02.05", incoming: 48, answered: 44, abandoned: 4 },
      { date: "03.05", incoming: 0, answered: 0, abandoned: 0 },
      { date: "04.05", incoming: 0, answered: 0, abandoned: 0 },
      { date: "05.05", incoming: 56, answered: 51, abandoned: 5 },
      { date: "06.05", incoming: 62, answered: 57, abandoned: 5 },
      { date: "07.05", incoming: 58, answered: 53, abandoned: 5 },
      { date: "08.05", incoming: 51, answered: 47, abandoned: 4 },
      { date: "09.05", incoming: 47, answered: 43, abandoned: 4 },
      { date: "10.05", incoming: 0, answered: 0, abandoned: 0 },
      { date: "11.05", incoming: 0, answered: 0, abandoned: 0 },
      { date: "12.05", incoming: 54, answered: 50, abandoned: 4 },
      { date: "13.05", incoming: 59, answered: 54, abandoned: 5 },
      { date: "14.05", incoming: 64, answered: 58, abandoned: 6 },
      { date: "15.05", incoming: 57, answered: 52, abandoned: 5 },
    ],
    // Закрытые месяцы: Май vs Апрель
    monthOverMonth: [
      { metric: "Входящие", prev: "1 370", current: "1 480", delta: "+8%", tone: "up" },
      { metric: "Принятые", prev: "1 230", current: "1 362", delta: "+11%", tone: "up" },
      { metric: "Пропущенные", prev: "140", current: "118", delta: "−16%", tone: "ok" },
      { metric: "Доля пропущенных", prev: "10.2%", current: "8.0%", delta: "−2.2 п.п.", tone: "ok" },
      { metric: "Service Level", prev: "90/20", current: "92/20", delta: "+2 п.п.", tone: "up" },
      { metric: "Среднее время ответа", prev: "27 сек", current: "22 сек", delta: "−5 сек", tone: "ok" },
      { metric: "Длительность разговоров, мин", prev: "3 790", current: "4 130", delta: "+9%", tone: "up" },
      { metric: "Среднее время разговора", prev: "3:05", current: "3:02", delta: "−3 сек", tone: "ok" },
    ],
    // MTD: Июнь (1–5) vs Май (1–5)
    monthOverMonthMtd: [
      { metric: "Входящие", prev: "238", current: "258", delta: "+8.4%", tone: "up" },
      { metric: "Принятые", prev: "220", current: "238", delta: "+8.2%", tone: "up" },
      { metric: "Пропущенные", prev: "18", current: "20", delta: "+11%", tone: "neutral" },
      { metric: "Доля пропущенных", prev: "7.6%", current: "7.8%", delta: "+0.2 п.п.", tone: "neutral" },
      { metric: "Service Level", prev: "92/20", current: "92/20", delta: "0 п.п.", tone: "neutral" },
      { metric: "Среднее время ответа", prev: "22 сек", current: "22 сек", delta: "0 сек", tone: "neutral" },
      { metric: "Длительность разговоров, мин", prev: "670", current: "720", delta: "+8%", tone: "up" },
      { metric: "Среднее время разговора", prev: "3:02", current: "3:02", delta: "0 сек", tone: "neutral" },
    ],
    distribution: [
      { name: "Обработанные", value: 1362, color: "#7CB342" },
      { name: "Пропущенные", value: 118, color: "#F59E0B" },
      { name: "Перевод/перезвон", value: 64, color: "#0EA5E9" },
    ],
    heatmap: {
      days: DAYS_7,
      hours: HOURS_24,
      // FTE — Пн-Пт 09-18, вне графика и в выходные пусто
      data: DAYS_7.map((_, d) => {
        const isWeekend = d >= 5;
        return HOURS_24.map((_, h) => {
          if (isWeekend) return 0;
          if (h < 9 || h >= 18) return 0;
          const base = 45 + Math.cos((h - 12) * 0.7) * 25 + Math.sin(d) * 5;
          return Math.max(20, Math.round(base));
        });
      }),
    },
    forecast: [
      {
        label: "Прогноз потока",
        value: "1 550 – 1 650",
        note: "обычный сезонный рост: +5–10% к маю",
        tone: "neutral",
      },
      {
        label: "Рабочих дней в месяце",
        value: "21",
        note: "на 2 дня больше мая — ожидается соответствующий прирост обращений",
        tone: "neutral",
      },
      {
        label: "Пик нагрузки",
        value: "11:00 – 13:00",
        note: "пиковое окно ваших обращений",
        tone: "neutral",
      },
      {
        label: "Самый загруженный день недели",
        value: "Среда",
        note: "ваши партнёры активнее всего звонят в среду, +14% к среднему",
        tone: "neutral",
      },
    ],
    recommendations: [
      {
        title: "Апсейл-кампания к закрытию H1 — до 1 июля",
        body: "У B2B-клиентов ежегодно к 1 июля идёт пересмотр бюджетов на 2-е полугодие. По нашей статистике, доля обращений «изменение условий / обновление договоров» к этому моменту растёт на 22–28%. Проактивная исходящая кампания по базе ключевых партнёров Адамаса с предложением расширения договора даёт типичную конверсию 15–20%. Можем подготовить скрипт и команду за 5 рабочих дней.",
        effect: "+10–18 закрытых допсоглашений за июнь",
      },
      {
        title: "Запуск чат-канала с нейроассистентом 24/7",
        body: "B2B-клиенты часто заходят на сайт вечером и в выходные с короткими запросами — счета, статусы, документы. Нейроассистент в чате обрабатывает такие обращения 24/7 и снимает до 60–70% типовых вопросов, не нагружая выделенную команду. Сложные кейсы передаются на голосовую линию в рабочее время — уже с готовым контекстом разговора. Лето — спокойный сезон, удобно запустить и обучить нейроассистента на ваших темах к Q4.",
        effect: "охват 24/7 без расширения команды, −60% типовых обращений на голосовую линию",
      },
    ],
  },
  "chatbot": {
    period: "Май 2026",
    currentLabel: "Май 2026",
    previousLabel: "Апрель 2026",
    mtdCurrentLabel: "Июнь (1–4)",
    mtdPreviousLabel: "Май (1–4)",
    mtdDayCount: 4,
    kpisCurrentMonthLabel: "Июнь 2026 (с 1 по 4)",
    kpisByPeriod: {
      today: {
        rangeLabel: "Сегодня · 4 июня 2026",
        compareLabel: "к 3 июня",
        kpis: [
          { label: "Входящие", value: "58", delta: "−6%", tone: "neutral" },
          { label: "Принято", value: "58", delta: "−6%", tone: "neutral" },
          { label: "Ср. ответ (ASA)", value: "0.8 сек", delta: "0 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "1 мин 28 сек", delta: "−2 сек", tone: "ok" },
        ],
        transfers: {
          total: 7,
          pctOfIncoming: 12.1,
          deltaLabel: "−10%",
          deltaTone: "ok",
          destinations: [
            { name: "Технический вопрос", count: 3, pct: 43 },
            { name: "Сложный возврат", count: 2, pct: 29 },
            { name: "VIP-клиент", count: 1, pct: 14 },
            { name: "Прочее", count: 1, pct: 14 },
          ],
        },
      },
      yesterday: {
        rangeLabel: "Вчера · 3 июня 2026",
        compareLabel: "к 2 июня",
        kpis: [
          { label: "Входящие", value: "62", delta: "+5%", tone: "up" },
          { label: "Принято", value: "62", delta: "+5%", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "0.8 сек", delta: "0 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "1 мин 30 сек", delta: "+1 сек", tone: "neutral" },
        ],
        transfers: {
          total: 8,
          pctOfIncoming: 12.9,
          deltaLabel: "−8%",
          deltaTone: "ok",
          destinations: [
            { name: "Технический вопрос", count: 3, pct: 38 },
            { name: "Сложный возврат", count: 2, pct: 25 },
            { name: "VIP-клиент", count: 2, pct: 25 },
            { name: "Прочее", count: 1, pct: 12 },
          ],
        },
      },
      week: {
        rangeLabel: "Неделя · 29 мая – 4 июня",
        compareLabel: "к 22–28 мая",
        kpis: [
          { label: "Входящие", value: "418", delta: "+4%", tone: "up" },
          { label: "Принято", value: "418", delta: "+4%", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "0.8 сек", delta: "0 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "1 мин 30 сек", delta: "0 сек", tone: "ok" },
        ],
        transfers: {
          total: 52,
          pctOfIncoming: 12.4,
          deltaLabel: "−7%",
          deltaTone: "ok",
          destinations: [
            { name: "Технический вопрос", count: 21, pct: 40 },
            { name: "Сложный возврат", count: 14, pct: 27 },
            { name: "VIP-клиент", count: 10, pct: 19 },
            { name: "Прочее", count: 7, pct: 14 },
          ],
        },
      },
      month: {
        rangeLabel: "Июнь 2026 (с 1 по 4)",
        compareLabel: "к маю 1–4",
        kpis: [
          { label: "Входящие", value: "240", delta: "+8%", tone: "up" },
          { label: "Принято", value: "240", delta: "+8%", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "0.8 сек", delta: "0 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "1 мин 30 сек", delta: "−1 сек", tone: "ok" },
        ],
        transfers: {
          total: 29,
          pctOfIncoming: 12.1,
          deltaLabel: "−9%",
          deltaTone: "ok",
          destinations: [
            { name: "Технический вопрос", count: 12, pct: 41 },
            { name: "Сложный возврат", count: 8, pct: 28 },
            { name: "VIP-клиент", count: 5, pct: 17 },
            { name: "Прочее", count: 4, pct: 14 },
          ],
        },
      },
      custom: {
        rangeLabel: "15 апреля – 15 мая 2026",
        compareLabel: "к 15 мар – 15 апр",
        kpis: [
          { label: "Входящие", value: "1 540", delta: "+12%", tone: "up" },
          { label: "Принято", value: "1 540", delta: "+12%", tone: "up" },
          { label: "Ср. ответ (ASA)", value: "0.8 сек", delta: "−0.1 сек", tone: "ok" },
          { label: "Ср. обработка (AHT)", value: "1 мин 32 сек", delta: "+2 сек", tone: "neutral" },
        ],
        transfers: {
          total: 192,
          pctOfIncoming: 12.5,
          deltaLabel: "−6%",
          deltaTone: "ok",
          destinations: [
            { name: "Технический вопрос", count: 78, pct: 41 },
            { name: "Сложный возврат", count: 52, pct: 27 },
            { name: "VIP-клиент", count: 36, pct: 19 },
            { name: "Прочее", count: 26, pct: 13 },
          ],
        },
      },
    },
    kpis: [
      { label: "Входящие", value: "240", delta: "+8%", tone: "up" },
      { label: "Принято", value: "240", delta: "+8%", tone: "up" },
      { label: "Ср. ответ (ASA)", value: "0.8 сек", delta: "0 сек", tone: "ok" },
      { label: "Ср. обработка (AHT)", value: "1 мин 30 сек", delta: "−1 сек", tone: "ok" },
    ],
    yearlyReports: {
      "2026": {
        rows: [
          { metric: "Входящие диалогов", values: ["1 720", "1 580", "1 640", "1 720", "1 800", null, null, null, null, null, null, null] },
          { metric: "Обработано ИИ",      values: ["1 500", "1 384", "1 442", "1 522", "1 584", null, null, null, null, null, null, null] },
          { metric: "Эскалаций",           values: ["220", "196", "198", "198", "216", null, null, null, null, null, null, null] },
          { metric: "Доля эскалаций",      values: ["12.8%", "12.4%", "12.1%", "11.5%", "12.0%", null, null, null, null, null, null, null] },
          { metric: "Среднее время ответа", values: ["0.9 сек", "0.8 сек", "0.8 сек", "0.8 сек", "0.8 сек", null, null, null, null, null, null, null] },
          { metric: "Среднее время диалога", values: ["1:35", "1:34", "1:33", "1:31", "1:30", null, null, null, null, null, null, null] },
        ],
        insight: "За первые 5 месяцев обработано 7 432 диалога. ИИ закрывает 88% запросов самостоятельно — основная часть нагрузки снимается с операторов на первой линии.",
      },
      "2025": {
        rows: [
          { metric: "Входящие диалогов", values: ["1 250", "1 180", "1 320", "1 240", "1 280", "1 220", "1 180", "1 200", "1 340", "1 480", "1 920", "1 850"] },
          { metric: "Обработано ИИ",      values: ["1 050", "990", "1 105", "1 040", "1 075", "1 025", "990", "1 008", "1 125", "1 245", "1 614", "1 555"] },
          { metric: "Эскалаций",           values: ["200", "190", "215", "200", "205", "195", "190", "192", "215", "235", "306", "295"] },
          { metric: "Доля эскалаций",      values: ["16.0%", "16.1%", "16.3%", "16.1%", "16.0%", "16.0%", "16.1%", "16.0%", "16.0%", "15.9%", "15.9%", "15.9%"] },
          { metric: "Среднее время ответа", values: ["1.2 сек", "1.1 сек", "1.1 сек", "1.0 сек", "1.0 сек", "1.0 сек", "0.9 сек", "0.9 сек", "0.9 сек", "0.9 сек", "0.9 сек", "0.9 сек"] },
          { metric: "Среднее время диалога", values: ["1:42", "1:40", "1:41", "1:39", "1:38", "1:37", "1:36", "1:36", "1:37", "1:38", "1:40", "1:38"] },
        ],
        insight: "Год запуска нейроассистента: доля эскалаций стабильно держится на 16%. ИИ закрепился как первая линия и снимает основную нагрузку с операторов.",
      },
    },
    monthlyDynamics12: [
      { month: "Июн 25", incoming: 1220, answered: 1025 },
      { month: "Июл 25", incoming: 1180, answered: 990 },
      { month: "Авг 25", incoming: 1200, answered: 1008 },
      { month: "Сен 25", incoming: 1340, answered: 1125 },
      { month: "Окт 25", incoming: 1480, answered: 1245 },
      { month: "Ноя 25", incoming: 1920, answered: 1614 },
      { month: "Дек 25", incoming: 1850, answered: 1555 },
      { month: "Янв 26", incoming: 1720, answered: 1500 },
      { month: "Фев 26", incoming: 1580, answered: 1384 },
      { month: "Мар 26", incoming: 1640, answered: 1442 },
      { month: "Апр 26", incoming: 1720, answered: 1522 },
      {
        month: "Май 26",
        incoming: 1800,
        answered: 1584,
        forecastIncoming: 1800,
        forecastAnswered: 1584,
      },
      { month: "Июн 26", forecastIncoming: 1950, forecastAnswered: 1716 },
      { month: "Июл 26", forecastIncoming: 1820, forecastAnswered: 1602 },
    ],
    transfers: {
      total: 29,
      pctOfIncoming: 12.1,
      deltaLabel: "−9%",
      deltaTone: "ok",
      destinations: [
        { name: "Технический вопрос", count: 12, pct: 41 },
        { name: "Сложный возврат", count: 8, pct: 28 },
        { name: "VIP-клиент", count: 5, pct: 17 },
        { name: "Прочее", count: 4, pct: 14 },
      ],
    },
    // Распределение по каналам входа за месяц (всего 1 800 диалогов)
    channels: {
      total: 1800,
      items: [
        { name: "Telegram", count: 720, pct: 40 },
        { name: "Чат на сайте", count: 540, pct: 30 },
        { name: "WhatsApp", count: 432, pct: 24 },
        { name: "Телефон", count: 108, pct: 6 },
      ],
    },
    insight:
      "В мае обработано 1 800 диалогов — на 5% больше апреля. Нейроассистент закрывает 88% запросов самостоятельно, снимая основную нагрузку с операторов.",
    dynamics: [],
    monthOverMonth: [
      { metric: "Входящие",           current: "1 800",   prev: "1 720",  delta: "+4.7%",  tone: "up" },
      { metric: "Обработано ИИ",       current: "1 584",   prev: "1 522",  delta: "+4.1%",  tone: "up" },
      { metric: "Эскалаций",            current: "216",     prev: "198",    delta: "+9.1%",  tone: "neutral" },
      { metric: "Доля эскалаций",       current: "12.0%",   prev: "11.5%",  delta: "+0.5 п.п.", tone: "neutral" },
      { metric: "Ср. время диалога",    current: "1:30",    prev: "1:31",   delta: "−1 сек", tone: "ok" },
    ],
    monthOverMonthMtd: [
      { metric: "Входящие",           current: "240",     prev: "222",    delta: "+8%",    tone: "up" },
      { metric: "Обработано ИИ",       current: "211",     prev: "196",    delta: "+8%",    tone: "up" },
      { metric: "Эскалаций",            current: "29",      prev: "26",     delta: "+12%",   tone: "neutral" },
      { metric: "Доля эскалаций",       current: "12.1%",   prev: "11.7%",  delta: "+0.4 п.п.", tone: "neutral" },
      { metric: "Ср. время диалога",    current: "1:30",    prev: "1:32",   delta: "−2 сек", tone: "ok" },
    ],
    heatmap: {
      days: DAYS_7,
      hours: HOURS_24,
      data: makeHeat247().map((row) => row.map((v) => Math.round(v * 0.35))),
    },
    forecast: [
      {
        label: "Прогноз потока",
        value: "1 850 – 2 050",
        note: "сезонный рост: чаты активнее в летний период",
        tone: "neutral",
      },
      {
        label: "Диалогов с ИИ",
        value: "≈ 1 700",
        note: "ожидаемая доля автономной обработки — 88%",
        tone: "ok",
      },
      {
        label: "Пик обращений",
        value: "20:00 – 23:00",
        note: "вечернее окно: клиенты заходят с домашних устройств",
        tone: "neutral",
      },
      {
        label: "Самый загруженный день недели",
        value: "Воскресенье",
        note: "клиенты пишут по вопросам выходного шопинга",
        tone: "neutral",
      },
    ],
    recommendations: [
      {
        title: "Расширение базы знаний под сезон возвратов",
        body: "Доля обращений «возврат / обмен» традиционно растёт к августу на 30–40% — сезон отпускных покупок и подарков на выпускные. Дообучение нейроассистента на расширенной FAQ по возвратам с учётом летних кейсов позволит держать долю эскалаций на текущих 12% даже при росте потока.",
        effect: "сохранение 88% автономной обработки при +30% потоке",
      },
      {
        title: "Подключение голосовой линии с эскалацией из чата",
        body: "12% диалогов эскалируются на сложные случаи — VIP-клиентов, нестандартные возвраты, технические вопросы. Подключение горячей линии O'LINE с передачей контекста диалога даст полноценный омниканал: клиент начинает в чате, при необходимости переходит на голос — с уже понятой проблемой. Среднее время решения сложного кейса сокращается в 2 раза.",
        effect: "−50% времени решения сложных кейсов, +8 п.п. CSAT",
      },
      {
        title: "Тематическая кампания к 1 сентября",
        body: "У eCommerce-клиентов нашей отрасли за 2 недели до 1 сентября обращения по теме «школьные товары / детская одежда» растут в 3–4 раза. Подготовка отдельного скрипта в нейроассистенте даст лучшие ответы по сезонной теме и сэкономит эскалации.",
        effect: "−40% эскалаций по сезонной теме, рост точности до 95%",
      },
    ],
  },
};
