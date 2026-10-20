import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Lang } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { categoryName } from "@/lib/labels";
import { localizeJob } from "@/lib/translate";
import { reportText } from "@/lib/report-i18n";
import { detailText } from "@/lib/detail-i18n";
import { ui } from "@/lib/ui";
import { listingMetadata } from "@/lib/seo";
import { ReportForm } from "@/components/report-form";
import { JobContact } from "@/components/job-contact";
import { startFeaturedCheckout } from "./actions";
import { deleteJob } from "./owner-actions";
import { ownerText } from "@/lib/owner-i18n";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ reported?: string }>;

export default function JobPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <JobDetail params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function JobDetail({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = dict[lang];
  const k = kindDict[lang];
  const r = reportText[lang];
  const d = detailText[lang];
  const { id } = await params;
  const { reported } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from("job_posts")
    .select("id, title, description, pay_pln, pay_agreed, pay_type, status, featured_until, author_id, kind, original_lang, availability, languages, localities(name), categories(name, slug), contact_method")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const local = await localizeJob(
    { id: job.id, title: job.title, description: job.description, original_lang: job.original_lang },
    lang as Lang
  );

  const isOwner = user?.id === job.author_id;
  const isFeatured = !!job.featured_until && new Date(job.featured_until) > new Date();
  const kind = job.kind as Kind;
  const statusLabel = d.statusNames[job.status] ?? job.status;
  const category = categoryName(job.categories?.slug, lang, job.categories?.name ?? "");

  return (
    <>
      <Link href="/" className={`${ui.link} mb-6 inline-block`}>{t.backToList}</Link>

      {reported === "ok" && (
        <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          {r.thanks}
        </p>
      )}
      {reported === "dup" && (
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {r.duplicate}
        </p>
      )}

      <article className={`${ui.card} space-y-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={ui.badgeNeutral}>{k[kind].badge}</span>
          {isFeatured && <span className={ui.badge}>{t.badgeFeatured}</span>}
          <span className={ui.badgeNeutral}>{category}</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{local.title}</h1>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className={ui.muted}>{t.cityLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{job.localities?.name}</dd>
            </div>
            <div>
              <dt className={ui.muted}>{k[kind].rateLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {job.pay_agreed ? t.agreedPrice : `${job.pay_pln} zł`}
              </dd>
            </div>
            <div>
              <dt className={ui.muted}>{t.payTypeLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {job.pay_type === "hour" ? t.payHour : job.pay_type === "day" ? (lang === "es" ? "Por día" : lang === "en" ? "Per day" : "Za dzień") : t.payProject}
              </dd>
            </div>
            {job.availability && (
              <div>
                <dt className={ui.muted}>{k.availability}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{job.availability}</dd>
              </div>
            )}
            {Array.isArray(job.languages) && job.languages.length > 0 && (
              <div>
                <dt className={ui.muted}>{k.spokenLanguages}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">
                  {(job.languages as unknown as { code: string }[]).map((x) => k.langNames[x.code as Lang] ?? x.code).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h2 className={ui.sectionTitle}>{k[kind].descLabel}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">{local.description}</p>
          {local.translated && <p className={`mt-2 text-xs ${ui.muted}`}>{k.autoTranslated}</p>}
        </div>

        {isOwner && (
          <section className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{t.yourListing}</p>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{t.statusLabel}: {statusLabel}</p>
              {isFeatured && (
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  {t.featuredUntil} {new Date(job.featured_until!).toLocaleDateString(t.locale)}
                </p>
              )}
            </div>
            {!isFeatured && job.status === "active" && (
              <form action={startFeaturedCheckout.bind(null, job.id)}>
                <button type="submit" className={ui.button}>{t.featureButton}</button>
              </form>
            )}
          </section>
        )}
        {isOwner && (
          <form action={deleteJob.bind(null, job.id)} className="pt-2">
            <button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300">{ownerText[lang].delete}</button>
          </form>
        )}
      </article>

      <div className="mt-6">
        <JobContact
          lang={lang}
          jobId={job.id}
          authorId={job.author_id}
          title={local.title}
          status={job.status} contactMethod={job.contact_method}
          viewerId={user?.id ?? null}
        />
      </div>

      {!isOwner && (
        <div className="mt-6">
          {user ? (
            <ReportForm targetType="job" targetId={job.id} returnPath={"/jobs/" + job.id} lang={lang} />
          ) : (
            <p className="text-sm">
              <Link href="/login" className={ui.link}>{r.loginFirst}</Link>
            </p>
          )}
        </div>
      )}
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return {};
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_posts")
    .select("title, description, pay_pln, pay_agreed, pay_type, localities(name)")
    .eq("id", id)
    .single();
  if (!data) return {};
  const row = data as unknown as { title: string; description: string; pay_pln: number | null; pay_agreed: boolean; pay_type: string; localities: { name: string } | null };
  const price = row.pay_agreed || row.pay_pln == null ? "A convenir" : `${row.pay_pln} zł / ${row.pay_type === "hour" ? "h" : "projekt"}`;
  return listingMetadata({
    title: row.title,
    description: row.description,
    city: row.localities?.name ?? null,
    price,
    path: `/jobs/${id}`,
  });
}