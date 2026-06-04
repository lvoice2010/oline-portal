"use client";

import * as React from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocumentPreviewModal({
  open,
  onClose,
  title,
  fileUrl,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 flex h-[88vh] w-full max-w-5xl flex-col rounded-card bg-white shadow-soft-lg"
        )}
      >
        <div className="flex items-center justify-between border-b border-navy/[0.06] px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-navy">{title}</h2>
            <p className="text-xs text-navy/50">PDF · просмотр документа</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-navy-50"
            >
              <ExternalLink size={13} /> Открыть в новой вкладке
            </a>
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-xl bg-copper px-3 py-2 text-xs font-medium text-white shadow-soft hover:bg-copper-light"
            >
              <Download size={13} /> Скачать PDF
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-navy/50 hover:bg-navy-50 hover:text-navy"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-navy-50/40 p-2">
          <iframe
            src={`${fileUrl}#view=FitH`}
            title={title}
            className="h-full w-full rounded-lg border border-navy/[0.08] bg-white"
          />
        </div>
      </div>
    </div>
  );
}
