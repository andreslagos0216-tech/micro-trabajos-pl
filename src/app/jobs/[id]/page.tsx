import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";

type Params = Promise<{ id: string }>;

export default function JobPage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Link href="/" className={`${ui.link} mb-6 inline-block`}>← Volver al listado</Link>
      <Suspense fallback={<p className={ui.muted}>Cargando oferta...</p>}>
        <JobDetail params={params} />
      </Suspense>
    </main>
  );
}

async function JobDetail({ params }: { params: Params }) {
  await connection();
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
  const statusLabel = job.status === "active" ? "Activa" : job.status === "paused" ? "Pausada" : "Cerrada";

  return (
    <article className={`${ui.card} space-y-6`}>
      <div className="flex flex-wrap items-center gap-2">
        {isFeatured && <span className={ui.badge}>Destacada</span>}
        <span className={ui.badgeNeutral}>{job.categories?.name}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{job.title}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className={ui.muted}>Ciudad</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{job.cities?.name}</dd>
          </div>
          <div>
            <dt className={ui.muted}>Tarifa</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{job.pay_pln} zł</dd>
          </div>
          <div>
            <dt className={ui.muted}>Tipo de pago</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{job.pay_type === "hour" ? "Por hora" : "Por proyecto"}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className={ui.sectionTitle}>Descripción</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">{job.description}</p>
      </div>

      {isOwner && (
        <section className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Tu oferta</p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">Estado: {statusLabel}</p>
          {isFeatured && (
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              Destacada hasta el {new Date(job.featured_until!).toLocaleDateString("es-ES")}
            </p>
          )}
        </section>
      )}
    </article>
  );
}
