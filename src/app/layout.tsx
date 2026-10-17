import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SC opcje", template: "%s · SC opcje" },
  description: "Ogłoszenia o pracy i usługach w Polsce. Praca dorywcza, na godziny i usługi między osobami prywatnymi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />}>
          <SiteHeader />
        </Suspense>

        <div className="flex-1">{children}</div>

        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
