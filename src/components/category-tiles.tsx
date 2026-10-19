import Link from "next/link";

export type Tile = { href: string; label: string; icon: string; keywords?: string };

export function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {tiles.map((tile) => (
        <li key={tile.href} className="shrink-0">
          <Link
            href={tile.href}
            className="flex w-20 flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-center text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400"
          >
            <span className="text-xl" aria-hidden="true">{tile.icon}</span>
            <span className="leading-tight">{tile.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}