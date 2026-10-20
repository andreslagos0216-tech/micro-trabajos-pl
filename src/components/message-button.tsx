import Link from "next/link";
import { openConversation } from "@/app/mensajes/actions";
import { getLang, type Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

const TEXT: Record<Lang, { send: string; login: string; first: string; sendBtn: string }> = {
  pl: { send: "Napisz wiadomość", login: "Zaloguj się, aby napisać do ogłoszeniodawcy.", first: "Napisz pierwszą wiadomość...", sendBtn: "Wyślij" },
  es: { send: "Enviar mensaje", login: "Inicia sesión para escribir al anunciante.", first: "Escribe tu primer mensaje...", sendBtn: "Enviar" },
  en: { send: "Send message", login: "Log in to message the advertiser.", first: "Write your first message...", sendBtn: "Send" },
};

export async function MessageButton({
  kind,
  listingId,
  lang,
  isOwner,
  loggedIn,
}: {
  kind: "job" | "sale" | "rent";
  listingId: string;
  lang: Lang;
  isOwner: boolean;
  loggedIn: boolean;
}) {
  const t = TEXT[lang];
  if (isOwner) return null;

  if (!loggedIn) {
    return (
      <p className="text-sm">
        <Link href="/login" className={ui.link}>{t.login}</Link>
      </p>
    );
  }

  const action = openConversation.bind(null, kind, listingId);
  return (
    <form action={action} className={`${ui.card} space-y-3`}>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.send}</p>
      <div className="flex gap-2">
        <label htmlFor="first_msg" className="sr-only">{t.first}</label>
        <input id="first_msg" name="body" maxLength={1000} placeholder={t.first} className={`${ui.input} flex-1`} />
        <button type="submit" className={ui.button}>{t.sendBtn}</button>
      </div>
    </form>
  );
}