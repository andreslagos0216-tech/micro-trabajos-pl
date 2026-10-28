"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveCandidate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/perfil");

  const headline = String(formData.get("headline") ?? "").trim().slice(0, 120);
  const experience = String(formData.get("experience") ?? "").trim().slice(0, 2000);
  const availability = String(formData.get("availability") ?? "").trim().slice(0, 120);

  if (headline.length < 3) redirect("/candidato?error=datos");

  const { error } = await supabase
    .from("profiles")
    .update({ headline, experience, availability, is_candidate: true })
    .eq("id", user.id);
  if (error) redirect("/candidato?error=guardar");

  redirect("/candidato?ok=1");
}