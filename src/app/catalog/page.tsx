import {
  Sparkles,
  PhoneIncoming,
  PhoneOutgoing,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { RecommendCard } from "@/components/recommend-card";
import {
  recommendedServices,
  catalogServices,
  type CatalogService,
} from "@/lib/mock-data";

const CATEGORY_META: Record<
  CatalogService["category"],
  { label: string; icon: React.ReactNode; description: string }
> = {
  вход: {
    label: "Входящая линия",
    icon: <PhoneIncoming size={16} />,
    description: "Приём входящих звонков, чаты, нейроассистент на вход",
  },
  исход: {
    label: "Исходящие кампании",
    icon: <PhoneOutgoing size={16} />,
    description: "Прозвон базы под задачу: продажи, актуализация, NPS",
  },
  аналитика: {
    label: "Аналитика и отчётность",
    icon: <LineChart size={16} />,
    description: "ИИ-разбор обращений и стратегические выводы",
  },
  QA: {
    label: "Контроль качества и обучение",
    icon: <ShieldCheck size={16} />,
    description: "Чек-листы, ИИ-суфлёр, тренажёр для операторов",
  },
};

const CATEGORY_ORDER: CatalogService["category"][] = [
  "вход",
  "исход",
  "QA",
  "аналитика",
];

export default function CatalogPage() {
  // Новинки — фиксированный список «фичуренных» новинок этого квартала
  const FEATURED_NEW_IDS = ["ai-suffler", "ai-trainer"];
  const newServices = FEATURED_NEW_IDS.map((id) =>
    catalogServices.find((s) => s.id === id)
  ).filter((s): s is CatalogService => Boolean(s));

  // Полный каталог — группировка по категориям
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: catalogServices.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-[1320px] space-y-12">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Витрина услуг</h1>
        <p className="mt-1 text-sm text-navy/55">
          Каталог услуг O&apos;LINE — подключайте новые направления и расширяйте
          действующие.
        </p>
      </div>

      {/* 1. Рекомендуем вам — оставляем как было */}
      <section>
        <div className="mb-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-copper/10 px-3 py-1 text-xs font-medium text-copper">
            <Sparkles size={13} /> Подобрано под ваш профиль
          </div>
          <h2 className="text-xl font-semibold text-navy">Рекомендуем вам</h2>
          <p className="mt-1 max-w-2xl text-sm text-navy/55">
            Подобрано на основе вашей отрасли (eCommerce), активных услуг и тематик
            обращений за последние 30 дней. Можно сразу подключить или сначала
            запросить демо у менеджера.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {recommendedServices.map((s) => (
            <RecommendCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* 2. Новинки */}
      {newServices.length > 0 && (
        <section>
          <div className="mb-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <Sparkles size={13} /> Свежее в каталоге
            </div>
            <h2 className="text-xl font-semibold text-navy">Новинки</h2>
            <p className="mt-1 max-w-2xl text-sm text-navy/55">
              Запустили в этом квартале — ИИ-инструменты для операторов,
              специализированные кампании и автоматизация рутины.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {newServices.map((s) => (
              <RecommendCard key={`new-${s.id}`} service={s} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Полный каталог по категориям */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-navy">Все услуги</h2>
          <p className="mt-1 text-sm text-navy/55">
            Полный каталог по направлениям. Можно подключить сразу несколько услуг —
            пакеты тарифицируются совместно.
          </p>
        </div>

        <div className="space-y-10">
          {grouped.map((group) => {
            const meta = CATEGORY_META[group.category];
            return (
              <div key={group.category}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy/70">
                    {meta.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-navy">
                      {meta.label}
                    </h3>
                    <p className="text-xs text-navy/55">{meta.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((s) => (
                    <RecommendCard key={`cat-${s.id}`} service={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-emerald-200 bg-emerald-50 p-5">
        <div>
          <p className="text-sm font-semibold text-emerald-900">
            Не нашли подходящего решения?
          </p>
          <p className="mt-1 text-sm text-emerald-800/85">
            Опишите задачу — менеджер подберёт комбинацию услуг под вашу
            специфику и пришлёт расчёт.
          </p>
        </div>
        <a
          href="/messages"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Написать менеджеру
        </a>
      </Card>
    </div>
  );
}
