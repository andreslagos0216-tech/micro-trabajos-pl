"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/app/favoritos/actions";
import type { Lang } from "@/lib/i18n";

const LABEL: Record<Lang, { save: string; saved: string; login: string }> = {
  pl: { save: "Zapisz", saved: "Zapisane", login: "Zaloguj się, aby zapisać" },
  es: { save: "Guardar", saved: "Guardado", login: "Inicia sesión para guardar" },
  en: { save: "Save", saved: "Saved", login: "Log in to save" },
};

export function FavoriteButton({
  kind,
  listingId,
  initial,
  lang,
  path,
  loggedIn,
}: {
  kind: "job" | "sale" | "rent";
  listingId: string;
  initial: boolean;
  lang: Lang;
  path: string;
  loggedIn: boolean;
}) {
  const t = LABEL[lang];
  const [saved, setOptimistic] = useOptimistic(initial);
  const [pending, startTransition] = useTransition();

  if (!loggedIn) {
    return (
      <a href="/login" className="text-sm font-semibold text-blue-700 underline dark:text-blue-400">
        {t.login}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={saved}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!saved);
          await toggleFavorite(kind, listingId, path);
        })
      }
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 ${
        saved
          ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
      }`}
    >
      <span aria-hidden="true" className="text-base">{saved ? "♥" : "♡"}</span>
      {saved ? t.saved : t.save}
    </button>
  );
}