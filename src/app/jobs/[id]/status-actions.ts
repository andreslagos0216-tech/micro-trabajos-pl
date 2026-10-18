"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = ["active", "paused", "closed"];

export async function setJobStatus(jobId: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!ALLOWED.includes(status)) throw new Error("Estado no válido");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("job_posts")
    .update({ status })
    .eq("id", jobId)
    .eq("author_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/");
}