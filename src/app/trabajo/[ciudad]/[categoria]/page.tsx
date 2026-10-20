import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import type { Metadata } from "next";

type Params = Promise<{ ciudad: string; categoria: string }>;

const CATEGORIAS: Record<string, { slug: string[]; es: string; pl: string; en: string }> = {
  limpieza: { slug: ["limpieza", "sprzatanie-domow"], es: "Limpieza", pl: "Sprzątanie", en: "Cleaning" },
  nieve: { slug: ["odsniezanie-ogrody"], es: "Quitar nieve", pl: "Odśnieżanie", en: "Snow removal" },
  mudanzas: { slug: ["mudanzas", "przeprowadzki"], es: "Mudanzas", pl: "Przeprowadzki", en: "Moving" },
  cuidado: { slug: ["opieka-dzieci-seniorzy", "opieka-dzieci"], es: "Cuidado de niños y mayores", pl: "Opieka", en: "Childcare and elderly care" },
  masajes: { slug: ["masaze-pielegnacja"], es: "Masajes", pl: "Masaże", en: "Massage" },
  reparaciones: { slug: ["drobne-naprawy"], es: "Reparaciones pequeñas", pl: "Drobne naprawy", en: "Small repairs" },
  ayuda: { slug: ["pomoc-ogolna"], es: "Ayuda general", pl: "Pomoc ogólna", en: "General help" },
};

function slugify(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function findCity(name: string) {
  const supabase = await createClient();
  const pattern = name.replace(/-/g, "%");
  const { data } = await supabase.from("localities").select("id, name, voivodeship").ilike("name", pattern).limit(50);
  const exact = (data ?? []).find((c) => slugify(c.name) === name);
  if (exact) return exact;
  const { data: all } = await supabase.from("localities").select("id, name, voivodeship").limit(60000);
  return (all ?? []).find((c) => slugify(c.name) === name) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { ciudad, categoria } = await params;
  const cat = CATEGORIAS[categoria];
  const city = await findCity(ciudad);
  if (!cat || !city) return {};
  const title = `${cat.es} en ${city.name} | TaskGo`;
  const description = `${cat.es} en ${city.name}: ofertas por horas y por día entre personas de tu zona. Publica o busca gratis en TaskGo.`;
  return {
    title,
    description,
    alternates: { canonical: `https://taskgo.pl/trabajo/${ciudad}/${categoria}` },
    openGraph: { title, description, url: `https://taskgo.pl/trabajo/${ciudad}/${categoria}` },
  };
}
export default function TrabajoPage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <TrabajoContent params={params} />
      </Suspense>
    </main>
  );
}

async function TrabajoContent({ params }: { params: Params }) {
  await connection();
  const { ciudad, categoria } = await params;
  const lang = await getLang();
  const cat = CATEGORIAS[categoria];
  if (!cat) notFound();
  const city = await findCity(ciudad);
  if (!city) notFound();

  const supabase = await createClient();
  const { data: cats } = await supabase.from("categories").select("id").in("slug", cat.slug);
  const ids = (cats ?? []).map((c) => c.id);

  const { data: jobs } = ids.length
    ? await supabase
        .from("job_posts")
        .select("id, title, pay_pln, pay_agreed, pay_type, locality_id")
        .eq("status", "active")
        .in("category_id", ids)
        .eq("locality_id", city.id)
        .order("bumped_at", { ascending: false })
        .limit(40)
    : { data: [] };

  const title = lang === "pl" ? `${cat.pl} w ${city.name}` : lang === "en" ? `${cat.en} in ${city.name}` : `${cat.es} en ${city.name}`;
  const empty = lang === "pl" ? "Brak ogłoszeń w tej kategorii. Dodaj pierwsze!" : lang === "en" ? "No listings in this category yet. Post the first one!" : "Todavía no hay anuncios en esta categoría. ¡Publica el primero!";
  const agreed = lang === "pl" ? "Do uzgodnienia" : lang === "en" ? "Negotiable" : "A convenir";
  const back = lang === "pl" ? "Wszystkie ogłoszenia" : lang === "en" ? "All listings" : "Todos los anuncios";

  return (
    <>
      <nav className="mb-4 text-sm"><Link href="/" className={ui.link}>← {back}</Link></nav>
      <h1 className={ui.title}>{title}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{city.voivodeship ? `${city.name} · ${city.voivodeship}` : city.name}</p>

      {(jobs ?? []).length === 0 ? (
        <p className={ui.emptyBox}>{empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(jobs ?? []).map((j) => (
            <li key={j.id} className={`${ui.card} flex flex-col gap-2`}>
              <Link href={`/jobs/${j.id}`} className="text-sm font-semibold text-slate-900 hover:underline dark:text-slate-50">{j.title}</Link>
              <span className="mt-auto text-sm font-bold text-slate-900 dark:text-slate-50">
                {j.pay_agreed || j.pay_pln == null ? agreed : `${j.pay_pln} zł`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}