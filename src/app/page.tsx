import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ q?: string; city?: string }>;

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10";

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Ofertas en Polonia</h1>
        <Link
          href="/jobs/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800"
        >
          Publicar oferta
        </Link>
      </div>
      <Suspense fallback={<p className="text-gray-600">Cargando ofertas...</p>}>
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

  const { data: cities } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

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
    return <p className="text-red-600">No se pudieron cargar las ofertas.</p>;
  }

  return (
    <>
      <form className="mb-8 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar trabajo..."
          className={inputClass}
        />
        <select name="city" defaultValue={city ?? ""} className={inputClass}>
          <option value="">Todas las ciudades</option>
          {cities?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-black px-5 py-2 font-semibold text-white shadow hover:bg-gray-800"
        >
          Buscar
        </button>
      </form>

      {featuredJobs && featuredJobs.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Destacadas</h2>
          <ul className="space-y-3">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Recientes</h2>
        {jobs && jobs.length > 0 ? (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
            Todavía no hay ofertas. Publica la primera.
          </p>
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
    <li
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        featured ? "border-yellow-400 ring-1 ring-yellow-300" : "border-gray-200"
      }`}
    >
      {featured && (
        <span className="mb-2 inline-block rounded bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-900">
          Destacada
        </span>
      )}
      <Link href={`/jobs/${job.id}`} className="block text-lg font-semibold text-gray-900 hover:underline">
        {job.title}
      </Link>
      <p className="mt-1 text-sm text-gray-600">
        {job.cities?.name} · {job.pay_pln} zł /{" "}
        {job.pay_type === "hour" ? "hora" : "proyecto"}
      </p>
    </li>
  );
}
