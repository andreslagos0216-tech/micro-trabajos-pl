"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LANGS = ["pl", "es", "en"];
const LEVELS = ["basic", "medium", "advanced", "native"];
const CONTACTS = ["chat", "whatsapp", "both"];

export async function createListing(formData: FormData) {
  const section = String(formData.get("section"));
  if (section !== "sale" && section !== "rent") throw new Error("Sección no válida");

  const originalLang = String(formData.get("original_lang"));
  if (!LANGS.includes(originalLang)) throw new Error("Idioma no válido");

  const contact = String(formData.get("contact_method") ?? "chat");
  if (!CONTACTS.includes(contact)) throw new Error("Forma de contacto no válida");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const categoryId = Number(formData.get("category_id"));
  const localityId = Number(formData.get("locality_id"));
  if (!categoryId) throw new Error("Selecciona una categoría");
  if (!localityId) throw new Error("Selecciona una localidad de la lista");

  const { data: loc } = await supabase
    .from("localities")
    .select("lat, lng")
    .eq("id", localityId)
    .single();
  if (!loc) throw new Error("La localidad no existe");

  const languages: { code: string; level: string }[] = [];
  for (const code of LANGS) {
    if (formData.get(`lang_${code}`) !== "on") continue;
    const level = String(formData.get(`level_${code}`) ?? "basic");
    languages.push({ code, level: LEVELS.includes(level) ? level : "basic" });
  }

  const customCategory = String(formData.get("custom_category") ?? "").trim();

  const common = {
    author_id: user.id,
    category_id: categoryId,
    locality_id: localityId,
    original_lang: originalLang,
    custom_category: customCategory || null,
    contact_method: contact,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    lat: loc.lat,
    lng: loc.lng,
  };

  if (section === "sale") {
    const attributes: Record<string, string | number | boolean> = {};
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("attr_")) continue;
      const name = key.slice(5);
      const raw = String(value).trim();
      if (raw === "on") attributes[name] = true;
      else if (raw !== "") attributes[name] = /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
    }

    const { data: row, error } = await supabase
      .from("sale_listings")
      .insert({
        ...common,
        price_pln: Number(formData.get("price_pln")),
        price_negotiable: formData.get("price_negotiable") === "on",
        condition: String(formData.get("condition")) as "new" | "used" | "for_parts",
        attributes,
        languages,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    redirect(`/listados/sale/${row.id}`);
  }

  const { data: row, error } = await supabase
    .from("rental_listings")
    .insert({
      ...common,
      rent_pln: Number(formData.get("rent_pln")),
      deposit_pln: formData.get("deposit_pln") ? Number(formData.get("deposit_pln")) : null,
      rooms: formData.get("rooms") ? Number(formData.get("rooms")) : null,
      area_m2: formData.get("area_m2") ? Number(formData.get("area_m2")) : null,
      furnished: formData.get("furnished") === "on",
      bills_included: formData.get("bills_included") === "on",
      languages,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/listados/rent/${row.id}`);
}