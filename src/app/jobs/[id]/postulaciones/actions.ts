"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setApplicationStatus(appId: string, jobId: string, status: "accepted" | "rejected") {
  if (!/^[0-9a-f-]{36}$/i.test(appId) || !/^[0-9a-f-]{36}$/i.test(jobId)) throw new Error("Datos no válidos");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase.from("job_posts").select("author_id").eq("id", jobId).single();
  if (!job || job.author_id !== user.id) redirect("/");

  const { error } = await supabase.from("applications").update({ status }).eq("id", appId).eq("job_id", jobId);
  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}/postulaciones`);
}