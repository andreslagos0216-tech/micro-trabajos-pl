import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

export default function SavedPage() {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <Saved />
      </Suspense>
    </main>
  );
}

async function Saved() {
  await connection();
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favs } = await supabase
    .from("favorites")
    .select("listing_kind, listing_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const title = lang === "pl" ? "Zapisane" : lang === "en" ? "Saved" : "Guardados";
  const empty = lang === "pl" ? "Nie masz jeszcze zapisanych ogłoszeń. Naciśnij ♡ przy ogłoszeniu." : lang === "en" ? "You have no saved listings yet. Tap ♡ on a listing." : "Todavía no tienes guardados. Pulsa ♡ en un anuncio.";
  const statusText: Record<string, string> = { active: lang === "es" ? "Activo" : lang === "en" ? "Active" : "Aktywne", paused: lang === "es" ? "Pausado" : lang === "en" ? "Paused" : "Wstrzymane", closed: lang === "es" ? "Cerrado" : lang === "en" ? "Closed" : "Zamknięte", sold: lang === "es" ? "Vendido" : lang === "en" ? "Sold" : "Sprzedane", rented: lang === "es" ? "Alquilado" : lang === "en" ? "Rented" : "Wynajęte", pending_review: lang === "es" ? "En revisión" : lang === "en" ? "Under review" : "W weryfikacji" };

  const items = await Promise.all(
    (favs ?? []).map(async (f) => {
      const table = f.listing_kind === "job" ? "job_posts" : f.listing_kind === "sale" ? "sale_listings" : "rental_listings";
      const { data } = await supabase.from(table).select("id, title, status").eq("id", f.listing_id).maybeSingle();
      const href = f.listing_kind === "job" ? `/jobs/${f.listing_id}` : `/listados/${f.listing_kind}/${f.listing_id}`;
      return { key: `${f.listing_kind}-${f.listing_id}`, title: data?.title ?? "—", status: data?.status ?? "closed", href };
    })
  );

  return (
    <>
      <h1 className={ui.title}>{title}</h1>
      {items.length === 0 ? (
        <p className={`mt-6 ${ui.emptyBox}`}>{empty}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className={`${ui.card} block transition active:scale-[0.99]`}>
                <span className={ui.badgeNeutral}>{statusText[i.status] ?? i.status}</span>
                <span className="mt-2 block truncate text-base font-semibold text-slate-900 dark:text-slate-50">{i.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}