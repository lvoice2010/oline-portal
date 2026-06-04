"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  FileText,
  LogOut,
  ChevronDown,
  Zap,
  LayoutDashboard,
  PhoneIncoming,
  PhoneOutgoing,
  ShieldCheck,
  Sparkles,
  FileBarChart,
  FolderArchive,
  HelpCircle,
  Send,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { user, connectedServices } from "@/lib/mock-data";

// Иконки для подключённых услуг — по id
const SERVICE_ICON: Record<string, LucideIcon> = {
  "hotline-247": PhoneIncoming,
  "outbound-q2": PhoneOutgoing,
  "qa-control": ShieldCheck,
  chatbot: Sparkles,
  "quarter-report": FileBarChart,
};

const management = [
  { href: "/documents", label: "Финансовые документы", icon: FileText },
  { href: "/reports-archive", label: "Архив отчётов", icon: FolderArchive },
  { href: "/messages", label: "Отправить сообщение", icon: Send },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
      {children}
    </p>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col bg-navy text-white">
      <Link href="/dashboard" className="block px-6 py-6 hover:opacity-90">
        <Logo size={28} variant="on-dark" />
        <p className="mt-2 text-[11px] uppercase tracking-wider text-white/45">
          Клиентский портал
        </p>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Главная */}
        <div className="pt-3">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              isActive("/dashboard")
                ? "bg-white/10 font-medium text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <LayoutDashboard
              size={17}
              className={isActive("/dashboard") ? "text-copper-light" : "text-white/55"}
            />
            Главная
          </Link>
        </div>

        {/* Подключённые услуги */}
        <SectionTitle>Подключённые услуги</SectionTitle>
        <div className="space-y-0.5">
          {connectedServices.map((s) => {
            const Icon = SERVICE_ICON[s.id] ?? HelpCircle;
            const href = `/services/${s.id}`;
            const active = isActive(href);
            return (
              <Link
                key={s.id}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
                title={s.name}
              >
                <Icon
                  size={17}
                  className={cn(
                    "shrink-0",
                    active ? "text-copper-light" : "text-white/55"
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Управление */}
        <SectionTitle>Управление</SectionTitle>
        <div className="space-y-0.5">
          {management.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={17} className={active ? "text-copper-light" : "text-white/55"} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* CTA — Витрина всех услуг (сразу под «Финансовыми документами») */}
        <Link
          href="/catalog"
          className={cn(
            "mt-3 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium shadow-soft transition-colors",
            isActive("/catalog")
              ? "bg-copper text-white"
              : "bg-copper text-white hover:bg-copper-light"
          )}
        >
          <Zap size={17} className="shrink-0" />
          Витрина всех продуктов и услуг
        </Link>
      </nav>

      {/* Профиль */}
      <div className="relative border-t border-white/10 p-3">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper text-sm font-semibold">
            АИ
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-white/50">{user.company}</span>
          </span>
          <ChevronDown size={16} className="text-white/50" />
        </button>
        {menuOpen && (
          <div className="absolute bottom-[68px] left-3 right-3 overflow-hidden rounded-xl bg-navy-light shadow-soft-lg">
            <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5">
              <LogOut size={15} /> Выйти
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
