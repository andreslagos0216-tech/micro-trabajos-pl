"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email_confirmed_at) redirect("/login");

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) redirect("/perfil?logo=vacio");
  if (!TYPES.includes(file.type)) redirect("/perfil?logo=tipo");
  if (file.size > MAX_BYTES) redirect("/perfil?logo=tamano");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `company-logos/${user.id}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("listing-photos")
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (upErr) redirect("/perfil?logo=error");

  const publicUrl = supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
  const { error } = await supabase.from("profiles").update({ logo_url: `${publicUrl}?v=${Date.now()}` }).eq("id", user.id);
  if (error) redirect("/perfil?logo=error");

  revalidatePath("/perfil");
  redirect("/perfil?logo=ok");
}