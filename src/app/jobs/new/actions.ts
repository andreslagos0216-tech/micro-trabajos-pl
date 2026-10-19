"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { reviewStatus } from "@/lib/moderation";

const KINDS = ["job", "candidate", "service"];
const LANGS = ["pl", "es", "en"];
const LEVELS = ["basic", "medium", "advanced", "native"];
const CONTACTS = ["chat", "whatsapp", "both"];

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

  const localityId = Number(formData.get("locality_id"));
  if (!localityId) throw new Error("Selecciona una localidad de la lista");

  const categoryId = Number(formData.get("category_id"));
  if (!categoryId) throw new Error("Selecciona una categoría");

  const contact = String(formData.get("contact_method") ?? "chat");
  if (!CONTACTS.includes(contact)) throw new Error("Forma de contacto no válida");

  const { data: loc } = await supabase
    .from("localities")
    .select("lat, lng")
    .eq("id", localityId)
    .single();

  const languages: { code: string; level: string }[] = [];
  for (const code of LANGS) {
    if (formData.get(`lang_${code}`) !== "on") continue;
    const level = String(formData.get(`level_${code}`) ?? "basic");
    languages.push({ code, level: LEVELS.includes(level) ? level : "basic" });
  }

  const availability = String(formData.get("availability") ?? "").trim();
  const customCategory = String(formData.get("custom_category") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const review = await reviewStatus(supabase, user.id, `${title}\n${description}\n${customCategory}`, {
    needsPhotos: false,
    photoCount: 0,
  });

  const payAgreed = formData.get("pay_agreed") === "on";
  const payRaw = Number(formData.get("pay_pln"));

  const { data: job, error } = await supabase
    .from("job_posts")
    .insert({
      author_id: user.id,
      kind,
      original_lang: originalLang,
      locality_id: localityId,
      category_id: categoryId,
      custom_category: customCategory || null,
      title,
      description,
      pay_type: String(formData.get("pay_type")),
      pay_pln: payAgreed ? null : payRaw,
      pay_agreed: payAgreed,
      availability: availability || null,
      languages,
      contact_method: contact,
      lat: loc?.lat ?? null,
      lng: loc?.lng ?? null,
      status: review.status,
      review_note: review.reasons.join(",") || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/jobs/${job.id}`);
}