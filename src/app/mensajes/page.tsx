import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

export default function MessagesPage() {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <Inbox />
      </Suspense>
    </main>
  );
}

async function Inbox() {
  await connection();
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("conversations")
    .select("id, last_message_at, owner_id, buyer_id, owner_read_at, buyer_read_at, listing_kind")
    .or(`owner_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })
    .limit(100);

  const title = lang === "pl" ? "Wiadomości" : lang === "en" ? "Messages" : "Mensajes";
  const empty = lang === "pl" ? "Nie masz jeszcze wiadomości." : lang === "en" ? "You have no messages yet." : "Todavía no tienes mensajes.";

  return (
    <>
      <h1 className={ui.title}>{title}</h1>
      {(rows ?? []).length === 0 ? (
        <p className={`mt-6 ${ui.emptyBox}`}>{empty}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {(rows ?? []).map((c) => {
            const isOwner = c.owner_id === user.id;
            const unread = isOwner ? !c.owner_read_at : !c.buyer_read_at;
            return (
              <li key={c.id}>
                <Link href={`/mensajes/${c.id}`} className={`${ui.card} flex items-center justify-between gap-3`}>
                  <span className="text-sm text-slate-800 dark:text-slate-200">
                    {isOwner ? "→" : "←"} {new Date(c.last_message_at).toLocaleString(lang === "pl" ? "pl-PL" : lang === "en" ? "en-GB" : "es-ES", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" aria-label="nuevo" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}