import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SC opcje", template: "%s · SC opcje" },
  description: "Ogłoszenia o pracy i usługach w Polsce. Praca dorywcza, na godziny i usługi między osobami prywatnymi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
            <Logo />
            <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Link href="/" className="hover:text-blue-700 dark:hover:text-blue-400">Ogłoszenia</Link>
              <Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-400">Zaloguj się</Link>
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-slate-200 bg-white text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-3 px-4 py-6">
            <span>SC opcje</span>
            <nav className="flex gap-5">
              <Link href="/regulamin" className="hover:underline">Regulamin</Link>
              <Link href="/polityka-prywatnosci" className="hover:underline">Polityka prywatności</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
