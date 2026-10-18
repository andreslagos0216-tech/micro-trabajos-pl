import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { fieldsFor, optionLabel } from "@/lib/listing-fields";
import { catName, listingsText, type ListingsDict } from "@/lib/listings-i18n";
import { ui } from "@/lib/ui";

type Params = Promise<{ section: string; id: string }>;

type DetailRow = {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: string;
  price_pln: number | null;
  price_negotiable: boolean | null;
  condition: string | null;
  rent_pln: number | null;
  deposit_pln: number | null;
  rooms: number | null;
  area_m2: number | null;
  furnished: boolean | null;
  bills_included: boolean | null;
  attributes: Record<string, string | number | boolean> | null;
  categories: { name: string; name_es: string | null; name_en: string | null; slug: string } | null;
  localities: { name: string; voivodeship: string | null } | null;
};

export default function ListingDetailPage({ params }: { params: Params }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <ListingDetail params={params} />
      </Suspense>
    </main>
  );
}

async function ListingDetail({ params }: { params: Params }) {
  await connection();
  const { section: rawSection, id } = await params;
  if (rawSection !== "sale" && rawSection !== "rent") notFound();
  const section = rawSection;
  const lang = await getLang();
  const t: ListingsDict = listingsText[lang];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const table = (section === "sale" ? "sale_listings" : "rental_listings") as "sale_listings";
  const { data } = await supabase
    .from(table)
    .select("*, categories(name, name_es, name_en, slug), localities(name, voivodeship)")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const item = data as unknown as DetailRow;
  const isOwner = user?.id === item.author_id;
  const category = item.categories ? catName(item.categories, lang) : "";
  const fields = section === "sale" && item.categories ? fieldsFor(item.categories.slug) : [];

  const conditionLabel =
    item.condition === "new" ? t.conditionNew : item.condition === "for_parts" ? t.conditionParts : t.conditionUsed;

  const attributeRows = fields
    .filter((f) => item.attributes && item.attributes[f.key] !== undefined)
    .map((f) => {
      const value = item.attributes![f.key];
      let text: string;
      if (typeof value === "boolean") text = value ? t.yes : t.no;
      else if (f.type === "select") text = optionLabel(f, String(value), lang);
      else text = f.unit ? `${value} ${f.unit}` : String(value);
      return { label: f.label[lang], text };
    });

  return (
    <>
      <Link href={`/listados/${section}`} className={`${ui.link} mb-6 inline-block`}>{t.back}</Link>

      <article className={`${ui.card} space-y-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={ui.badgeNeutral}>{category}</span>
          {section === "sale" && <span className={ui.badgeNeutral}>{conditionLabel}</span>}
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{item.title}</h1>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className={ui.muted}>{t.priceLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {section === "sale"
                  ? `${item.price_pln} zł${item.price_negotiable ? " (negocjacja)" : ""}`
                  : `${item.rent_pln} zł / ${t.perMonth}`}
              </dd>
            </div>
            {section === "rent" && item.deposit_pln != null && (
              <div>
                <dt className={ui.muted}>{t.deposit}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{item.deposit_pln} zł</dd>
              </div>
            )}
            <div>
              <dt className={ui.muted}>{t.location}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {item.localities?.name}
                {item.localities?.voivodeship ? `, ${item.localities.voivodeship}` : ""}
              </dd>
            </div>
            {section === "rent" && item.rooms != null && (
              <div>
                <dt className={ui.muted}>{t.roomsLabel}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{item.rooms}</dd>
              </div>
            )}
            {section === "rent" && item.area_m2 != null && (
              <div>
                <dt className={ui.muted}>{t.areaLabel}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{item.area_m2} m²</dd>
              </div>
            )}
            {section === "rent" && item.furnished != null && (
              <div>
                <dt className={ui.muted}>{t.furnished}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{item.furnished ? t.yes : t.no}</dd>
              </div>
            )}
            {section === "rent" && item.bills_included != null && (
              <div>
                <dt className={ui.muted}>{t.billsIncluded}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{item.bills_included ? t.yes : t.no}</dd>
              </div>
            )}
          </dl>
        </div>

        {attributeRows.length > 0 && (
          <div>
            <h2 className={ui.sectionTitle}>{t.details}</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {attributeRows.map((row) => (
                <div key={row.label}>
                  <dt className={ui.muted}>{row.label}</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">{row.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div>
          <h2 className={ui.sectionTitle}>{t.descriptionTitle}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">{item.description}</p>
          <p className={`mt-2 text-xs ${ui.muted}`}>{t.notice}</p>
        </div>

        {isOwner && (
          <section className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{t.ownerTitle}</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              {t.statusLabel}: {item.status === "active" ? t.statusActive : t.statusOther}
            </p>
          </section>
        )}
      </article>
    </>
  );
}