import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StubPage({ title, note }: { title: string; note: string }) {
  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{title}</h1>
        <p className="mt-1 text-sm text-navy/55">{note}</p>
      </div>
      <Card className="flex flex-col items-start gap-3 p-8">
        <Badge variant="soon">В прототипе</Badge>
        <p className="max-w-xl text-sm leading-relaxed text-navy/60">
          Этот экран входит в состав портала и будет реализован на следующем шаге
          согласования. Каркас, навигация и фирменный стиль уже на месте — экран
          подключится в общий layout без изменений структуры.
        </p>
      </Card>
    </div>
  );
}
