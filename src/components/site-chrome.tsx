import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import { dict, getLang, type Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

const langNames: Record<Lang, string> = { pl: "Polski", es: "Español", en: "Español" };

const attribution: Record<Lang, string> = {
  pl: "Dane o miejscowościach: GeoNames (CC BY 4.0)",
  es: "Datos de localidades: GeoNames (CC BY 4.0)",
  en: "Datos de localidades: GeoNames (CC BY 4.0)",
};

const accountLabel: Record<Lang, { profile: string; login: string; admin: string; search: string }> = {
  pl: { profile: "Profil", login: "Zaloguj", admin: "Admin", search: "Szukaj pracy: np. kierowca, kucharz, magazyn..." },
  es: { profile: "Perfil", login: "Entrar", admin: "Admin", search: "Buscar empleo: ej. conductor, cocinero, almacén..." },
  en: { profile: "Perfil", login: "Entrar", admin: "Admin", search: "Buscar empleo: ej. conductor, cocinero, almacén..." },
};

function LangDropdown({ current }: { current: Lang }) {
  const langs: Lang[] = ["pl", "es"];
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
        {current.toUpperCase()} ▾
      </summary>
      <ul className="absolute right-0 z-30 mt-2 w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        {langs.map((l) => (
          <li key={l}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href={`/api/lang?l=${l}`}
              aria-current={l === current ? "true" : undefined}
              className={`block px-3 py-2 text-sm ${
                l === current
                  ? "bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {langNames[l]}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

export async function SiteHeader() {
  const lang = await getLang();
  const t = dict[lang];
  const a = accountLabel[lang];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = !!user && !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && !!user.email_confirmed_at;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <Logo />
        <form action="/" method="get" role="search" className="order-3 w-full sm:order-none sm:flex-1">
          <label htmlFor="header-q" className="sr-only">{a.search}</label>
          <input id="header-q" type="search" name="q" placeholder={a.search} autoComplete="off" className={ui.input} />
        </form>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin" className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              {a.admin}
            </Link>
          )}
          <Link
            href={user ? "/perfil" : "/login"}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {user ? a.profile : a.login}
          </Link>
          <LangDropdown current={lang} />
          <Link href="/publicar" className={ui.button}>+ {t.navPublish}</Link>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const lang = await getLang();
  const t = dict[lang];

  return (
    <footer className="border-t border-slate-200 bg-white text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:flex-wrap sm:justify-between">
        <span>TaskGo · {t.footerRights}</span>
        <nav className="flex gap-5">
          <Link href="/regulamin" className="hover:underline">{t.footerLegal}</Link>
          <Link href="/polityka-prywatnosci" className="hover:underline">{t.footerPrivacy}</Link>
        </nav>
        <p className="w-full text-xs text-slate-500 dark:text-slate-500">
          {attribution[lang]} ·{" "}
          <a href="https://www.geonames.org" target="_blank" rel="noopener noreferrer" className="underline">
            geonames.org
          </a>
        </p>
      </div>
    </footer>
  );
}