import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang, type Lang } from "@/lib/i18n";
import { fieldsFor, type FieldDef } from "@/lib/listing-fields";
import { listingsText } from "@/lib/listings-i18n";
import { formText } from "@/lib/form-i18n";
import { examples } from "@/lib/examples";
import { adLangHint, adLangLabel, adLangPlaceholder } from "@/lib/labels";
import { ui } from "@/lib/ui";
import { LocalityPicker } from "@/components/locality-picker";
import { CategoryPicker } from "@/components/category-picker";
import { createListing } from "./actions";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ c?: string }>;
};

const LANG_LIST: Lang[] = ["pl", "es", "en"];
const LEVEL_KEYS = ["basic", "medium", "advanced", "native"] as const;

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
  const f = formText[lang];
  const ex = examples[lang];

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

  const labelOf = (x: { name: string; name_es: string | null; name_en: string | null }) =>
    lang === "es" ? (x.name_es ?? x.name) : lang === "en" ? (x.name_en ?? x.name) : x.name;

  // Paso 1: elegir subcategoría con el buscador
  if (!cat) {
    const options = leaves.map((x) => ({
      id: x.id,
      label: `${labelOf(roots.find((r) => r.id === x.parent_id) ?? x)} · ${labelOf(x)}`,
      other: x.slug.startsWith("otro-"),
      slug: x.slug,
    }));

    return (
      <>
        <Link href={`/listados/${section}`} className={`${ui.link} mb-6 inline-block`}>{t.back}</Link>
        <h1 className={ui.title}>{t.publish}</h1>
        <p className={`mb-6 ${ui.subtitle}`}>{t.pickCategoryHint}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {options.map((o) => (
            <li key={o.id}>
              <Link
                href={`/publicar/${section}?c=${o.slug}`}
                className={`block rounded-lg border px-4 py-3 text-sm font-medium shadow-sm transition hover:border-blue-500 ${
                  o.other
                    ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                    : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                }`}
              >
                {o.label}
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const fields: FieldDef[] = section === "sale" ? fieldsFor(cat.slug) : [];
  const isOther = cat.slug.startsWith("otro-");

  const pickerOptions = leaves.map((x) => ({
    id: x.id,
    label: `${labelOf(roots.find((r) => r.id === x.parent_id) ?? x)} · ${labelOf(x)}`,
    other: x.slug.startsWith("otro-"),
  }));

  const levelLabels: Record<(typeof LEVEL_KEYS)[number], Record<Lang, string>> = {
    basic: { pl: "Podstawowy", es: "Básico", en: "Basic" },
    medium: { pl: "Średni", es: "Medio", en: "Intermediate" },
    advanced: { pl: "Zaawansowany", es: "Avanzado", en: "Advanced" },
    native: { pl: "Ojczysty", es: "Nativo", en: "Native" },
  };

  return (
    <>
      <Link href={`/publicar/${section}`} className={`${ui.link} mb-6 inline-block`}>{t.changeCategory}</Link>
      <h1 className={ui.title}>{labelOf(cat)}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.formSubtitle}</p>

      <form action={createListing} className={`${ui.card} space-y-5`}>
        <input type="hidden" name="section" value={section} />

        <div>
          <label htmlFor="original_lang" className={ui.label}>{adLangLabel[lang]}</label>
          <select id="original_lang" name="original_lang" required defaultValue="" className={ui.input}>
            <option value="" disabled>{adLangPlaceholder[lang]}</option>
            <option value="pl">Polski</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <p className={`mt-1.5 text-xs ${ui.muted}`}>{adLangHint[lang]}</p>
        </div>

        <CategoryPicker
          label={f.categoryLabel}
          placeholder={f.categoryPlaceholder}
          noResults={f.categoryNoResults}
          options={pickerOptions}
          customLabel={f.customLabel}
          customPlaceholder={f.customPlaceholder}
          customHint={f.customHint}
        />
        <input type="hidden" name="category_id" value={cat.id} />

        {isOther && <input type="hidden" name="custom_category" value="" />}

        <div>
          <label htmlFor="title" className={ui.label}>{t.titleLabel}</label>
          <input id="title" name="title" required minLength={5} maxLength={120} placeholder={ex.title} className={ui.input} />
        </div>

        <div>
          <label htmlFor="description" className={ui.label}>{t.descLabel}</label>
          <textarea
            id="description"
            name="description"
            required
            maxLength={5000}
            rows={6}
            placeholder={section === "rent" ? ex.rent_description : ex.description}
            className={ui.input}
          />
        </div>

        <div className={`${ui.card} space-y-2 bg-slate-50 dark:bg-slate-800`}>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.photosTitle}</p>
          <p className={`text-xs ${ui.muted}`}>{ex.photos}</p>
          <p className={`text-xs ${ui.muted}`}>{t.photosSaveHint}</p>
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
                  <input id="price_pln" name="price_pln" type="number" step="0.01" min="0" required placeholder={ex.price} className={`${ui.input} pr-12`} />
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

            {fields.map((field) => (
              <AttributeInput key={field.key} field={field} lang={lang} />
            ))}
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rent_pln" className={ui.label}>{t.rentLabel}</label>
                <div className="relative">
                  <input id="rent_pln" name="rent_pln" type="number" step="0.01" min="1" required placeholder={ex.rent} className={`${ui.input} pr-12`} />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">zł</span>
                </div>
              </div>
              <div>
                <label htmlFor="deposit_pln" className={ui.label}>{t.depositLabel}</label>
                <input id="deposit_pln" name="deposit_pln" type="number" step="0.01" min="0" placeholder={ex.deposit} className={ui.input} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rooms" className={ui.label}>{t.roomsLabel}</label>
                <input id="rooms" name="rooms" type="number" min="0" max="50" placeholder={ex.rooms} className={ui.input} />
              </div>
              <div>
                <label htmlFor="area_m2" className={ui.label}>{t.areaLabel}</label>
                <input id="area_m2" name="area_m2" type="number" min="1" max="2000" placeholder={ex.area} className={ui.input} />
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

        <fieldset className="space-y-3">
          <legend className={ui.label}>{t.spokenLanguagesLabel}</legend>
          {LANG_LIST.map((code) => (
            <div key={code} className="grid items-center gap-2 sm:grid-cols-[1fr_200px]">
              <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                <input type="checkbox" name={`lang_${code}`} className="h-4 w-4 accent-blue-700" />
                {({ pl: "Polski", es: "Español", en: "English" } as const)[code]}
              </label>
              <select name={`level_${code}`} defaultValue="basic" className={ui.input}>
                {LEVEL_KEYS.map((lvl) => (
                  <option key={lvl} value={lvl}>{levelLabels[lvl][lang]}</option>
                ))}
              </select>
            </div>
          ))}
        </fieldset>

        <div>
          <label htmlFor="contact_method" className={ui.label}>{f.contactLabel}</label>
          <select id="contact_method" name="contact_method" required defaultValue="chat" className={ui.input}>
            <option value="chat">{f.contactChat}</option>
            <option value="whatsapp">{f.contactWhatsapp}</option>
            <option value="both">{f.contactBoth}</option>
          </select>
        </div>

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