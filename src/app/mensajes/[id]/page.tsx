import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { sendMessage } from "../actions";
import { Avatar } from "@/components/avatar";
import { translateText } from "@/lib/translate-text";

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
    .select("id, owner_id, buyer_id, listing_kind, listing_id, is_system")
    .eq("id", id)
    .single();
  if (!conv) notFound();

  const isOwner = conv.owner_id === user.id;
  const isSystem = (conv as { is_system?: boolean }).is_system === true;
  const now = new Date().toISOString();
  await supabase
    .from("conversations")
    .update(isOwner ? { owner_read_at: now } : { buyer_read_at: now })
    .eq("id", id);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_id, original_lang, created_at, is_system")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  const { data: listing } = await supabase
    .from(conv.listing_kind === "job" ? "job_posts" : conv.listing_kind === "sale" ? "sale_listings" : "rental_listings")
    .select("id, title")
    .eq("id", conv.listing_id)
    .single();

  const otherId = (isOwner ? conv.buyer_id : conv.owner_id) ?? "";
  const { data: other } = await supabase.from("profiles").select("full_name").eq("id", otherId).single();
  const otherName = isSystem ? "TaskGo" : other?.full_name || (lang === "pl" ? "Użytkownik" : lang === "en" ? "User" : "Usuario");

  const sendAction = sendMessage.bind(null, id);
  const back = lang === "pl" ? "Wróć do wiadomości" : lang === "en" ? "Back to messages" : "Volver a mensajes";
  const write = lang === "pl" ? "Napisz wiadomość..." : lang === "en" ? "Write a message..." : "Escribe un mensaje...";
  const send = lang === "pl" ? "Wyślij" : lang === "en" ? "Send" : "Enviar";

  return (
    <>
      <Link href="/mensajes" className={`${ui.link} mb-4 inline-block`}>← {back}</Link>
      <header className={`${ui.card} mb-4 flex items-center gap-3`}>
        {isSystem ? <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">T</span> : <Avatar name={otherName} size={44} />}
        <div className="min-w-0 flex-1">
          <Link href={`/usuario/${otherId}`} className="block truncate text-sm font-semibold text-slate-900 hover:underline dark:text-slate-50">
            {otherName}
          </Link>
          {listing && <p className={`truncate text-xs ${ui.muted}`}>{listing.title}</p>}
        </div>
      </header>

      <ul className="space-y-2">
        {await Promise.all((messages ?? []).map(async (m) => {
          const mine = m.sender_id === user.id;
          const shown = m.is_system || m.original_lang === lang ? m.body : await translateText(m.body, m.original_lang as "pl" | "es" | "en", lang);
          const translated = !m.is_system && m.original_lang !== lang;
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"}`}>
                <p className="whitespace-pre-line">{shown}</p>
                {translated && (
                  <p className="mt-1 whitespace-pre-line text-[11px] opacity-70">{m.body}</p>
                )}
              </div>
            </li>
          );
        }))}
      </ul>

      {isSystem ? (
        <p className={`mt-6 text-center text-xs ${ui.muted}`}>Aviso automático de TaskGo. No se puede responder a este mensaje.</p>
      ) : (
      <form action={sendAction} className="sticky bottom-20 mt-6 flex gap-2 md:bottom-4">
        <label htmlFor="body" className="sr-only">{write}</label>
        <input id="body" name="body" required maxLength={1000} placeholder={write} className={`${ui.input} flex-1`} />
        <button type="submit" className={ui.button}>{send}</button>
      </form>
      )}
    </>
  );
}