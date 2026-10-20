"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";

const TABLES = { job: "job_posts", sale: "sale_listings", rent: "rental_listings" } as const;
type Kind = keyof typeof TABLES;

// Abre (o reutiliza) la conversación entre el comprador y el anunciante
export async function openConversation(kind: Kind, listingId: string, formData: FormData) {
  if (!(kind in TABLES) || !/^[0-9a-f-]{36}$/i.test(listingId)) throw new Error("Datos no válidos");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/perfil?chat=confirmar");

  const table = TABLES[kind] as "job_posts";
  const { data: listing } = await supabase.from(table).select("author_id").eq("id", listingId).single();
  if (!listing) throw new Error("El anuncio no existe");
  if (listing.author_id === user.id) redirect(`/mensajes`);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_kind", kind)
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  let conversationId = existing?.id;
  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        listing_kind: kind,
        listing_id: listingId,
        owner_id: listing.author_id,
        buyer_id: user.id,
        owner_read_at: null,
        buyer_read_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    conversationId = created.id;
  }

  const firstMessage = String(formData.get("body") ?? "").trim();
  if (firstMessage) await sendMessageTo(conversationId, firstMessage);

  redirect(`/mensajes/${conversationId}`);
}

export async function sendMessage(conversationId: string, formData: FormData) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) throw new Error("Datos no válidos");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await sendMessageTo(conversationId, body);
  revalidatePath(`/mensajes/${conversationId}`);
}

async function sendMessageTo(conversationId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/perfil?chat=confirmar");

  const lang = await getLang();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: body.slice(0, 1000),
    original_lang: lang,
  });
  if (error) throw new Error(error.message);

  const now = new Date().toISOString();
  await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);
}