"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const REASONS = ["illegal", "discrimination", "scam", "spam", "other"];
type Target = "job" | "sale" | "rent";

export async function reportListing(target: Target, targetId: string, returnPath: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const reason = String(formData.get("reason"));
  if (!REASONS.includes(reason)) throw new Error("Motivo no válido");

  const details = String(formData.get("details") ?? "").trim().slice(0, 500);

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reason,
    details: details || null,
    job_id: target === "job" ? targetId : null,
    sale_listing_id: target === "sale" ? targetId : null,
    rental_listing_id: target === "rent" ? targetId : null,
  });

  if (error) {
    if (error.code === "23505") redirect(`${returnPath}?reported=dup`);
    throw new Error(error.message);
  }

  redirect(`${returnPath}?reported=ok`);
}