"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendConfirmCode, verifyConfirmCode, type ConfirmState } from "@/app/confirmar/actions";
import { confirmText } from "@/lib/confirm-i18n";
import type { Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

export function ConfirmBanner({ email, lang }: { email: string; lang: Lang }) {
  const t = confirmText[lang];
  const router = useRouter();
  const [sent, sendAction, sending] = useActionState<ConfirmState, FormData>(sendConfirmCode, null);
  const [verified, verifyAction, verifying] = useActionState<ConfirmState, FormData>(verifyConfirmCode, null);

  useEffect(() => {
    if (verified?.ok) router.refresh();
  }, [verified, router]);

  const errorFor = (code?: string) =>
    code === "send" ? t.errSend : code === "invalid" ? t.errInvalid : code === "no-session" ? t.errSession : null;
  const error = errorFor(sent?.error) ?? errorFor(verified?.error);

  return (
    <section className="mx-auto mt-4 max-w-5xl px-4">
      <div className={`${ui.card} space-y-3 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40`}>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t.title}</p>
        <p className={`text-xs ${ui.muted}`}>
          {t.text} <strong>{email}</strong>
        </p>

        <form action={sendAction}>
          <button type="submit" disabled={sending} className={ui.buttonSecondary}>
            {sending ? t.sending : t.send}
          </button>
        </form>

        {sent?.sent && <p className="text-xs text-emerald-700 dark:text-emerald-300">{t.sentOk}</p>}

        <form action={verifyAction} className="flex flex-wrap gap-2">
          <input
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t.codePlaceholder}
            className={`${ui.input} max-w-[200px] tracking-widest`}
          />
          <button type="submit" disabled={verifying} className={ui.button}>
            {verifying ? t.verifying : t.verify}
          </button>
        </form>

        {error && <p className={ui.errorBox}>{error}</p>}
      </div>
    </section>
  );
}