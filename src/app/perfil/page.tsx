import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang, type Lang } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { listingsText } from "@/lib/listings-i18n";
import { profileText } from "@/lib/profile-i18n";
import { ui } from "@/lib/ui";
import { LocalityPicker } from "@/components/locality-picker";
import { updateProfile, signOut } from "./actions";

type SearchParams = Promise<{ saved?: string }>;
type Item = { id: string; title: string; status: string; href: string; label: string };

const LANG_OPTIONS: Lang[] = ["pl", "es", "en"];

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
  const t = profileText[lang];
  const l = listingsText[lang];
  const { saved } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, languages, is_verified, created_at, localities(name)")
    .eq("id", user.id)
    .single();

  const { data: contact } = await supabase.from("profile_contacts").select("phone").eq("profile_id", user.id).maybeSingle();
  const [jobs, sales, rents] = await Promise.all([
    supabase.from("job_posts").select("id, title, status, kind").eq("author_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("sale_listings").select("id, title, status").eq("author_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("rental_listings").select("id, title, status").eq("author_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);

  const statusText = (s: string) =>
    s === "active" ? t.statusActive
      : s === "paused" ? t.statusPaused
      : s === "sold" || s === "rented" ? t.statusDone
      : t.statusClosed;

  const listings: Item[] = [
    ...(jobs.data ?? []).map((j) => ({ id: j.id, title: j.title, status: j.status, href: `/jobs/${j.id}`, label: kindDict[lang][j.kind as Kind].badge })),
    ...(sales.data ?? []).map((s) => ({ id: s.id, title: s.title, status: s.status, href: `/listados/sale/${s.id}`, label: l.sale })),
    ...(rents.data ?? []).map((r) => ({ id: r.id, title: r.title, status: r.status, href: `/listados/rent/${r.id}`, label: l.rent })),
  ];

  const currentLocality = (profile?.localities as unknown as { name: string } | null)?.name;
  const languages: string[] = profile?.languages ?? [];
  const langName: Record<Lang, string> = { pl: t.langPl, es: t.langEs, en: t.langEn };
  return (
    <>
      <h1 className={ui.title}>{t.profileTitle}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.profileSubtitle}</p>

      {saved === "1" && (
        <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          {t.saved}
        </p>
      )}

      <section className={`${ui.card} mb-8 space-y-2`}>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{profile?.full_name || user.email}</p>
        <p className={`text-sm ${ui.muted}`}>{t.email}: {user.email}</p>
        <p className={`text-sm ${ui.muted}`}>
          {profile?.is_verified ? t.verified : t.notVerified} · {t.memberSince}{" "}
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(t.locale) : ""}
        </p>
      </section>

      <section className={`${ui.card} mb-8`}>
        <h2 className={ui.sectionTitle}>{t.dataTitle}</h2>
        <form action={updateProfile} className="space-y-5">
          <div>
            <label htmlFor="full_name" className={ui.label}>{t.nameLabel}</label>
            <input id="full_name" name="full_name" maxLength={80} defaultValue={profile?.full_name ?? ""} className={ui.input} />
          </div>
          <div>
            <label htmlFor="phone" className={ui.label}>{t.phoneLabel}</label>
            <input id="phone" name="phone" maxLength={20} defaultValue={contact?.phone ?? ""} className={ui.input} />
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
            <LocalityPicker name="locality_id" label={t.localityLabel} placeholder={l.localityPlaceholder} noResults={l.localityNoResults} />
          </div>
          <button type="submit" className={ui.button}>{t.save}</button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className={ui.sectionTitle}>{t.myListings}</h2>
        {listings.length === 0 ? (
          <p className={ui.emptyBox}>{t.noListings}</p>
        ) : (
          <ul className="space-y-3">
            {listings.map((item) => (
              <li key={item.href} className={ui.card}>
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
      <section className={`${ui.card} space-y-3`}>
        <h2 className={ui.sectionTitle}>{t.session}</h2>
        <form action={signOut}>
          <button type="submit" className={ui.buttonSecondary}>{t.logout}</button>
        </form>
      </section>
    </>
  );
}