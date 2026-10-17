import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Lang } from "@/lib/i18n";
import { kindDict, type Kind } from "@/lib/i18n-kinds";
import { adLangHint, adLangLabel, adLangPlaceholder, categoryName } from "@/lib/labels";
import { ui } from "@/lib/ui";
import { createJob } from "./actions";

type SearchParams = Promise<{ kind?: string }>;

const KIND_LIST: Kind[] = ["job", "candidate", "service"];
const LANG_LIST: Lang[] = ["pl", "es", "en"];

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

  const { kind: kindParam } = await searchParams;
  const kind: Kind = KIND_LIST.includes(kindParam as Kind) ? (kindParam as Kind) : "job";
  const text = k[kind];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: cities }, { data: categories }] = await Promise.all([
    supabase.from("cities").select("id, name").order("name"),
    supabase.from("categories").select("id, name, slug").order("name"),
  ]);

  const showAvailability = kind !== "job";

  return (
    <main className={ui.container}>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Tipo de anuncio">
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
            {LANG_LIST.map((l) => (
              <option key={l} value={l}>{k.langNames[l]}</option>
            ))}
          </select>
          <p className={`mt-1.5 text-xs ${ui.muted}`}>{adLangHint[lang]}</p>
        </div>

        <div>
          <label htmlFor="title" className={ui.label}>{text.titleLabel}</label>
          <input id="title" name="title" required minLength={5} maxLength={120} placeholder={text.titlePlaceholder} className={ui.input} />
        </div>

        <div>
          <label htmlFor="description" className={ui.label}>{text.descLabel}</label>
          <textarea id="description" name="description" required maxLength={5000} rows={5} placeholder={text.descPlaceholder} className={ui.input} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city_id" className={ui.label}>{t.cityLabel}</label>
            <select id="city_id" name="city_id" required defaultValue="" className={ui.input}>
              <option value="" disabled>{t.selectCity}</option>
              {cities?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category_id" className={ui.label}>{t.categoryLabel}</label>
            <select id="category_id" name="category_id" required defaultValue="" className={ui.input}>
              <option value="" disabled>{t.selectCategory}</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{categoryName(c.slug, lang, c.name)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pay_type" className={ui.label}>{t.payTypeLabel}</label>
            <select id="pay_type" name="pay_type" required defaultValue="hour" className={ui.input}>
              <option value="hour">{t.payHour}</option>
              <option value="project">{t.payProject}</option>
            </select>
          </div>
          <div>
            <label htmlFor="pay_pln" className={ui.label}>{text.rateLabel}</label>
            <div className="relative">
              <input id="pay_pln" name="pay_pln" type="number" step="0.01" min="1" required placeholder="0.00" className={`${ui.input} pr-12`} />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">zł</span>
            </div>
            <p className={`mt-1.5 text-xs ${ui.muted}`}>{t.rateHint}</p>
          </div>
        </div>

        {showAvailability && (
          <div>
            <label htmlFor="availability" className={ui.label}>{k.availability}</label>
            <input id="availability" name="availability" maxLength={120} placeholder={k.availabilityPlaceholder} className={ui.input} />
          </div>
        )}

        <fieldset>
          <legend className={ui.label}>{k.spokenLanguages}</legend>
          <div className="flex flex-wrap gap-5 text-sm text-slate-800 dark:text-slate-200">
            {LANG_LIST.map((l) => (
              <label key={l} className="flex items-center gap-2">
                <input type="checkbox" name="languages" value={l} className="h-4 w-4 accent-blue-700" />
                {k.langNames[l]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link href="/" className={ui.buttonSecondary}>{t.cancel}</Link>
          <button type="submit" className={ui.button}>{text.submit}</button>
        </div>
      </form>
    </main>
  );
}
