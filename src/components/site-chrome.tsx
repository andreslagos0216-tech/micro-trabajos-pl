import Link from "next/link";
import { Logo } from "@/components/logo";
import { dict, getLang, type Lang } from "@/lib/i18n";

function LangSwitcher({ current }: { current: Lang }) {
  const langs: Lang[] = ["pl", "es", "en"];
  return (
    <div className="flex gap-1" aria-label="Idioma / Język / Language">
      {langs.map((l) => (
        // Enlace normal: fuerza una carga completa y respeta la cookie nueva
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a
          key={l}
          href={`/api/lang?l=${l}`}
          aria-current={l === current ? "true" : undefined}
          className={`rounded px-2 py-1 text-xs font-semibold ${
            l === current
              ? "bg-blue-700 text-white"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

export async function SiteHeader() {
  const lang = await getLang();
  const t = dict[lang];

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Link href="/" className="hover:text-blue-700 dark:hover:text-blue-400">{t.navOffers}</Link>
          <Link href="/jobs/new" className="hover:text-blue-700 dark:hover:text-blue-400">{t.navPublish}</Link>
          <Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-400">{t.navLogin}</Link>
          <LangSwitcher current={lang} />
        </nav>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const lang = await getLang();
  const t = dict[lang];

  return (
    <footer className="border-t border-slate-200 bg-white text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-3 px-4 py-6">
        <span>SC opcje · {t.footerRights}</span>
        <nav className="flex gap-5">
          <Link href="/regulamin" className="hover:underline">{t.footerLegal}</Link>
          <Link href="/polityka-prywatnosci" className="hover:underline">{t.footerPrivacy}</Link>
        </nav>
      </div>
    </footer>
  );
}
