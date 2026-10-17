import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ q?: string; city?: string }>;

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Ofertas en Polonia</h1>
      <Suspense fallback={<p className="text-gray-600">Cargando ofertas...</p>}>
        <JobsFeed searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function JobsFeed({ searchParams }: { searchParams: SearchParams }) {
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
      <form className="mb-6 flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar trabajo..."
          className="flex-1 rounded border px-3 py-2"
        />
        <select
          name="city"
          defaultValue={city ?? ""}
          className="rounded border px-3 py-2"
        >
          <option value="">Todas las ciudades</option>
          {cities?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">Buscar</button>
      </form>

      {featuredJobs && featuredJobs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Destacadas</h2>
          <ul className="space-y-3">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recientes</h2>
        {jobs && jobs.length > 0 ? (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Todavía no hay ofertas. Publica la primera.</p>
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
    <li className={`rounded border p-4 ${featured ? "border-yellow-400 bg-yellow-50" : ""}`}>
      {featured && (
        <span className="mb-1 inline-block rounded bg-yellow-200 px-2 py-0.5 text-xs font-semibold">
          Destacada
        </span>
      )}
      <Link href={`/jobs/${job.id}`} className="block font-semibold hover:underline">
        {job.title}
      </Link>
      <p className="text-sm text-gray-600">
        {job.cities?.name} · {job.pay_pln} PLN /{" "}
        {job.pay_type === "hour" ? "hora" : "proyecto"}
      </p>
    </li>
  );
}
