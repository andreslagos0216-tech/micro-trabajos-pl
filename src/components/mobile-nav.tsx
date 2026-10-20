import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLang, type Lang } from "@/lib/i18n";

const LABELS: Record<Lang, { home: string; search: string; publish: string; messages: string; account: string }> = {
  pl: { home: "Start", search: "Szukaj", publish: "Dodaj", messages: "Wiad.", account: "Konto" },
  es: { home: "Inicio", search: "Buscar", publish: "Publicar", messages: "Mensajes", account: "Cuenta" },
  en: { home: "Home", search: "Search", publish: "Post", messages: "Messages", account: "Account" },
};

export async function MobileNav() {
  const lang = await getLang();
  const t = LABELS[lang];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = [
    { href: "/", label: t.home, icon: "🏠" },
    { href: "/?q=#buscar", label: t.search, icon: "🔍" },
    { href: "/publicar", label: t.publish, icon: "+", primary: true },
    { href: "/perfil", label: t.messages, icon: "💬" },
    { href: user ? "/perfil" : "/login", label: t.account, icon: "👤" },
  ];

  return (
    <nav
      aria-label="Menu"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => (
          <li key={item.label} className="flex justify-center">
            <Link
              href={item.href}
              className={
                item.primary
                  ? "-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold text-white shadow-lg"
                  : "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-slate-700 dark:text-slate-300"
              }
            >
              <span className={item.primary ? "" : "text-lg"} aria-hidden="true">{item.icon}</span>
              {!item.primary && <span>{item.label}</span>}
              {item.primary && <span className="sr-only">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}