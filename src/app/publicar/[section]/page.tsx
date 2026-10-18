import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang, type Lang } from "@/lib/i18n";
import { fieldsFor, type FieldDef } from "@/lib/listing-fields";
import { catName, listingsText } from "@/lib/listings-i18n";
import { ui } from "@/lib/ui";
import { LocalityPicker } from "@/components/locality-picker";
import { createListing } from "./actions";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ c?: string }>;
};

export default function PublishPage(props: Props) {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <PublishContent {...props} />
      </Suspense>
    </main>
  );
}

async function PublishContent({ params, searchParams }: Props) {
  await connection();
  const { section: rawSection } = await params;
  const { c } = await searchParams;
  if (rawSection !== "sale" && rawSection !== "rent") notFound();
  const section = rawSection;
  const lang: Lang = await getLang();
  const t = listingsText[lang];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, name_es, name_en")
    .eq("section", section)
    .order("name");

  const all = cats ?? [];
  const roots = all.filter((x) => x.parent_id === null);
  const leaves = all.filter((x) => x.parent_id !== null);
  const cat = c ? leaves.find((x) => x.slug === c) : undefined;

  // Paso 1: elegir subcategoría
  if (!cat) {
    const groups = roots
      .map((root) => ({ root, children: leaves.filter((x) => x.parent_id === root.id) }))
      .filter((g) => g.children.length > 0);

    return (
      <>
        <Link href={`/listados/${section}`} className={`${ui.link} mb-6 inline-block`}>{t.back}</Link>
        <h1 className={ui.title}>{t.publish}</h1>
        <p className={`mb-8 ${ui.subtitle}`}>{t.pickCategoryHint}</p>
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.root.id}>
              <h2 className={ui.sectionTitle}>{catName(g.root, lang)}</h2>
              <div className="flex flex-wrap gap-2">
                {g.children.map((child) => (
                  <Link key={child.id} href={`/publicar/${section}?c=${child.slug}`} className={ui.buttonSecondary}>
                    {catName(child, lang)}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </>
    );
  }

  // Paso 2: formulario específico de la subcategoría
  const fields: FieldDef[] = section === "sale" ? fieldsFor(cat.slug) : [];

  return (
    <>
      <Link href={`/publicar/${section}`} className={`${ui.link} mb-6 inline-block`}>{t.changeCategory}</Link>
      <h1 className={ui.title}>{catName(cat, lang)}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.formSubtitle}</p>

      <form action={createListing} className={`${ui.card} space-y-5`}>
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="category_id" value={cat.id} />

        <div>
          <label htmlFor="title" className={ui.label}>{t.titleLabel}</label>
          <input id="title" name="title" required minLength={5} maxLength={120} placeholder={t.titlePlaceholder} className={ui.input} />
        </div>

        <div>
          <label htmlFor="description" className={ui.label}>{t.descLabel}</label>
          <textarea id="description" name="description" required maxLength={5000} rows={5} placeholder={t.descPlaceholder} className={ui.input} />
        </div>

        <LocalityPicker
          name="locality_id"
          required
          label={t.localityLabel}
          placeholder={t.localityPlaceholder}
          noResults={t.localityNoResults}
        />
        <p className={`-mt-3 text-xs ${ui.muted}`}>{t.localityHint}</p>

        {section === "sale" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price_pln" className={ui.label}>{t.priceLabel}</label>
                <div className="relative">
                  <input id="price_pln" name="price_pln" type="number" step="0.01" min="0" required className={`${ui.input} pr-12`} />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">zł</span>
                </div>
              </div>
              <div>
                <label htmlFor="condition" className={ui.label}>{t.conditionLabel}</label>
                <select id="condition" name="condition" required defaultValue="used" className={ui.input}>
                  <option value="new">{t.conditionNew}</option>
                  <option value="used">{t.conditionUsed}</option>
                  <option value="for_parts">{t.conditionParts}</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <input type="checkbox" name="price_negotiable" className="h-4 w-4 accent-blue-700" />
              {t.negotiable}
            </label>

            {fields.map((f) => (
              <AttributeInput key={f.key} field={f} lang={lang} />
            ))}
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rent_pln" className={ui.label}>{t.rentLabel}</label>
                <div className="relative">
                  <input id="rent_pln" name="rent_pln" type="number" step="0.01" min="1" required className={`${ui.input} pr-12`} />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">zł</span>
                </div>
              </div>
              <div>
                <label htmlFor="deposit_pln" className={ui.label}>{t.depositLabel}</label>
                <input id="deposit_pln" name="deposit_pln" type="number" step="0.01" min="0" className={ui.input} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rooms" className={ui.label}>{t.roomsLabel}</label>
                <input id="rooms" name="rooms" type="number" min="0" max="50" className={ui.input} />
              </div>
              <div>
                <label htmlFor="area_m2" className={ui.label}>{t.areaLabel}</label>
                <input id="area_m2" name="area_m2" type="number" min="1" max="2000" className={ui.input} />
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-800 dark:text-slate-200">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="furnished" className="h-4 w-4 accent-blue-700" />
                {t.furnished}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="bills_included" className="h-4 w-4 accent-blue-700" />
                {t.billsIncluded}
              </label>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link href={`/listados/${section}`} className={ui.buttonSecondary}>{t.cancel}</Link>
          <button type="submit" className={ui.button}>{t.submit}</button>
        </div>
      </form>
    </>
  );
}

function AttributeInput({ field, lang }: { field: FieldDef; lang: Lang }) {
  const id = `attr_${field.key}`;

  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
        <input type="checkbox" name={id} className="h-4 w-4 accent-blue-700" />
        {field.label[lang]}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label htmlFor={id} className={ui.label}>{field.label[lang]}</label>
        <select id={id} name={id} defaultValue="" className={ui.input}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label[lang]}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={ui.label}>
        {field.label[lang]}
        {field.unit ? ` (${field.unit})` : ""}
      </label>
      <input
        id={id}
        name={id}
        type={field.type === "number" ? "number" : "text"}
        step={field.type === "number" ? "any" : undefined}
        min={field.type === "number" ? 0 : undefined}
        maxLength={field.type === "text" ? 60 : undefined}
        className={ui.input}
      />
    </div>
  );
}