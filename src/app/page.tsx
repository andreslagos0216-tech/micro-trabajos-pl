import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Lang } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { homeText } from "@/lib/home-i18n";
import { listingsText } from "@/lib/listings-i18n";
import { tipsText } from "@/lib/tips-i18n";
import { boundingBox, distanceKm, formatKm, parseNear } from "@/lib/geo";
import { listHref } from "@/lib/url";
import { ui } from "@/lib/ui";
import { CategoryTiles, type Tile } from "@/components/category-tiles";
import { LocalityNav } from "@/components/locality-picker";
import { ListingCard } from "@/components/listing-card";
import { FavoriteButton } from "@/components/favorite-button";

type SearchParams = Promise<{ q?: string; f?: string; sort?: string; lat?: string; lng?: string; r?: string }>;

type Card = {
  id: string;
  kind: "job" | "sale" | "rent";
  title: string;
  price: number | null;
  agreed: boolean;
  unit: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  featured_until: string | null;
  bumped_at: string;
  href: string;
  badge: string;
  photo: string | null;
};

const FILTERS = ["all", "job", "service", "candidate", "sale", "rent", "hourly"] as const;
const HOURLY_LABEL: Record<Lang, string> = { pl: "Na godziny / dni", es: "Por horas o días", en: "Hourly or daily" };
type Filter = (typeof FILTERS)[number];
const SORTS = ["recent", "price_asc", "price_desc"] as const;
type Sort = (typeof SORTS)[number];

const FILTER_BUTTON_LABEL: Record<Lang, string> = {
  pl: "Filtruj i sortuj",
  es: "Filtrar y ordenar",
  en: "Filter and sort",
};

export default function Home(props: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <HomeContent searchParams={props.searchParams} />
    </Suspense>
  );
}

type LocalityRef = { name: string } | null;

async function HomeContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang: Lang = await getLang();
  const t = dict[lang];
  const k = kindDict[lang];
  const h = homeText[lang];
  const l = listingsText[lang];
  const tips = tipsText[lang];

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const filter: Filter = FILTERS.includes(sp.f as Filter) ? (sp.f as Filter) : "all";
  const sort: Sort = SORTS.includes(sp.sort as Sort) ? (sp.sort as Sort) : "recent";
  const near = parseNear(sp.lat, sp.lng, sp.r);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const now = new Date().toISOString();

  const tiles: Tile[] = [
    { href: "/?f=job", label: h.tiles.job.label, icon: "💼", keywords: h.tiles.job.keywords },
    { href: "/?f=service", label: h.tiles.service.label, icon: "🛠️", keywords: h.tiles.service.keywords },
    { href: "/?f=candidate", label: h.tiles.candidate.label, icon: "🔍", keywords: h.tiles.candidate.keywords },
    { href: "/listados/sale", label: h.tiles.sale.label, icon: "🛒", keywords: h.tiles.sale.keywords },
    { href: "/listados/rent", label: h.tiles.rent.label, icon: "🏠", keywords: h.tiles.rent.keywords },
    { href: "/mapa", label: h.tiles.map.label, icon: "🗺️", keywords: h.tiles.map.keywords },
    { href: "/conseguir-personal", label: (lang === "pl" ? "Potrzebuję ludzi" : lang === "en" ? "Need staff" : "Necesito personal"), icon: "🤝", keywords: "personal ayuda trabajadores limpieza nieve ayudante" },
  ];

  const wantJobs = filter === "all" || filter === "job" || filter === "service" || filter === "candidate" || filter === "hourly";
  const wantSale = filter === "all" || filter === "sale";
  const wantRent = filter === "all" || filter === "rent";

  const jobKind: Kind[] | null =
    filter === "job" ? ["job"] : filter === "service" ? ["service"] : filter === "candidate" ? ["candidate"] : null;

  const box = near ? boundingBox(near.lat, near.lng, near.radius) : null;

  const jobsRes = wantJobs
    ? await (() => {
        let query = supabase
          .from("job_posts")
          .select("id, title, pay_pln, pay_agreed, pay_type, kind, featured_until, bumped_at, lat, lng, localities(name)")
          .eq("status", "active");
        if (jobKind) query = query.in("kind", jobKind);
        if (filter === "hourly") query = query.in("pay_type", ["hour", "day"]);
        if (q) query = query.ilike("title", `%${q}%`);
        if (box) query = query.gte("lat", box.minLat).lte("lat", box.maxLat).gte("lng", box.minLng).lte("lng", box.maxLng);
        return query.order("bumped_at", { ascending: false }).limit(60);
      })()
    : { data: [] };

  const salesRes = wantSale
    ? await (() => {
        let query = supabase
          .from("sale_listings")
          .select("id, title, price_pln, price_negotiable, featured_until, bumped_at, lat, lng, localities(name)")
          .eq("status", "active");
        if (q) query = query.ilike("title", `%${q}%`);
        if (box) query = query.gte("lat", box.minLat).lte("lat", box.maxLat).gte("lng", box.minLng).lte("lng", box.maxLng);
        return query.order("bumped_at", { ascending: false }).limit(60);
      })()
    : { data: [] };

  const rentsRes = wantRent
    ? await (() => {
        let query = supabase
          .from("rental_listings")
          .select("id, title, rent_pln, featured_until, bumped_at, lat, lng, localities(name)")
          .eq("status", "active");
        if (q) query = query.ilike("title", `%${q}%`);
        if (box) query = query.gte("lat", box.minLat).lte("lat", box.maxLat).gte("lng", box.minLng).lte("lng", box.maxLng);
        return query.order("bumped_at", { ascending: false }).limit(60);
      })()
    : { data: [] };

  const cards: Card[] = [];

  // Primera foto de cada anuncio, en una sola consulta
  const saleIds = (salesRes.data ?? []).map((x) => (x as { id: string }).id);
  const rentIds = (rentsRes.data ?? []).map((x) => (x as { id: string }).id);
  const { data: firstPhotos } = await supabase
    .from("listing_photos")
    .select("sale_listing_id, rental_listing_id, storage_path, position")
    .or(`sale_listing_id.in.(${saleIds.join(",") || "00000000-0000-0000-0000-000000000000"}),rental_listing_id.in.(${rentIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
    .order("position");

  const photoMap = new Map<string, string>();
  for (const p of firstPhotos ?? []) {
    const key = (p.sale_listing_id ?? p.rental_listing_id) as string;
    if (!photoMap.has(key)) {
      const url = supabase.storage.from("listing-photos").getPublicUrl(p.storage_path).data.publicUrl;
      photoMap.set(key, url);
    }
  }
  const photoFor = (_section: "sale" | "rent", id: string) => photoMap.get(id) ?? null;

  for (const j of (jobsRes.data ?? []) as unknown as Array<{
    id: string; title: string; pay_pln: number | null; pay_agreed: boolean; pay_type: string; kind: string;
    featured_until: string | null; bumped_at: string; lat: number | null; lng: number | null; localities: LocalityRef;
  }>) {
    cards.push({
      id: j.id,
      kind: "job",
      title: j.title,
      price: j.pay_pln,
      agreed: j.pay_agreed,
      unit: j.pay_type === "hour" ? t.perHour : j.pay_type === "day" ? (lang === "es" ? "día" : lang === "en" ? "day" : "dzień") : t.perProject,
      city: j.localities?.name ?? null,
      lat: j.lat,
      lng: j.lng,
      featured_until: j.featured_until,
      bumped_at: j.bumped_at,
      href: `/jobs/${j.id}`,
      badge: k[j.kind as Kind].badge,
      photo: null,
    });
  }

  for (const s of (salesRes.data ?? []) as unknown as Array<{
    id: string; title: string; price_pln: number | null; price_negotiable: boolean | null;
    featured_until: string | null; bumped_at: string; lat: number | null; lng: number | null; localities: LocalityRef;
  }>) {
    cards.push({
      id: s.id,
      kind: "sale",
      title: s.title,
      price: s.price_pln,
      agreed: !!s.price_negotiable,
      unit: "",
      city: s.localities?.name ?? null,
      lat: s.lat,
      lng: s.lng,
      featured_until: s.featured_until,
      bumped_at: s.bumped_at,
      href: `/listados/sale/${s.id}`,
      badge: l.sale,
      photo: photoFor("sale", s.id),
    });
  }

  for (const r of (rentsRes.data ?? []) as unknown as Array<{
    id: string; title: string; rent_pln: number | null;
    featured_until: string | null; bumped_at: string; lat: number | null; lng: number | null; localities: LocalityRef;
  }>) {
    cards.push({
      id: r.id,
      kind: "rent",
      title: r.title,
      price: r.rent_pln,
      agreed: false,
      unit: h.perMonth,
      city: r.localities?.name ?? null,
      lat: r.lat,
      lng: r.lng,
      featured_until: r.featured_until,
      bumped_at: r.bumped_at,
      href: `/listados/rent/${r.id}`,
      badge: l.rent,
      photo: photoFor("rent", r.id),
    });
  }

  const withDistance = cards
    .map((c) => ({
      ...c,
      distance: near && c.lat != null && c.lng != null ? distanceKm(near.lat, near.lng, c.lat, c.lng) : null,
    }))
    .filter((c) => !near || (c.distance !== null && c.distance <= near.radius));

  const savedSet = new Set<string>();
  if (user) {
    const { data: favRows } = await supabase.from("favorites").select("listing_kind, listing_id").eq("user_id", user.id);
    for (const row of favRows ?? []) savedSet.add(`${row.listing_kind}-${row.listing_id}`);
  }

  const isFeatured = (c: Card) => !!c.featured_until && c.featured_until > now;

  withDistance.sort((a, b) => {
    const fa = isFeatured(a) ? 0 : 1;
    const fb = isFeatured(b) ? 0 : 1;
    if (fa !== fb) return fa - fb;
    if (sort === "price_asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (sort === "price_desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
    if (near) return (a.distance ?? 0) - (b.distance ?? 0);
    return b.bumped_at.localeCompare(a.bumped_at);
  });

  const visible = withDistance.slice(0, 60);

  const linkFor = (params: { f?: string; sort?: string }) =>
    listHref("/", {
      f: params.f,
      q: q || undefined,
      sort: params.sort,
      lat: near ? String(near.lat) : undefined,
      lng: near ? String(near.lng) : undefined,
      r: near ? String(near.radius) : undefined,
    });

  const sortLabel: Record<Sort, string> = {
    recent: h.sortRecent,
    price_asc: h.sortPriceAsc,
    price_desc: h.sortPriceDesc,
  };

  const currentFilterValue = filter === "all" ? undefined : filter;
  const currentSortValue = sort === "recent" ? undefined : sort;

  return (
    <main className={ui.container}>
      <CategoryTiles tiles={tiles} />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={linkFor({ f: value === "all" ? undefined : value, sort: currentSortValue })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              filter === value
                ? "bg-blue-700 text-white"
                : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            {value === "hourly" ? HOURLY_LABEL[lang] : h.filters[value]}
          </Link>
        ))}
      </div>

      <details className="mb-6 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
        <summary className="cursor-pointer list-none font-semibold text-slate-800 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
          {FILTER_BUTTON_LABEL[lang]} ▾
        </summary>

        <div className="mt-4 space-y-4">
          <div>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${ui.muted}`}>{h.sortLabel}</p>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((value) => (
                <Link
                  key={value}
                  href={linkFor({ f: currentFilterValue, sort: value === "recent" ? undefined : value })}
                  className={sort === value ? ui.button : ui.buttonSecondary}
                >
                  {sortLabel[value]}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${ui.muted}`}>📍 {l.nearLabel}</p>
            <LocalityNav
              basePath={linkFor({ f: currentFilterValue, sort: currentSortValue })}
              label=""
              placeholder={l.nearPlaceholder}
              noResults={t.localityNoResults}
              radius={near?.radius ?? 20}
            />
            {near && (
              <p className={`mt-2 text-xs ${ui.muted}`}>
                {l.nearSearching} {near.radius} km ·{" "}
                <Link href={linkFor({ f: currentFilterValue })} className={ui.link}>{l.clearNear}</Link>
              </p>
            )}
          </div>
        </div>
      </details>

      <section id="para-ti" className="scroll-mt-28">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className={ui.sectionTitle}>{h.forYou}</h2>
          <p className={`text-sm ${ui.muted}`}>{visible.length}</p>
        </div>

        {visible.length === 0 ? (
          <p className={ui.emptyBox}>{h.emptyFeed}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((c) => (
            <ListingCard
              key={`${c.kind}-${c.id}`}
              id={c.id}
              kind={c.kind}
              title={c.title}
              href={c.href}
              badge={c.badge}
              photo={c.photo}
              city={c.city ?? ""}
              priceText={c.agreed || c.price == null ? h.agreed : `${c.price} zł${c.unit ? ` / ${c.unit}` : ""}`}
              distanceText={c.distance != null ? ` · ${formatKm(c.distance)}` : ""}
              featured={isFeatured(c)}
              featuredText={t.badgeFeatured}
              saved={savedSet.has(`${c.kind}-${c.id}`)}
              loggedIn={!!user}
              lang={lang}
              path="/"
            />
          ))}
        </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className={`mb-3 ${ui.sectionTitle}`}>{tips.title}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tips.items.map((tip) => (
            <div key={tip.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{tip.title}</p>
              <p className={`mt-1 text-sm ${ui.muted}`}>{tip.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}