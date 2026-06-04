"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SOON_TOOLTIP =
  "Эта функция появится в следующей версии портала. Сейчас вы видите место, где она будет находиться.";

export function SoonCard({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip content={SOON_TOOLTIP}>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "group flex h-full w-full flex-col items-start gap-2 rounded-card border border-dashed border-navy/20 bg-navy-50/40 p-5 text-left transition-colors hover:bg-navy-50",
            className
          )}
        >
          <div className="flex w-full items-start justify-between gap-3">
            <span className="flex items-center gap-2 font-medium text-navy/55">
              <Lock size={15} className="shrink-0" />
              {title}
            </span>
            <Badge variant="soon">Скоро</Badge>
          </div>
          {description && (
            <p className="text-sm leading-relaxed text-navy/45">{description}</p>
          )}
        </button>
      </Tooltip>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <p className="mb-5 text-sm leading-relaxed text-navy/70">
          {description ??
            "Функция появится после запуска основной версии портала. Здесь вы видите место, где она будет находиться."}
        </p>
        <Button variant="outline" disabled className="w-full">
          Сообщить о готовности подключить, когда появится
        </Button>
      </Modal>
    </>
  );
}
