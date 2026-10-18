import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Dict, type Lang } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { listingsText } from "@/lib/listings-i18n";
import { localizeMany } from "@/lib/translate";
import { boundingBox, distanceKm, formatKm, parseNear } from "@/lib/geo";
import { listHref } from "@/lib/url";
import { ui } from "@/lib/ui";
import { HeroSearch } from "@/components/hero-search";

type SearchParams = Promise<{ q?: string; k?: string; lat?: string; lng?: string; r?: string }>;

const KIND_LIST: Kind[] = ["job", "candidate", "service"];
const RADIUS_OPTIONS = [5, 20, 50, 100];
const HERO_BUTTON: Record<Lang, string> = {
  pl: "Szukaj ogłoszeń",
  es: "Buscar anuncios",
  en: "Search listings",
};

type JobRow = {
  id: string;
  title: string;
  description: string;
  pay_pln: number;
  pay_agreed: boolean;
  pay_type: string;
  kind: string;
  original_lang: string;
  featured_until: string | null;
  lat: number | null;
  lng: number | null;
  localities: { name: string } | null;
};

export default function Home(props: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <HomeContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = dict[lang];
  const k = kindDict[lang];
  const l = listingsText[lang];
  const { q, k: kindParam, lat, lng, r } = await searchParams;
  const kind = KIND_LIST.includes(kindParam as Kind) ? (kindParam as Kind) : null;
  const near = parseNear(lat, lng, r);

  const supabase = await createClient();
  const now = new Date().toISOString();

  const buildQuery = () => {
    let query = supabase
      .from("job_posts")
      .select("id, title, description, pay_pln, pay_agreed, pay_type, kind, original_lang, featured_until, lat, lng, localities(name)")
      .eq("status", "active");
    if (kind) query = query.eq("kind", kind);
    if (q) query = query.ilike("title", `%${q}%`);
    if (near) {
      const box = boundingBox(near.lat, near.lng, near.radius);
      query = query.gte("lat", box.minLat).lte("lat", box.maxLat).gte("lng", box.minLng).lte("lng", box.maxLng);
    }
    return query;
  };

  const { data: featuredData } = await buildQuery()
    .gt("featured_until", now)
    .order("featured_until", { ascending: false })
    .limit(5);

  const { data: rowsData, error } = await buildQuery()
    .or(`featured_until.is.null,featured_until.lte.${now}`)
    .order("bumped_at", { ascending: false })
    .limit(near ? 300 : 30);

  const withDistance = (rows: JobRow[]) =>
    rows
      .map((row) => ({
        ...row,
        distance: near && row.lat != null && row.lng != null ? distanceKm(near.lat, near.lng, row.lat, row.lng) : null,
      }))
      .filter((row) => !near || (row.distance !== null && row.distance <= near.radius))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  const featuredJobs = await localizeMany(withDistance((featuredData ?? []) as JobRow[]), lang);
  const jobs = await localizeMany(withDistance((rowsData ?? []) as JobRow[]).slice(0, 30), lang);

  return (
    <main className={ui.container}>
      <section className="mb-8">
        <h1 className={ui.title}>{t.heroTitle}</h1>
        <p className={`mt-2 max-w-2xl ${ui.subtitle}`}>{t.heroSubtitle}</p>
        <div className="mt-6 max-w-xl">
          <HeroSearch
            label={`📍 ${l.nearLabel}`}
            placeholder={l.nearPlaceholder}
            noResults={t.localityNoResults}
            button={HERO_BUTTON[lang]}
            radius={near?.radius ?? 20}
          />
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3">
        <CategoryCard href="/?k=candidate#ofertas" icon="🔍" title={k.candidate.label} text={t.cardWorkText} />
        <CategoryCard href="/jobs/new?kind=job" icon="💼" title={k.job.label} text={t.cardHireText} />
        <CategoryCard href="/?k=service#ofertas" icon="🛠️" title={k.service.label} text={t.cardServiceText} />
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <span className="text-2xl" aria-hidden="true">🏠</span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">{l.sale} · {l.rent}</span>
          <span className="flex gap-3 text-sm">
            <Link href="/listados/sale" className={ui.link}>{l.sale}</Link>
            <Link href="/listados/rent" className={ui.link}>{l.rent}</Link>
          </span>
        </div>
      </section>

      <div id="ofertas" className="scroll-mt-32">
        <nav
          aria-label={k.all}
          className="sticky top-[104px] z-10 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-slate-50/95 px-4 py-3 backdrop-blur [scrollbar-width:none] dark:bg-slate-950/95"
        >
          {([null, ...KIND_LIST] as const).map((item) => {
            const active = item === kind;
            const params = {
              k: item ?? undefined,
              lat: near ? String(near.lat) : undefined,
              lng: near ? String(near.lng) : undefined,
              r: near ? String(near.radius) : undefined,
            };
            return (
              <Link
                key={item ?? "all"}
                href={listHref("/", params)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  active
                    ? "bg-blue-700 text-white"
                    : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {item === null ? k.all : k[item].label}
              </Link>
            );
          })}
        </nav>

        {near && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <span>{l.nearSearching} {near.radius} km</span>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((option) => (
                <Link
                  key={option}
                  href={listHref("/", {
                    k: kind ?? undefined,
                    q: q || undefined,
                    lat: String(near.lat),
                    lng: String(near.lng),
                    r: String(option),
                  })}
                  className={option === near.radius ? ui.button : ui.buttonSecondary}
                >
                  {option} km
                </Link>
              ))}
            </div>
            <Link href={listHref("/", { k: kind ?? undefined })} className={ui.link}>{l.clearNear}</Link>
          </div>
        )}

        <form className="mb-8 flex gap-2">
          {kind && <input type="hidden" name="k" value={kind} />}
          {near && (
            <>
              <input type="hidden" name="lat" value={near.lat} />
              <input type="hidden" name="lng" value={near.lng} />
              <input type="hidden" name="r" value={near.radius} />
            </>
          )}
          <label htmlFor="q" className="sr-only">{t.searchLabel}</label>
          <input id="q" name="q" defaultValue={q} placeholder={t.searchPlaceholder} className={`${ui.input} flex-1`} />
          <button type="submit" className={ui.buttonSecondary}>{t.searchButton}</button>
        </form>

        {error && <p className={ui.errorBox}>{t.loadError}</p>}

        {featuredJobs.length > 0 && (
          <section className="mb-10">
            <h2 className={ui.sectionTitle}>{t.featured}</h2>
            <ul className="space-y-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} t={t} badge={k[job.kind as Kind].badge} featured />
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className={ui.sectionTitle}>{t.recent}</h2>
          {jobs.length > 0 ? (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} t={t} badge={k[job.kind as Kind].badge} />
              ))}
            </ul>
          ) : (
            <p className={ui.emptyBox}>{t.empty}</p>
          )}
        </section>
      </div>
    </main>
  );
}

function CategoryCard({ href, icon, title, text }: { href: string; icon: string; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
    >
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="font-semibold text-slate-900 dark:text-slate-50">{title}</span>
      <span className="text-sm text-slate-600 dark:text-slate-400">{text}</span>
    </Link>
  );
}

type CardJob = {
  id: string;
  title: string;
  pay_pln: number;
  pay_agreed: boolean;
  pay_type: string;
  localities: { name: string } | null;
  distance: number | null;
};

function JobCard({
  job,
  t,
  badge,
  featured = false,
}: {
  job: CardJob;
  t: Dict;
  badge: string;
  featured?: boolean;
}) {
  return (
    <li className={featured ? ui.cardFeatured : ui.card}>
      <div className="mb-2 flex flex-wrap gap-2">
        <span className={ui.badgeNeutral}>{badge}</span>
        {featured && <span className={ui.badge}>{t.badgeFeatured}</span>}
      </div>
      <Link
        href={`/jobs/${job.id}`}
        className="block text-base font-semibold text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded dark:text-slate-50"
      >
        {job.title}
      </Link>
      <p className={`mt-1 ${ui.muted}`}>
        {job.localities?.name} · {job.pay_agreed ? t.agreedPrice : `${job.pay_pln} zł / ${job.pay_type === "hour" ? t.perHour : t.perProject}`}
        {job.distance !== null && <> · {formatKm(job.distance)}</>}
      </p>
    </li>
  );
}