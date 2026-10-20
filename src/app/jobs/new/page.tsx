import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Lang } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { adLangHint, adLangLabel, adLangPlaceholder } from "@/lib/labels";
import { listingsText } from "@/lib/listings-i18n";
import { formText } from "@/lib/form-i18n";
import { ui } from "@/lib/ui";
import { LocalityPicker } from "@/components/locality-picker";
import { CategoryPicker } from "@/components/category-picker";
import { createJob } from "./actions";

type SearchParams = Promise<{ kind?: string }>;

const KIND_LIST: Kind[] = ["job", "service"];
const LANG_LIST: Lang[] = ["pl", "es", "en"];
const LEVEL_KEYS = ["basic", "medium", "advanced", "native"] as const;

export default function NewJobPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <NewJobContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewJobContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = dict[lang];
  const k = kindDict[lang];
  const l = listingsText[lang];
  const f = formText[lang];

  const { kind: kindParam } = await searchParams;
  const kind: Kind = KIND_LIST.includes(kindParam as Kind) ? (kindParam as Kind) : "job";
  const text = k[kind];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, name_es, name_en")
    .eq("section", "jobs")
    .order("name");

  const pickerOptions = (categories ?? []).map((c) => ({
    id: c.id,
    label: lang === "es" ? (c.name_es ?? c.name) : lang === "en" ? (c.name_en ?? c.name) : c.name,
    other: c.slug === "otro-empleo",
  }));

  const levelLabels: Record<(typeof LEVEL_KEYS)[number], Record<Lang, string>> = {
    basic: { pl: "Podstawowy", es: "Básico", en: "Basic" },
    medium: { pl: "Średni", es: "Medio", en: "Intermediate" },
    advanced: { pl: "Zaawansowany", es: "Avanzado", en: "Advanced" },
    native: { pl: "Ojczysty", es: "Nativo", en: "Native" },
  };

  const contactText = {
    chat: f.contactChat,
    whatsapp: f.contactWhatsapp,
    both: f.contactBoth,
  };

  const showAvailability = kind !== "job";

  return (
    <main className={ui.container}>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label={l.publish}>
        {KIND_LIST.map((item) => (
          <Link key={item} href={`/jobs/new?kind=${item}`} className={item === kind ? ui.button : ui.buttonSecondary}>
            {k[item].label}
          </Link>
        ))}
      </nav>

      <h1 className={ui.title}>{text.formTitle}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{text.formSubtitle}</p>

      <form action={createJob} className={`${ui.card} space-y-5`}>
        <input type="hidden" name="kind" value={kind} />

        <div>
          <label htmlFor="original_lang" className={ui.label}>{adLangLabel[lang]}</label>
          <select id="original_lang" name="original_lang" required defaultValue="" className={ui.input}>
            <option value="" disabled>{adLangPlaceholder[lang]}</option>
            {LANG_LIST.map((x) => (
              <option key={x} value={x}>{k.langNames[x]}</option>
            ))}
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

        <div>
          <label htmlFor="title" className={ui.label}>{text.titleLabel}</label>
          <input id="title" name="title" required minLength={5} maxLength={120} placeholder={text.titlePlaceholder} className={ui.input} />
        </div>

        <div>
          <label htmlFor="description" className={ui.label}>{text.descLabel}</label>
          <textarea id="description" name="description" required maxLength={5000} rows={5} placeholder={text.descPlaceholder} className={ui.input} />
        </div>

        <LocalityPicker
          name="locality_id"
          required
          label={l.localityLabel}
          placeholder={l.localityPlaceholder}
          noResults={l.localityNoResults}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pay_type" className={ui.label}>{t.payTypeLabel}</label>
            <select id="pay_type" name="pay_type" required defaultValue="hour" className={ui.input}>
              <option value="hour">{t.payHour}</option>
              <option value="hour">{t.payHour}</option>
              <option value="day">{lang === "es" ? "Por día" : lang === "en" ? "Per day" : "Za dzień"}</option>
              <option value="project">{t.payProject}</option>
            </select>
          </div>
          <div>
            <label htmlFor="pay_pln" className={ui.label}>{text.rateLabel}</label>
            <div className="relative">
              <input id="pay_pln" name="pay_pln" type="number" step="0.01" min="1" placeholder="0.00" className={`${ui.input} pr-12`} />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">zł</span>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <input type="checkbox" name="pay_agreed" className="h-4 w-4 accent-blue-700" />
              {t.agreedPrice}
            </label>
          </div>
        </div>

        {showAvailability && (
          <div>
            <label htmlFor="availability" className={ui.label}>{k.availability}</label>
            <input id="availability" name="availability" maxLength={120} placeholder={k.availabilityPlaceholder} className={ui.input} />
          </div>
        )}

        <fieldset className="space-y-3">
          <legend className={ui.label}>{k.spokenLanguages}</legend>
          <p className={`text-xs ${ui.muted}`}>{f.contactHint}</p>
          {LANG_LIST.map((code) => (
            <div key={code} className="grid items-center gap-2 sm:grid-cols-[1fr_200px]">
              <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                <input type="checkbox" name={`lang_${code}`} className="h-4 w-4 accent-blue-700" />
                {k.langNames[code]}
              </label>
              <select name={`level_${code}`} defaultValue="basic" className={ui.input} aria-label={k.langNames[code]}>
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
            {(["chat", "whatsapp", "both"] as const).map((c) => (
              <option key={c} value={c}>{contactText[c]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link href="/" className={ui.buttonSecondary}>{t.cancel}</Link>
          <button type="submit" className={ui.button}>{text.submit}</button>
        </div>
      </form>
    </main>
  );
}