import type { ReactNode } from "react";
import { ui } from "@/lib/ui";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={`${ui.container} max-w-3xl`}>
      <h1 className={ui.title}>{title}</h1>
      <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        Wersja robocza. Uzupełnij dane w nawiasach [ ] i sprawdź treść z prawnikiem przed publicznym uruchomieniem.
      </p>
      <div className={`${ui.card} mt-6 space-y-6 text-sm leading-relaxed text-slate-800 dark:text-slate-200`}>
        {children}
      </div>
    </main>
  );
}
