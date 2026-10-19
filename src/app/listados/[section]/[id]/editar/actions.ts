"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateListing(section: string, id: string, formData: FormData) {
  if (section !== "sale" && section !== "rent") throw new Error("Sección no válida");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const description = String(formData.get("description") ?? "").trim().slice(0, 5000);
  if (title.length < 5) throw new Error("El título es demasiado corto");

  if (section === "sale") {
    const condition = String(formData.get("condition"));
    if (!["new", "used", "for_parts"].includes(condition)) throw new Error("Estado no válido");

    const { error } = await supabase
      .from("sale_listings")
      .update({
        title,
        description,
        price_pln: Number(formData.get("price_pln")),
        price_negotiable: formData.get("price_negotiable") === "on",
        condition: condition as "new" | "used" | "for_parts",
      })
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("rental_listings")
      .update({
        title,
        description,
        rent_pln: Number(formData.get("rent_pln")),
        deposit_pln: formData.get("deposit_pln") ? Number(formData.get("deposit_pln")) : null,
        rooms: formData.get("rooms") ? Number(formData.get("rooms")) : null,
        area_m2: formData.get("area_m2") ? Number(formData.get("area_m2")) : null,
        furnished: formData.get("furnished") === "on",
        bills_included: formData.get("bills_included") === "on",
      })
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) throw new Error(error.message);
  }

  redirect(`/listados/${section}/${id}`);
}