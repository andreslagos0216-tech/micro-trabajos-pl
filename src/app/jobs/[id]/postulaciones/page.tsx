import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";
import { setApplicationStatus } from "./actions";

type Params = Promise<{ id: string }>;

export default function PostulacionesPage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <Postulaciones params={params} />
      </Suspense>
    </main>
  );
}

async function Postulaciones({ params }: { params: Params }) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase.from("job_posts").select("id, title, author_id").eq("id", id).single();
  if (!job || job.author_id !== user.id) redirect("/");

  const { data: apps } = await supabase
    .from("applications")
    .select("id, message, status, created_at, applicant_id, profiles(full_name, headline, experience, availability, languages)")
    .eq("job_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <Link href={`/jobs/${id}`} className={`${ui.link} mb-4 inline-block`}>← {job.title}</Link>
      <h1 className={ui.title}>Postulaciones ({apps?.length ?? 0})</h1>

      {(apps ?? []).length === 0 ? (
        <p className={`mt-6 ${ui.emptyBox}`}>Todavía no hay postulaciones.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {(apps ?? []).map((a) => {
            const p = a.profiles as unknown as { full_name: string | null; headline: string | null; experience: string | null; availability: string | null; languages: string[] | null } | null;
            return (
              <li key={a.id} className={`${ui.card} space-y-2`}>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{p?.full_name ?? "—"}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p?.headline}</p>
                {p?.availability && <p className={`text-sm ${ui.muted}`}>Disponibilidad: {p.availability}</p>}
                {p?.experience && <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{p.experience}</p>}
                {a.message && <p className="whitespace-pre-line rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">{a.message}</p>}
                <p className={`text-xs ${ui.muted}`}>Estado: {a.status}</p>
                {a.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <form action={setApplicationStatus.bind(null, a.id, id, "accepted")}>
                      <button type="submit" className={ui.button}>Aceptar</button>
                    </form>
                    <form action={setApplicationStatus.bind(null, a.id, id, "rejected")}>
                      <button type="submit" className={ui.buttonSecondary}>Rechazar</button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}