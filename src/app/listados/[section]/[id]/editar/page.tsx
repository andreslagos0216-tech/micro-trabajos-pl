import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { listingsText } from "@/lib/listings-i18n";
import { ownerText } from "@/lib/owner-i18n";
import { ui } from "@/lib/ui";
import { updateListing } from "./actions";

type Params = Promise<{ section: string; id: string }>;

type EditRow = {
  title: string;
  description: string;
  author_id: string;
  price_pln: number | null;
  price_negotiable: boolean | null;
  condition: string | null;
  rent_pln: number | null;
  deposit_pln: number | null;
  rooms: number | null;
  area_m2: number | null;
  furnished: boolean | null;
  bills_included: boolean | null;
};

export default function EditListingPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <EditContent params={params} />
    </Suspense>
  );
}

async function EditContent({ params }: { params: Params }) {
  await connection();
  const { section, id } = await params;
  if (section !== "sale" && section !== "rent") notFound();

  const lang = await getLang();
  const t = listingsText[lang];
  const o = ownerText[lang];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const table = (section === "sale" ? "sale_listings" : "rental_listings") as "sale_listings";
  const { data } = await supabase.from(table).select("*").eq("id", id).single();
  if (!data) notFound();
  const item = data as unknown as EditRow;
  if (item.author_id !== user.id) notFound();

  return (
    <main className={ui.container}>
      <Link href={`/listados/${section}/${id}`} className={`${ui.link} mb-6 inline-block`}>{t.back}</Link>
      <h1 className={ui.title}>{o.edit}</h1>

      <form action={updateListing.bind(null, section, id)} className={`${ui.card} mt-6 space-y-5`}>
        <div>
          <label htmlFor="title" className={ui.label}>{t.titleLabel}</label>
          <input id="title" name="title" required minLength={5} maxLength={120} defaultValue={item.title} className={ui.input} />
        </div>

        <div>
          <label htmlFor="description" className={ui.label}>{t.descLabel}</label>
          <textarea id="description" name="description" required maxLength={5000} rows={6} defaultValue={item.description} className={ui.input} />
        </div>

        {section === "sale" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price_pln" className={ui.label}>{t.priceLabel}</label>
                <input id="price_pln" name="price_pln" type="number" step="0.01" min="0" required defaultValue={item.price_pln ?? ""} className={ui.input} />
              </div>
              <div>
                <label htmlFor="condition" className={ui.label}>{t.conditionLabel}</label>
                <select id="condition" name="condition" defaultValue={item.condition ?? "used"} className={ui.input}>
                  <option value="new">{t.conditionNew}</option>
                  <option value="used">{t.conditionUsed}</option>
                  <option value="for_parts">{t.conditionParts}</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <input type="checkbox" name="price_negotiable" defaultChecked={!!item.price_negotiable} className="h-4 w-4 accent-blue-700" />
              {t.negotiable}
            </label>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rent_pln" className={ui.label}>{t.rentLabel}</label>
                <input id="rent_pln" name="rent_pln" type="number" step="0.01" min="1" required defaultValue={item.rent_pln ?? ""} className={ui.input} />
              </div>
              <div>
                <label htmlFor="deposit_pln" className={ui.label}>{t.depositLabel}</label>
                <input id="deposit_pln" name="deposit_pln" type="number" step="0.01" min="0" defaultValue={item.deposit_pln ?? ""} className={ui.input} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rooms" className={ui.label}>{t.roomsLabel}</label>
                <input id="rooms" name="rooms" type="number" min="0" max="50" defaultValue={item.rooms ?? ""} className={ui.input} />
              </div>
              <div>
                <label htmlFor="area_m2" className={ui.label}>{t.areaLabel}</label>
                <input id="area_m2" name="area_m2" type="number" min="1" max="2000" defaultValue={item.area_m2 ?? ""} className={ui.input} />
              </div>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-800 dark:text-slate-200">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="furnished" defaultChecked={!!item.furnished} className="h-4 w-4 accent-blue-700" />
                {t.furnished}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="bills_included" defaultChecked={!!item.bills_included} className="h-4 w-4 accent-blue-700" />
                {t.billsIncluded}
              </label>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link href={`/listados/${section}/${id}`} className={ui.buttonSecondary}>{t.cancel}</Link>
          <button type="submit" className={ui.button}>{o.save}</button>
        </div>
      </form>

      <p className={`mt-4 text-xs ${ui.muted}`}>
        {section === "sale" ? "Los detalles técnicos (marca, modelo, etc.) se editan publicando de nuevo el anuncio." : ""}
      </p>
    </main>
  );
}