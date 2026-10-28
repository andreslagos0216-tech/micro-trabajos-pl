"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function applyToJob(jobId: string, formData: FormData) {
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) throw new Error("Datos no válidos");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect(`/jobs/${jobId}?error=confirmar`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("headline, experience")
    .eq("id", user.id)
    .single();
  if (!profile?.headline || !profile?.experience) redirect(`/candidato?error=completar`);

  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);

  const { data: job } = await supabase
    .from("job_posts")
    .select("author_id, status")
    .eq("id", jobId)
    .single();
  if (!job || job.status !== "active") throw new Error("La oferta no está disponible");
  if (job.author_id === user.id) redirect(`/jobs/${jobId}`);

  const { error } = await supabase
    .from("applications")
    .insert({ job_id: jobId, applicant_id: user.id, message: message || null, status: "pending" });

  if (error && error.code !== "23505") throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}?postulado=1`);
}