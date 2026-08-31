import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { ProjectProvider } from "@/components/providers/project-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "O'LINE — Клиентский портал",
  description: "Прототип клиентского портала O'LINE",
};

// Демо-данные считаются от реальной даты (см. lib/demo-clock) — рендерим
// динамически, чтобы кабинет всегда был «на сегодня» без пересборки.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans">
        <ToastProvider>
          <ProjectProvider>
            <AppShell>{children}</AppShell>
          </ProjectProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
