"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

// Оболочка приложения: держит состояние мобильного меню, чтобы гамбургер
// в топбаре и выезжающий сайдбар работали синхронно.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = React.useState(false);
  const pathname = usePathname();

  // Закрываем меню при переходе на другую страницу
  React.useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Затемнение под drawer — только на мобиле */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
