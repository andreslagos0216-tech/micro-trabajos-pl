import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

type ContactText = { intro: string; login: string; whatsapp: string; chatSoon: string; noShare: string };

const TEXT: Record<Lang, ContactText> = {
  pl: {
    intro: "Kontakt",
    login: "Zaloguj się, aby skontaktować się z ogłoszeniodawcą.",
    whatsapp: "Napisz na WhatsApp",
    chatSoon: "Czat w aplikacji: wkrótce.",
    noShare: "Ogłoszeniodawca nie udostępnia numeru telefonu.",
  },
  es: {
    intro: "Contacto",
    login: "Inicia sesión para contactar al anunciante.",
    whatsapp: "Escribir por WhatsApp",
    chatSoon: "Chat interno en la app: próximamente.",
    noShare: "El anunciante no comparte su número de teléfono.",
  },
  en: {
    intro: "Contact",
    login: "Log in to contact the advertiser.",
    whatsapp: "Message on WhatsApp",
    chatSoon: "In-app chat: coming soon.",
    noShare: "The advertiser does not share a phone number.",
  },
};

export async function ContactBlock({
  lang,
  authorId,
  title,
  contactMethod,
  viewerId,
}: {
  lang: Lang;
  authorId: string;
  title: string;
  contactMethod: string;
  viewerId: string | null;
}) {
  const t = TEXT[lang];
  if (viewerId === authorId) return null;

  if (!viewerId) {
    return (
      <p className="text-sm">
        <Link href="/login" className={ui.link}>{t.login}</Link>
      </p>
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("show_phone")
    .eq("id", authorId)
    .single();

  const wantsWhatsapp = contactMethod === "whatsapp" || contactMethod === "both";
  const wantsChat = contactMethod === "chat" || contactMethod === "both";

  let number: string | null = null;
  if (wantsWhatsapp && profile?.show_phone) {
    const admin = createAdminClient();
    const { data: contact } = await admin
      .from("profile_contacts")
      .select("phone")
      .eq("profile_id", authorId)
      .maybeSingle();
    const digits = (contact?.phone ?? "").replace(/\D/g, "");
    if (digits) number = digits.length === 9 ? `48${digits}` : digits;
  }

  const message = encodeURIComponent(title);

  return (
    <section className={`${ui.card} space-y-3`}>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.intro}</p>
      {number && (
        <a
          href={`https://wa.me/${number}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className={ui.button}
        >
          {t.whatsapp}
        </a>
      )}
      {wantsChat && <p className={`text-sm ${ui.muted}`}>{t.chatSoon}</p>}
      {!number && !wantsChat && <p className={`text-sm ${ui.muted}`}>{t.noShare}</p>}
    </section>
  );
}