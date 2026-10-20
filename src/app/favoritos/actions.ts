"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const KINDS = ["job", "sale", "rent"] as const;
type Kind = (typeof KINDS)[number];

export async function toggleFavorite(kind: Kind, listingId: string, path: string) {
  if (!KINDS.includes(kind) || !/^[0-9a-f-]{36}$/i.test(listingId)) throw new Error("Datos no válidos");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "login" as const };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_kind", kind)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, listing_kind: kind, listing_id: listingId });
    if (error) throw new Error(error.message);
  }

  revalidatePath(path);
  return { ok: true, saved: !existing };
}