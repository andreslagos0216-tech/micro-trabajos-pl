import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { startFeaturedCheckout } from "./actions";

type Params = Promise<{ id: string }>;

export default function JobPage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <JobDetail params={params} />
      </Suspense>
    </main>
  );
}

async function JobDetail({ params }: { params: Params }) {
  await connection();
  const t = dict[await getLang()];
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from("job_posts")
    .select("id, title, description, pay_pln, pay_type, status, featured_until, author_id, cities(name), categories(name)")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const isOwner = user?.id === job.author_id;
  const isFeatured = !!job.featured_until && new Date(job.featured_until) > new Date();
  const statusLabel =
    job.status === "active" ? t.statusActive : job.status === "paused" ? t.statusPaused : t.statusClosed;

  return (
    <>
      <Link href="/" className={`${ui.link} mb-6 inline-block`}>{t.backToList}</Link>

      <article className={`${ui.card} space-y-6`}>
        <div className="flex flex-wrap items-center gap-2">
          {isFeatured && <span className={ui.badge}>{t.badgeFeatured}</span>}
          <span className={ui.badgeNeutral}>{job.categories?.name}</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{job.title}</h1>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className={ui.muted}>{t.cityLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{job.cities?.name}</dd>
            </div>
            <div>
              <dt className={ui.muted}>{t.payLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{job.pay_pln} zł</dd>
            </div>
            <div>
              <dt className={ui.muted}>{t.payTypeLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {job.pay_type === "hour" ? t.payHour : t.payProject}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className={ui.sectionTitle}>{t.descriptionTitle}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">{job.description}</p>
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
      </article>
    </>
  );
}
