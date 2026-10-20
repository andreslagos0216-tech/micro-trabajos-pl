import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { sendMessage } from "../actions";

type Params = Promise<{ id: string }>;

export default function ConversationPage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <Conversation params={params} />
      </Suspense>
    </main>
  );
}

async function Conversation({ params }: { params: Params }) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, owner_id, buyer_id, listing_kind, listing_id")
    .eq("id", id)
    .single();
  if (!conv) notFound();

  const isOwner = conv.owner_id === user.id;
  const now = new Date().toISOString();
  await supabase
    .from("conversations")
    .update(isOwner ? { owner_read_at: now } : { buyer_read_at: now })
    .eq("id", id);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_id, original_lang, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  const { data: listing } = await supabase
    .from(conv.listing_kind === "job" ? "job_posts" : conv.listing_kind === "sale" ? "sale_listings" : "rental_listings")
    .select("id, title")
    .eq("id", conv.listing_id)
    .single();

  const sendAction = sendMessage.bind(null, id);
  const back = lang === "pl" ? "Wróć do wiadomości" : lang === "en" ? "Back to messages" : "Volver a mensajes";
  const write = lang === "pl" ? "Napisz wiadomość..." : lang === "en" ? "Write a message..." : "Escribe un mensaje...";
  const send = lang === "pl" ? "Wyślij" : lang === "en" ? "Send" : "Enviar";

  return (
    <>
      <Link href="/mensajes" className={`${ui.link} mb-4 inline-block`}>← {back}</Link>
      {listing && (
        <p className={`mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100`}>{listing.title}</p>
      )}

      <ul className="space-y-2">
        {(messages ?? []).map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"}`}>
                <p className="whitespace-pre-line">{m.body}</p>
                {m.original_lang !== lang && (
                  <p className="mt-1 text-[11px] opacity-70">{m.original_lang.toUpperCase()}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <form action={sendAction} className="sticky bottom-20 mt-6 flex gap-2 md:bottom-4">
        <label htmlFor="body" className="sr-only">{write}</label>
        <input id="body" name="body" required maxLength={1000} placeholder={write} className={`${ui.input} flex-1`} />
        <button type="submit" className={ui.button}>{send}</button>
      </form>
    </>
  );
}