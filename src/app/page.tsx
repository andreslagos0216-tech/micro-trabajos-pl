import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";

type SearchParams = Promise<{ q?: string; city?: string }>;

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className={ui.container}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={ui.title}>Ofertas en Polonia</h1>
          <p className={ui.subtitle}>Trabajos puntuales y por horas publicados por particulares.</p>
        </div>
        <Link href="/jobs/new" className={ui.button}>
          Publicar oferta
        </Link>
      </div>
      <Suspense fallback={<p className={ui.muted}>Cargando ofertas...</p>}>
        <JobsFeed searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function JobsFeed({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { q, city } = await searchParams;
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: cities } = await supabase.from("cities").select("id, name").order("name");

  const buildQuery = () => {
    let query = supabase
      .from("job_posts")
      .select("id, title, pay_pln, pay_type, featured_until, cities(name)")
      .eq("status", "active");
    if (q) query = query.ilike("title", `%${q}%`);
    if (city) query = query.eq("city_id", Number(city));
    return query;
  };

  const { data: featuredJobs } = await buildQuery()
    .gt("featured_until", now)
    .order("featured_until", { ascending: false })
    .limit(5);

  const { data: jobs, error } = await buildQuery()
    .or(`featured_until.is.null,featured_until.lte.${now}`)
    .order("bumped_at", { ascending: false })
    .limit(30);

  if (error) {
    return <p className={ui.errorBox}>No se pudieron cargar las ofertas. Inténtalo de nuevo más tarde.</p>;
  }

  return (
    <>
      <form className="mb-10 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
        <div>
          <label htmlFor="q" className="sr-only">Buscar</label>
          <input id="q" name="q" defaultValue={q} placeholder="Buscar por título" className={ui.input} />
        </div>
        <div>
          <label htmlFor="city" className="sr-only">Ciudad</label>
          <select id="city" name="city" defaultValue={city ?? ""} className={ui.input}>
            <option value="">Todas las ciudades</option>
            {cities?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={ui.button}>Buscar</button>
      </form>

      {featuredJobs && featuredJobs.length > 0 && (
        <section className="mb-10">
          <h2 className={ui.sectionTitle}>Destacadas</h2>
          <ul className="space-y-3">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className={ui.sectionTitle}>Recientes</h2>
        {jobs && jobs.length > 0 ? (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </ul>
        ) : (
          <p className={ui.emptyBox}>Todavía no hay ofertas. Publica la primera.</p>
        )}
      </section>
    </>
  );
}

type Job = {
  id: string;
  title: string;
  pay_pln: number;
  pay_type: string;
  cities: { name: string } | null;
};

function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  return (
    <li className={featured ? ui.cardFeatured : ui.card}>
      {featured && <span className={`${ui.badge} mb-2`}>Destacada</span>}
      <Link
        href={`/jobs/${job.id}`}
        className="block text-base font-semibold text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded dark:text-slate-50"
      >
        {job.title}
      </Link>
      <p className={`mt-1 ${ui.muted}`}>
        {job.cities?.name} · {job.pay_pln} zł / {job.pay_type === "hour" ? "hora" : "proyecto"}
      </p>
    </li>
  );
}
