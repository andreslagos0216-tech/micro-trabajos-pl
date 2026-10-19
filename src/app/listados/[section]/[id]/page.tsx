import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Lang } from "@/lib/i18n";
import { kindDict } from "@/lib/i18n-kinds";
import { fieldsFor, optionLabel } from "@/lib/listing-fields";
import { catName, listingsText, type ListingsDict } from "@/lib/listings-i18n";
import { reportText } from "@/lib/report-i18n";
import { localizeMany } from "@/lib/translate";

type ListingTable = "sale_listings" | "rental_listings";
import { ownerText } from "@/lib/owner-i18n";
import { ui } from "@/lib/ui";
import { listingMetadata } from "@/lib/seo";
import { ReportForm } from "@/components/report-form";
import { ContactBlock } from "@/components/contact-block";
import { PhotoUploader } from "@/components/photo-uploader";
import { startListingFeatured } from "./actions";
import { setListingStatus, deleteListing } from "./owner-actions";

type Params = Promise<{ section: string; id: string }>;
type SearchParams = Promise<{ reported?: string }>;

type DetailRow = {
  id: string;
  title: string;
  description: string;
  author_id: string;
  original_lang: string;
  status: string;
  featured_until: string | null;
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
  contact_method: string | null;
  categories: { name: string; name_es: string | null; name_en: string | null; slug: string } | null;
  localities: { name: string; voivodeship: string | null } | null;
};

export default function ListingDetailPage(props: { params: Params; searchParams: SearchParams }) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <ListingDetail {...props} />
      </Suspense>
    </main>
  );
}

async function ListingDetail({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await connection();
  const { section: rawSection, id } = await params;
  if (rawSection !== "sale" && rawSection !== "rent") notFound();
  const section = rawSection;
  const { reported } = await searchParams;
  const lang: Lang = await getLang();
  const t: ListingsDict = listingsText[lang];
  const g = dict[lang];
  const r = reportText[lang];
  const o = ownerText[lang];

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

  // Los anuncios en revisión solo los ve su autor
  if (item.status === "pending_review" && !isOwner) notFound();

  const listingTable: ListingTable = section === "sale" ? "sale_listings" : "rental_listings";
  const [local] = await localizeMany(
    [{ id: item.id, title: item.title, description: item.description, original_lang: item.original_lang }],
    lang
  );

  const { data: photos } = await supabase
    .from("listing_photos")
    .select("storage_path")
    .eq(section === "sale" ? "sale_listing_id" : "rental_listing_id", id)
    .order("position");
  const photoUrls = (photos ?? []).map(
    (p) => supabase.storage.from("listing-photos").getPublicUrl(p.storage_path).data.publicUrl
  );

  const isFeatured = !!item.featured_until && new Date(item.featured_until) > new Date();
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

  const doneStatus = section === "sale" ? "sold" : "rented";
  const doneLabel = section === "sale" ? o.markSold : o.markRented;
  const statusName = o.statusNames[item.status] ?? item.status;

  const statusButtons = [
    item.status !== "active" && { value: "active", label: o.activate },
    item.status === "active" && { value: "paused", label: o.pause },
    item.status !== doneStatus && { value: doneStatus, label: doneLabel },
    item.status !== "closed" && { value: "closed", label: o.close },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <>
      <Link href={`/listados/${section}`} className={`${ui.link} mb-6 inline-block`}>{t.back}</Link>

      {reported === "ok" && (
        <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          {r.thanks}
        </p>
      )}
      {reported === "dup" && (
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {r.duplicate}
        </p>
      )}

      <article className={`${ui.card} space-y-6`}>
        {photoUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photoUrls.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {isFeatured && <span className={ui.badge}>{g.badgeFeatured}</span>}
          <span className={ui.badgeNeutral}>{category}</span>
          {section === "sale" && <span className={ui.badgeNeutral}>{conditionLabel}</span>}
          {isOwner && <span className={ui.badgeNeutral}>{statusName}</span>}
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{local.title}</h1>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className={ui.muted}>{t.priceLabel}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {section === "sale"
                  ? `${item.price_pln} zł${item.price_negotiable ? ` (${t.negotiable})` : ""}`
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
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">{local.description}</p>
          <p className={`mt-2 text-xs ${ui.muted}`}>
            {local.translated ? kindDict[lang].autoTranslated : t.notice}
          </p>
        </div>

        {isOwner && (
          <section className="space-y-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{o.ownerTitle}</p>

            <PhotoUploader
              listingTable={listingTable}
              listingId={item.id}
              authorId={item.author_id}
              current={photoUrls.length}
              lang={lang}
            />

            <div className="flex flex-wrap gap-2">
              <Link href={`/listados/${section}/${id}/editar`} className={ui.buttonSecondary}>{o.edit}</Link>
              {statusButtons.map((b) => (
                <form key={b.value} action={setListingStatus.bind(null, section, id)}>
                  <input type="hidden" name="status" value={b.value} />
                  <button type="submit" className={ui.buttonSecondary}>{b.label}</button>
                </form>
              ))}
            </div>

            {!isFeatured && item.status === "active" && (
              <form action={startListingFeatured.bind(null, section, id)}>
                <button type="submit" className={ui.button}>{g.featureButton}</button>
              </form>
            )}

            <form action={deleteListing.bind(null, section, id)} className="pt-2">
              <button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40">
                {o.delete}
              </button>
            </form>
          </section>
        )}
      </article>

      <div className="mt-6">
        <ContactBlock
          lang={lang}
          authorId={item.author_id}
          title={local.title}
          contactMethod={item.contact_method ?? "chat"}
          viewerId={user?.id ?? null}
        />
      </div>
      {!isOwner && (
        <div className="mt-6">
          {user ? (
            <ReportForm
              targetType={section === "sale" ? "sale" : "rent"}
              targetId={id}
              returnPath={`/listados/${section}/${id}`}
              lang={lang}
            />
          ) : (
            <p className="text-sm">
              <Link href="/login" className={ui.link}>{r.loginFirst}</Link>
            </p>
          )}
        </div>
      )}
    </>
  );
}


export async function generateMetadata({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return {};
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const table = section === "sale" ? "sale_listings" : "rental_listings";
  const { data } = await supabase
    .from(table as "sale_listings")
    .select("title, description, price_pln, rent_pln, localities(name)")
    .eq("id", id)
    .single();
  if (!data) return {};
  const row = data as unknown as { title: string; description: string; price_pln: number | null; rent_pln: number | null; localities: { name: string } | null };
  const price = section === "sale" ? (row.price_pln != null ? `${row.price_pln} zł` : null) : (row.rent_pln != null ? `${row.rent_pln} zł / mies.` : null);
  return listingMetadata({
    title: row.title,
    description: row.description,
    city: row.localities?.name ?? null,
    price,
    path: `/listados/${section}/${id}`,
  });
}