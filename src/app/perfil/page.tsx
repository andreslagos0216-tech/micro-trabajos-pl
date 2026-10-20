import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { perfilText } from "@/lib/perfil-text";
import { ui } from "@/lib/ui";
import { LocalityPicker } from "@/components/locality-picker";
import { updateProfile, signOut } from "./actions";

type SearchParams = Promise<{ saved?: string }>;

const LANG_OPTIONS = ["pl", "es", "en"] as const;

export default function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <ProfileContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ProfileContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = perfilText[lang];
  const { saved } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, languages, is_verified, created_at, show_phone, localities(name)")
    .eq("id", user.id)
    .single();

  const { data: contact } = await supabase
    .from("profile_contacts")
    .select("phone")
    .eq("profile_id", user.id)
    .maybeSingle();

  const [jobs, sales, rents, apps] = await Promise.all([
    supabase.from("job_posts").select("id, title, status").eq("author_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("sale_listings").select("id, title, status").eq("author_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("rental_listings").select("id, title, status").eq("author_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("applications").select("id, status, created_at, job_posts(id, title)").eq("applicant_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);

  const statusText = (s: string) =>
    s === "active" ? t.active
      : s === "paused" ? t.paused
      : s === "sold" || s === "rented" ? t.done
      : s === "pending_review" ? t.review
      : t.closed;

  const listings = [
    ...(jobs.data ?? []).map((j) => ({ key: `job-${j.id}`, title: j.title, status: j.status, href: `/jobs/${j.id}`, label: "Empleo" })),
    ...(sales.data ?? []).map((s) => ({ key: `sale-${s.id}`, title: s.title, status: s.status, href: `/listados/sale/${s.id}`, label: t.saleLabel })),
    ...(rents.data ?? []).map((r) => ({ key: `rent-${r.id}`, title: r.title, status: r.status, href: `/listados/rent/${r.id}`, label: t.rentLabel })),
  ];

  const appStatus: Record<string, string> = {
    pending: t.appPending,
    accepted: t.appAccepted,
    rejected: t.appRejected,
  };

  const currentLocality = (profile?.localities as unknown as { name: string } | null)?.name;
  const languages: string[] = profile?.languages ?? [];
  const langName: Record<(typeof LANG_OPTIONS)[number], string> = { pl: "Polski", es: "Español", en: "English" };

  return (
    <>
      <h1 className={ui.title}>{t.title}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.subtitle}</p>

      {saved === "1" && (
        <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          {t.saved}
        </p>
      )}

      <section className={`${ui.card} mb-6 space-y-2`}>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{profile?.full_name || user.email}</p>
        <p className={`text-sm ${ui.muted}`}>{t.email}: {user.email}</p>
        <p className={`text-sm ${ui.muted}`}>
          {profile?.is_verified ? `✓ ${t.verified}` : t.notVerified} · {t.memberSince}{" "}
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(t.locale) : ""}
        </p>
        <Link href={`/usuario/${user.id}`} className={ui.link}>{t.publicProfile}</Link>
      </section>

      <details className={`${ui.card} mb-6`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-base font-semibold text-slate-900 dark:text-slate-50">{t.dataTitle}</span>
            <span className={`block text-xs ${ui.muted}`}>{profile?.full_name ?? ""}{currentLocality ? ` · ${currentLocality}` : ""}</span>
          </span>
          <span className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">Editar ▾</span>
        </summary>
        <form action={updateProfile} className="mt-6 space-y-5">
          <div>
            <label htmlFor="full_name" className={ui.label}>{t.nameLabel}</label>
            <input id="full_name" name="full_name" maxLength={80} defaultValue={profile?.full_name ?? ""} className={ui.input} />
          </div>

          <div>
            <label htmlFor="phone" className={ui.label}>{t.phoneLabel}</label>
            <input id="phone" name="phone" maxLength={20} defaultValue={contact?.phone ?? ""} className={ui.input} />
            <p className={`mt-1 text-xs ${ui.muted}`}>{t.phoneHint}</p>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <input type="checkbox" name="show_phone" defaultChecked={!!profile?.show_phone} className="h-4 w-4 accent-blue-700" />
              {t.showPhone}
            </label>
          </div>

          <div>
            <label htmlFor="bio" className={ui.label}>{t.bioLabel}</label>
            <textarea id="bio" name="bio" rows={4} maxLength={500} defaultValue={profile?.bio ?? ""} className={ui.input} />
          </div>

          <fieldset>
            <legend className={ui.label}>{t.languagesLabel}</legend>
            <div className="flex flex-wrap gap-5 text-sm text-slate-800 dark:text-slate-200">
              {LANG_OPTIONS.map((code) => (
                <label key={code} className="flex items-center gap-2">
                  <input type="checkbox" name="languages" value={code} defaultChecked={languages.includes(code)} className="h-4 w-4 accent-blue-700" />
                  {langName[code]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <p className={`mb-2 text-sm ${ui.muted}`}>{t.currentLocality}: {currentLocality ?? "—"}</p>
            <LocalityPicker name="locality_id" label={t.localityLabel} placeholder="Ej.: Kamienna Góra" noResults="No encontrada" />
          </div>

          <button type="submit" className={ui.button}>{t.save}</button>
        </form>
      </details>

      <section className="mb-6">
        <h2 className={ui.sectionTitle}>{t.myListings}</h2>
        {listings.length === 0 ? (
          <p className={ui.emptyBox}>{t.noListings}</p>
        ) : (
          <ul className="space-y-3">
            {listings.map((item) => (
              <li key={item.key} className={ui.card}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={ui.badgeNeutral}>{item.label}</span>
                  <span className={ui.badgeNeutral}>{statusText(item.status)}</span>
                </div>
                <Link href={item.href} className="mt-2 block text-base font-semibold text-slate-900 hover:underline dark:text-slate-50">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className={ui.sectionTitle}>{t.myApplications}</h2>
        {(apps.data ?? []).length === 0 ? (
          <p className={ui.emptyBox}>{t.noApplications}</p>
        ) : (
          <ul className="space-y-3">
            {(apps.data ?? []).map((a) => {
              const job = a.job_posts as unknown as { id: string; title: string } | null;
              return (
                <li key={a.id} className={ui.card}>
                  <span className={ui.badgeNeutral}>{appStatus[a.status] ?? a.status}</span>
                  {job && (
                    <Link href={`/jobs/${job.id}`} className="mt-2 block text-base font-semibold text-slate-900 hover:underline dark:text-slate-50">
                      {job.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`${ui.card} space-y-3`}>
        <h2 className={ui.sectionTitle}>{t.session}</h2>
        <Link href="/guardados" className={ui.buttonSecondary}>♥ Guardados</Link>
        {isAdmin && <Link href="/admin" className={ui.buttonSecondary}>{t.admin}</Link>}
        <form action={signOut}>
          <button type="submit" className={ui.buttonSecondary}>{t.logout}</button>
        </form>
      </section>
    </>
  );
}