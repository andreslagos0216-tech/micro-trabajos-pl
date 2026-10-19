"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LANGS = ["pl", "es", "en"];

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 80);
  const phone = String(formData.get("phone") ?? "").replace(/[^\d+\s-]/g, "").trim().slice(0, 20);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500);
  const languages = formData.getAll("languages").map(String).filter((l) => LANGS.includes(l));
  const localityRaw = String(formData.get("locality_id") ?? "");
  const showPhone = formData.get("show_phone") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      bio: bio || null,
      languages,
      show_phone: showPhone,
      ...(localityRaw ? { locality_id: Number(localityRaw) } : {}),
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  const { error: contactError } = await supabase.from("profile_contacts").upsert({
    profile_id: user.id,
    phone: phone || null,
    updated_at: new Date().toISOString(),
  });
  if (contactError) throw new Error(contactError.message);

  redirect("/perfil?saved=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}