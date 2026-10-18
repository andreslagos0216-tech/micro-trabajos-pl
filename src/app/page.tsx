import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Dict } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { listingsText } from "@/lib/listings-i18n";
import { localizeMany } from "@/lib/translate";
import { boundingBox, distanceKm, formatKm, parseNear } from "@/lib/geo";
import { geoText } from "@/lib/i18n-geo";
import { listHref } from "@/lib/url";
import { ui } from "@/lib/ui";
import { LocalityNav } from "@/components/locality-picker";

type SearchParams = Promise<{ q?: string; k?: string; lat?: string; lng?: string; r?: string }>;

const KIND_LIST: Kind[] = ["job", "candidate", "service"];
const RADIUS_OPTIONS = [5, 20, 50, 100];

type JobRow = {
  id: string;
  title: string;
  description: string;
  pay_pln: number;
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
  const g = geoText[lang];
  const l = listingsText[lang];
  const { q, k: kindParam, lat, lng, r } = await searchParams;
  const kind = KIND_LIST.includes(kindParam as Kind) ? (kindParam as Kind) : null;
  const near = parseNear(lat, lng, r);
  const base = kind ? `/?k=${kind}` : "/";

  const supabase = await createClient();
  const now = new Date().toISOString();

  const buildQuery = () => {
    let query = supabase
      .from("job_posts")
      .select("id, title, description, pay_pln, pay_type, kind, original_lang, featured_until, lat, lng, localities(name)")
      .eq("status", "active");
    if (kind) query = query.eq("kind", kind);
    if (q) query = query.ilike("title", `%${q}%`);
    if (near) {
      const box = boundingBox(near.lat, near.lng, near.radius);
      query = query
        .gte("lat", box.minLat)
        .lte("lat", box.maxLat)
        .gte("lng", box.minLng)
        .lte("lng", box.maxLng);
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

  const withDist = (rows: JobRow[]) =>
    rows
      .map((row) => ({
        ...row,
        distance: near && row.lat != null && row.lng != null ? distanceKm(near.lat, near.lng, row.lat, row.lng) : null,
      }))
      .filter((row) => !near || (row.distance !== null && row.distance <= near.radius))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  const featuredJobs = await localizeMany(withDist((featuredData ?? []) as JobRow[]), lang);
  const jobs = await localizeMany(withDist((rowsData ?? []) as JobRow[]).slice(0, 30), lang);

  return (
    <main className={ui.container}>
      <section className="mb-10">
        <h1 className={ui.title}>{t.heroTitle}</h1>
        <p className={`mt-2 max-w-2xl ${ui.subtitle}`}>{t.heroSubtitle}</p>

        <div className="mt-6 max-w-xl">
          <LocalityNav
            basePath={base}
            label={l.nearLabel}
            placeholder={l.nearPlaceholder}
            noResults={t.localityNoResults}
            radius={near?.radius ?? 20}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <PathCard href="/jobs/new?kind=candidate" title={k.candidate.label} text={t.cardWorkText} />
          <PathCard href="/jobs/new?kind=job" title={k.job.label} text={t.cardHireText} />
          <PathCard href="/jobs/new?kind=service" title={k.service.label} text={t.cardServiceText} />
          <PathCard href="/listados/sale" title={l.sale} text={l.saleSubtitle} />
          <PathCard href="/listados/rent" title={l.rent} text={l.rentSubtitle} />
        </div>
      </section>

      <div id="ofertas" className="scroll-mt-6">
        {near && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <span>{g.nearSearching} {near.radius} km</span>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((option) => (
                <Link
                  key={option}
                  href={listHref("/", { k: kind ?? undefined, q: q || undefined, lat: String(near.lat), lng: String(near.lng), r: String(option) })}
                  className={option === near.radius ? ui.button : ui.buttonSecondary}
                >
                  {option} km
                </Link>
              ))}
            </div>
            <Link href={listHref("/", { k: kind ?? undefined })} className={ui.link}>{l.clearNear}</Link>
          </div>
        )}

        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Tipo de anuncio">
          {(["all", ...KIND_LIST] as const).map((item) => {
            const active = item === "all" ? !kind : item === kind;
            return (
              <Link
                key={item}
                href={listHref("/", {
                  k: item === "all" ? undefined : item,
                  lat: near ? String(near.lat) : undefined,
                  lng: near ? String(near.lng) : undefined,
                  r: near ? String(near.radius) : undefined,
                })}
                className={active ? ui.button : ui.buttonSecondary}
              >
                {item === "all" ? k.all : k[item].label}
              </Link>
            );
          })}
        </nav>

        <form className="mb-10 grid gap-3 sm:grid-cols-[1fr_auto]">
          {kind && <input type="hidden" name="k" value={kind} />}
          {near && (
            <>
              <input type="hidden" name="lat" value={near.lat} />
              <input type="hidden" name="lng" value={near.lng} />
              <input type="hidden" name="r" value={near.radius} />
            </>
          )}
          <div>
            <label htmlFor="q" className="sr-only">{t.searchLabel}</label>
            <input id="q" name="q" defaultValue={q} placeholder={t.searchPlaceholder} className={ui.input} />
          </div>
          <button type="submit" className={ui.button}>{t.searchButton}</button>
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

function PathCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
    >
      <h3 className="font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{text}</p>
    </Link>
  );
}

type CardJob = {
  id: string;
  title: string;
  pay_pln: number;
  pay_type: string;
  localities: { name: string } | null;
  distance: number | null;
};

function JobCard({ job, t, badge, featured = false }: { job: CardJob; t: Dict; badge: string; featured?: boolean }) {
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
        {job.localities?.name} · {job.pay_pln} zł / {job.pay_type === "hour" ? t.perHour : t.perProject}
        {job.distance !== null && <> · {formatKm(job.distance)}</>}
      </p>
    </li>
  );
}