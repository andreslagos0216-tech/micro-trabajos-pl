import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export default function JobPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="mb-6 inline-block text-sm text-gray-600 hover:underline">
        ← Volver al listado
      </Link>
      <Suspense fallback={<p className="text-gray-600">Cargando oferta...</p>}>
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
    .select(
      "id, title, description, pay_pln, pay_type, status, featured_until, author_id, cities(name), categories(name)"
    )
    .eq("id", id)
    .single();

  if (!job) notFound();

  const isOwner = user?.id === job.author_id;
  const isFeatured = !!job.featured_until && new Date(job.featured_until) > new Date();

  return (
    <article className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {isFeatured && (
        <span className="inline-block rounded bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-900">
          Destacada
        </span>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {job.cities?.name} · {job.categories?.name} · {job.pay_pln} zł /{" "}
          {job.pay_type === "hour" ? "hora" : "proyecto"}
        </p>
      </div>

      <p className="whitespace-pre-line text-gray-800">{job.description}</p>

      {isOwner && (
        <section className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Tu oferta</p>
          <p className="mt-1">
            Estado: {job.status === "active" ? "activa" : job.status === "paused" ? "pausada" : "cerrada"}
          </p>
          {isFeatured && (
            <p className="mt-1">
              Destacada hasta el {new Date(job.featured_until!).toLocaleDateString("es-ES")}
            </p>
          )}
        </section>
      )}
    </article>
  );
}
