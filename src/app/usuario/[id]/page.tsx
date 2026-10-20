import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLang } from "@/lib/i18n";
import { formatDate, formatDateTime } from "@/lib/format";
import { perfilText } from "@/lib/perfil-text";
import { ui } from "@/lib/ui";

type Params = Promise<{ id: string }>;

export default function PublicProfilePage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <PublicProfileContent params={params} />
      </Suspense>
    </main>
  );
}

async function PublicProfileContent({ params }: { params: Params }) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const lang = await getLang();
  const t = perfilText[lang];

  const supabase = await createClient();
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, bio, languages, is_verified, created_at, show_phone, localities(name)")
    .eq("id", id)
    .single();
  if (!profile) notFound();

  const [jobs, sales, rents] = await Promise.all([
    supabase.from("job_posts").select("id, title, pay_pln, pay_agreed, pay_type").eq("author_id", id).eq("status", "active").order("bumped_at", { ascending: false }).limit(20),
    supabase.from("sale_listings").select("id, title, price_pln").eq("author_id", id).eq("status", "active").order("bumped_at", { ascending: false }).limit(20),
    supabase.from("rental_listings").select("id, title, rent_pln").eq("author_id", id).eq("status", "active").order("bumped_at", { ascending: false }).limit(20),
  ]);

  const items = [
    ...(jobs.data ?? []).map((j) => ({ key: `job-${j.id}`, title: j.title, href: `/jobs/${j.id}`, price: j.pay_agreed ? "—" : `${j.pay_pln} zł` })),
    ...(sales.data ?? []).map((s) => ({ key: `sale-${s.id}`, title: s.title, href: `/listados/sale/${s.id}`, price: `${s.price_pln} zł` })),
    ...(rents.data ?? []).map((r) => ({ key: `rent-${r.id}`, title: r.title, href: `/listados/rent/${r.id}`, price: `${r.rent_pln} zł / ${t.locale.startsWith("es") ? "mes" : t.locale.startsWith("en") ? "month" : "mies."}` })),
  ];

  let phone: string | null = null;
  if (profile.show_phone) {
    const admin = createAdminClient();
    const { data: contact } = await admin
      .from("profile_contacts")
      .select("phone")
      .eq("profile_id", id)
      .maybeSingle();
    phone = contact?.phone ?? null;
  }

  const digits = (phone ?? "").replace(/\D/g, "");
  const waNumber = digits.length === 9 ? `48${digits}` : digits;
  const locality = (profile.localities as unknown as { name: string } | null)?.name;
  const isOwner = viewer?.id === id;
  const languages: string[] = profile.languages ?? [];

  return (
    <>
      <section className={`${ui.card} mb-6 space-y-2`}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {profile.full_name || t.anonymous}
        </h1>
        <p className={`text-sm ${ui.muted}`}>
          {locality ?? "—"}
          {" · "}
          {profile.is_verified ? `✓ ${t.verified}` : t.notVerified}
          {" · "}
          {t.memberSince} {profile.created_at ? formatDate(profile.created_at, lang) : ""}
        </p>
        {profile.bio && <p className="whitespace-pre-line text-sm text-slate-800 dark:text-slate-200">{profile.bio}</p>}
        {languages.length > 0 && <p className={`text-sm ${ui.muted}`}>{t.languagesLabel}: {languages.map((x) => x.toUpperCase()).join(", ")}</p>}

        <div className="pt-2">
          {phone && waNumber ? (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={ui.button}
            >
              {t.whatsapp}
            </a>
          ) : (
            <p className={`text-sm ${ui.muted}`}>{t.noShare}</p>
          )}
        </div>

        {isOwner && (
          <Link href="/perfil" className={ui.link}>{t.title}</Link>
        )}
      </section>

      <section>
        <h2 className={ui.sectionTitle}>{t.listingsTitle}</h2>
        {items.length === 0 ? (
          <p className={ui.emptyBox}>{t.noActive}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.key} className={ui.card}>
                <Link href={item.href} className="block text-base font-semibold text-slate-900 hover:underline dark:text-slate-50">
                  {item.title}
                </Link>
                <p className={`mt-1 text-sm ${ui.muted}`}>{item.price}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}