"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteJob(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("job_posts").delete().eq("id", jobId).eq("author_id", user.id);
  if (error) throw new Error(error.message);

  redirect("/perfil");
}