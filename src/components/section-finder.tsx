"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { normalizeText } from "@/lib/text";
import { ui } from "@/lib/ui";

export type Tile = { href: string; label: string; icon: string; keywords: string };

export function SectionFinder({
  placeholder,
  empty,
  tiles,
}: {
  placeholder: string;
  empty: string;
  tiles: Tile[];
}) {
  const [query, setQuery] = useState("");
  const q = normalizeText(query);

  const shown = useMemo(
    () => (q ? tiles.filter((tile) => normalizeText(`${tile.label} ${tile.keywords}`).includes(q)) : tiles),
    [q, tiles]
  );

  return (
    <div className="space-y-4">
      <label htmlFor="finder" className="sr-only">{placeholder}</label>
      <input
        id="finder"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`${ui.input} text-base`}
      />

      {shown.length === 0 ? (
        <p className={ui.emptyBox}>{empty}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {shown.map((tile) => (
            <li key={tile.href}>
              <Link
                href={tile.href}
                className="flex h-full flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-slate-800 shadow-sm transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 sm:text-sm"
              >
                <span className="text-2xl" aria-hidden="true">{tile.icon}</span>
                <span>{tile.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}