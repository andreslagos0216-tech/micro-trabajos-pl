"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SALE_STATUS = ["active", "paused", "closed", "sold"];
const RENT_STATUS = ["active", "paused", "closed", "rented"];

export async function setListingStatus(section: string, id: string, formData: FormData) {
  if (section !== "sale" && section !== "rent") throw new Error("Sección no válida");
  const status = String(formData.get("status"));
  const allowed = section === "sale" ? SALE_STATUS : RENT_STATUS;
  if (!allowed.includes(status)) throw new Error("Estado no válido");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (section === "sale") {
    const { error } = await supabase
      .from("sale_listings")
      .update({ status: status as "active" })
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("rental_listings")
      .update({ status: status as "active" })
      .eq("id", id)
      .eq("author_id", user.id);
    if (error) throw new Error(error.message);
  }

  redirect(`/listados/${section}/${id}`);
}

export async function deleteListing(section: string, id: string) {
  if (section !== "sale" && section !== "rent") throw new Error("Sección no válida");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const table = section === "sale" ? "sale_listings" : "rental_listings";
  const { error } = await supabase.from(table as "sale_listings").delete().eq("id", id).eq("author_id", user.id);
  if (error) throw new Error(error.message);

  redirect("/perfil");
}