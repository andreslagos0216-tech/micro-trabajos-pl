import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { Avatar } from "@/components/avatar";

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

  const cols = "id, last_message_at, owner_id, buyer_id, owner_read_at, buyer_read_at, listing_kind";
  const profileIds = new Set<string>();
  const [asOwner, asBuyer] = await Promise.all([
    supabase.from("conversations").select(cols).eq("owner_id", user.id).order("last_message_at", { ascending: false }).limit(100),
    supabase.from("conversations").select(cols).eq("buyer_id", user.id).order("last_message_at", { ascending: false }).limit(100),
  ]);
  const { data: systemRows } = await supabase
    .from("conversations")
    .select(cols)
    .eq("owner_id", user.id)
    .eq("is_system", true)
    .order("last_message_at", { ascending: false })
    .limit(1);
  const rows = [...(asOwner.data ?? []), ...(asBuyer.data ?? [])]
    .filter((c) => !(c as { is_system?: boolean }).is_system)
    .concat(systemRows ?? [])
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));

  const otherIds = [...new Set((rows ?? []).map((c) => (c.owner_id === user.id ? c.buyer_id : c.owner_id)).filter((x): x is string => !!x))];
  const { data: people } = otherIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", otherIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameOf = new Map((people ?? []).map((p) => [p.id, p.full_name]));

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
            const otherId = (isOwner ? c.buyer_id : c.owner_id) ?? "";
            const isSystem = (c as { is_system?: boolean }).is_system === true;
            const otherName = isSystem ? "TaskGo" : nameOf.get(otherId) || (lang === "pl" ? "Użytkownik" : lang === "en" ? "User" : "Usuario");
            return (
              <li key={c.id}>
                <Link href={`/mensajes/${c.id}`} className={`${ui.card} flex items-center gap-3 transition active:scale-[0.99]`}>
                  {isSystem ? <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">T</span> : <Avatar name={otherName} size={44} />}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${unread ? "font-bold text-slate-900 dark:text-slate-50" : "font-semibold text-slate-800 dark:text-slate-200"}`}>{otherName}</span>
                    <span className={`block text-xs ${ui.muted}`}>{new Date(c.last_message_at).toLocaleString(lang === "pl" ? "pl-PL" : lang === "en" ? "en-GB" : "es-ES", { dateStyle: "short", timeStyle: "short" })}</span>
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