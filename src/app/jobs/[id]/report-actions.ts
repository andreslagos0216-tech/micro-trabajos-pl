"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const REASONS = ["illegal", "discrimination", "scam", "spam", "other"];

export async function reportJob(jobId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const reason = String(formData.get("reason"));
  if (!REASONS.includes(reason)) {
    throw new Error("Motivo no válido");
  }

  const details = String(formData.get("details") ?? "").trim().slice(0, 500);

  const { error } = await supabase.from("reports").insert({
    job_id: jobId,
    reporter_id: user.id,
    reason,
    details: details || null,
  });

  if (error) {
    // 23505 = ya existe una denuncia de este usuario para este anuncio
    if (error.code === "23505") redirect(`/jobs/${jobId}?reported=dup`);
    throw new Error(error.message);
  }

  redirect(`/jobs/${jobId}?reported=ok`);
}
