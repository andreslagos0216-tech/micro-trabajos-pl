"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const KINDS = ["job", "candidate", "service"];
const LANGS = ["pl", "es", "en"];

export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const kind = String(formData.get("kind"));
  const originalLang = String(formData.get("original_lang"));

  if (!KINDS.includes(kind) || !LANGS.includes(originalLang)) {
    throw new Error("Datos no válidos");
  }

  const availability = String(formData.get("availability") ?? "").trim();

  const { data: job, error } = await supabase
    .from("job_posts")
    .insert({
      author_id: user.id,
      kind,
      original_lang: originalLang,
      city_id: Number(formData.get("city_id")),
      category_id: Number(formData.get("category_id")),
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      pay_type: String(formData.get("pay_type")),
      pay_pln: Number(formData.get("pay_pln")),
      availability: availability || null,
      languages: formData.getAll("languages").map(String),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/jobs/${job.id}`);
}
