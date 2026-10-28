import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import type { Lang } from "@/lib/i18n";

type Props = {
  id: string;
  kind: "job" | "sale" | "rent";
  title: string;
  href: string;
  badge: string;
  photo: string | null;
  city: string;
  priceText: string;
  distanceText: string;
  featured: boolean;
  featuredText: string;
  saved: boolean;
  loggedIn: boolean;
  lang: Lang;
  path: string;
};

const ICON: Record<Props["kind"], string> = { job: "💼", sale: "🛒", rent: "🏠" };

export function ListingCard(p: Props) {
  return (
    <li className="relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {p.photo ? (
          <Image src={p.photo} alt={`${p.badge}: ${p.title}`} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover" />
        ) : (
          <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-4xl">
            {ICON[p.kind]}
          </div>
        )}

        <div className="absolute right-2 top-2 z-10 overflow-hidden rounded-full bg-white shadow-md">
          {p.loggedIn ? (
            <FavoriteButton kind={p.kind} listingId={p.id} initial={p.saved} lang={p.lang} path={p.path} loggedIn={true} compact />
          ) : (
            <Link href="/login" aria-label="Login" className="flex h-11 w-11 items-center justify-center text-2xl">♡</Link>
          )}
        </div>

        {p.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">
            {p.featuredText}
          </span>
        )}
      </div>

      <Link href={p.href} className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{p.badge}</span>
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">{p.title}</span>
        <span className="mt-auto pt-1 text-sm font-bold text-slate-900 dark:text-slate-50">{p.priceText}</span>
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
          {p.city}
          {p.distanceText}
        </span>
      </Link>
    </li>
  );
}