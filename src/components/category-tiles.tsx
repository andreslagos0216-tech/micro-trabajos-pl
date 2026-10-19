import Link from "next/link";

export type Tile = { href: string; label: string; icon: string; keywords?: string };

export function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {tiles.map((tile) => (
        <li key={tile.href}>
          <Link
            href={tile.href}
            className="flex h-full flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-center text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 sm:text-xs"
          >
            <span className="text-lg" aria-hidden="true">{tile.icon}</span>
            <span>{tile.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}