import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { catName, listingsText } from "@/lib/listings-i18n";
import { boundingBox, distanceKm, formatKm, parseNear } from "@/lib/geo";
import { listHref } from "@/lib/url";
import { ui } from "@/lib/ui";
import { LocalityNav } from "@/components/locality-picker";

type Params = Promise<{ section: string }>;
type SearchParams = Promise<{ c?: string; q?: string; lat?: string; lng?: string; r?: string }>;

type Row = {
  id: string;
  title: string;
  price_pln: number | null;
  rent_pln: number | null;
  lat: number | null;
  lng: number | null;
  localities: { name: string } | null;
};

const RADIUS_OPTIONS = [5, 20, 50, 100];

export default function ListingsPage(props: { params: Params; searchParams: SearchParams }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <ListingsContent {...props} />
      </Suspense>
    </main>
  );
}

async function ListingsContent({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await connection();
  const { section: rawSection } = await params;
  if (rawSection !== "sale" && rawSection !== "rent") notFound();
  const section = rawSection;
  const { c, q, lat, lng, r } = await searchParams;
  const lang = await getLang();
  const t = listingsText[lang];
  const near = parseNear(lat, lng, r);
  const nearParams = near
    ? { lat: String(near.lat), lng: String(near.lng), r: String(near.radius) }
    : {};

  const supabase = await createClient();

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, name_es, name_en")
    .eq("section", section)
    .order("name");

  const all = cats ?? [];
  const roots = all.filter((x) => x.parent_id === null);
  const selected = c ? all.find((x) => x.slug === c) : undefined;
  const groupRoot = selected
    ? selected.parent_id === null
      ? selected
      : all.find((x) => x.id === selected.parent_id)
    : undefined;
  const groupChildren = groupRoot ? all.filter((x) => x.parent_id === groupRoot.id) : [];

  let categoryIds: number[] | null = null;
  if (selected) {
    categoryIds =
      selected.parent_id === null
        ? [selected.id, ...all.filter((x) => x.parent_id === selected.id).map((x) => x.id)]
        : [selected.id];
  }

  // La consulta usa la tabla de cada sección; los resultados se tipan a mano
  const table = (section === "sale" ? "sale_listings" : "rental_listings") as "sale_listings";
  let query = supabase
    .from(table)
    .select("*, localities(name)")
    .eq("status", "active");

  if (categoryIds) query = query.in("category_id", categoryIds);
  if (q) query = query.ilike("title", `%${q}%`);
  if (near) {
    const box = boundingBox(near.lat, near.lng, near.radius);
    query = query
      .gte("lat", box.minLat)
      .lte("lat", box.maxLat)
      .gte("lng", box.minLng)
      .lte("lng", box.maxLng);
  }

  const { data, error } = await query
    .order("bumped_at", { ascending: false })
    .limit(near ? 300 : 30);

  const rows = ((data ?? []) as unknown as Row[])
    .map((row) => ({
      ...row,
      distance: near && row.lat != null && row.lng != null ? distanceKm(near.lat, near.lng, row.lat, row.lng) : null,
    }))
    .filter((row) => !near || (row.distance !== null && row.distance <= near.radius))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 30);

  const base = `/listados/${section}`;
  const title = section === "sale" ? t.saleTitle : t.rentTitle;
  const subtitle = section === "sale" ? t.saleSubtitle : t.rentSubtitle;

  return (
    <>
      <h1 className={ui.title}>{title}</h1>
      <p className={`mt-2 max-w-2xl ${ui.subtitle}`}>{subtitle}</p>

      <div className="mt-6 flex flex-wrap items-start gap-3">
        <div className="min-w-[260px] max-w-xl flex-1">
          <LocalityNav
            basePath={selected ? `${base}?c=${selected.slug}` : base}
            label={t.nearLabel}
            placeholder={t.nearPlaceholder}
            noResults={t.localityNoResults}
            radius={near?.radius ?? 20}
          />
        </div>
        <Link href={`/publicar/${section}`} className={ui.button}>{t.publish}</Link>
      </div>

      {near && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <span>{t.nearSearching} {near.radius} km</span>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <Link
                key={option}
                href={listHref(base, { c: c || undefined, q: q || undefined, lat: nearParams.lat, lng: nearParams.lng, r: String(option) })}
                className={option === near.radius ? ui.button : ui.buttonSecondary}
              >
                {option} km
              </Link>
            ))}
          </div>
          <Link href={listHref(base, { c: c || undefined })} className={ui.link}>{t.clearNear}</Link>
        </div>
      )}

      <nav className="mt-8 flex flex-wrap gap-2" aria-label={t.pickCategory}>
        <Link href={listHref(base, nearParams)} className={!selected ? ui.button : ui.buttonSecondary}>{t.all}</Link>
        {roots.map((root) => (
          <Link
            key={root.id}
            href={listHref(base, { c: root.slug, ...nearParams })}
            className={groupRoot?.id === root.id ? ui.button : ui.buttonSecondary}
          >
            {catName(root, lang)}
          </Link>
        ))}
      </nav>

      {groupChildren.length > 0 && (
        <nav className="mt-3 flex flex-wrap gap-2 border-l-2 border-blue-200 pl-3 dark:border-blue-900" aria-label={t.pickCategory}>
          {groupChildren.map((child) => (
            <Link
              key={child.id}
              href={listHref(base, { c: child.slug, ...nearParams })}
              className={selected?.id === child.id ? ui.button : ui.buttonSecondary}
            >
              {catName(child, lang)}
            </Link>
          ))}
        </nav>
      )}

      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        {c && <input type="hidden" name="c" value={c} />}
        {near && (
          <>
            <input type="hidden" name="lat" value={near.lat} />
            <input type="hidden" name="lng" value={near.lng} />
            <input type="hidden" name="r" value={near.radius} />
          </>
        )}
        <div>
          <label htmlFor="q" className="sr-only">{t.titleLabel}</label>
          <input id="q" name="q" defaultValue={q} placeholder={t.titlePlaceholder} className={ui.input} />
        </div>
        <button type="submit" className={ui.buttonSecondary}>OK</button>
      </form>

      {error && <p className={`mt-6 ${ui.errorBox}`}>{error.message}</p>}

      <ul className="mt-8 space-y-3">
        {rows.length === 0 && <p className={ui.emptyBox}>{t.feedEmpty}</p>}
        {rows.map((row) => {
          const price =
            section === "sale"
              ? `${row.price_pln} zł`
              : `${row.rent_pln} zł / ${t.perMonth}`;
          return (
            <li key={row.id} className={ui.card}>
              <Link
                href={`/listados/${section}/${row.id}`}
                className="block text-base font-semibold text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded dark:text-slate-50"
              >
                {row.title}
              </Link>
              <p className={`mt-1 ${ui.muted}`}>
                {row.localities?.name} · {price}
                {row.distance !== null && <> · {formatKm(row.distance)}</>}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}