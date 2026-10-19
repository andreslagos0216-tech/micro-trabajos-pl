import type { Lang } from "@/lib/i18n";
import { authText } from "@/lib/auth-i18n";
import { ui } from "@/lib/ui";
import { signInWithPassword, signUpWithPassword, requestResetCode, setNewPassword } from "@/app/login/actions";

type Tab = "entrar" | "registro" | "recuperar";

export function LoginTabs({
  lang,
  tab,
  error,
  msg,
  check,
  created,
}: {
  lang: Lang;
  tab: Tab;
  error?: string;
  msg?: string;
  check?: string;
  created?: boolean;
}) {
  const t = authText[lang];

  const tabs: { id: Tab; label: string }[] = [
    { id: "entrar", label: t.tabLogin },
    { id: "registro", label: t.tabRegister },
    { id: "recuperar", label: t.tabRecover },
  ];

  const errorText = error ? (t.errors as Record<string, string>)[error] ?? t.errors.generic : null;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2" aria-label={t.title}>
        {tabs.map((item) => (
          <a
            key={item.id}
            href={`/login?tab=${item.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === item.id
                ? "bg-blue-700 text-white"
                : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {errorText && (
        <div className={ui.errorBox}>
          <p>{errorText}</p>
          {msg && <p className="mt-2 text-xs opacity-80">{t.detail} {msg}</p>}
        </div>
      )}

      {created && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          {t.created}
        </p>
      )}

      {tab === "entrar" && (
        <form action={signInWithPassword} className={`${ui.card} space-y-4`}>
          <div>
            <label htmlFor="email1" className={ui.label}>{t.email}</label>
            <input id="email1" name="email" type="email" required autoComplete="email" className={ui.input} />
          </div>
          <div>
            <label htmlFor="password1" className={ui.label}>{t.password}</label>
            <input id="password1" name="password" type="password" required autoComplete="current-password" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>{t.login}</button>
        </form>
      )}

      {tab === "registro" && (
        <form action={signUpWithPassword} className={`${ui.card} space-y-4`}>
          <div>
            <label htmlFor="email2" className={ui.label}>{t.email}</label>
            <input id="email2" name="email" type="email" required autoComplete="email" className={ui.input} />
          </div>
          <div>
            <label htmlFor="password2" className={ui.label}>{t.passwordNew}</label>
            <input id="password2" name="password" type="password" required minLength={8} autoComplete="new-password" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>{t.register}</button>
        </form>
      )}

      {tab === "recuperar" && !check && (
        <form action={requestResetCode} className={`${ui.card} space-y-4`}>
          <p className="text-sm text-slate-700 dark:text-slate-300">{t.recoverHint}</p>
          <div>
            <label htmlFor="email3" className={ui.label}>{t.email}</label>
            <input id="email3" name="email" type="email" required autoComplete="email" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>{t.sendCode}</button>
        </form>
      )}

      {tab === "recuperar" && check && (
        <form action={setNewPassword} className={`${ui.card} space-y-4`}>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t.recoverCheck} <strong>{check}</strong>
          </p>
          <input type="hidden" name="email" value={check} />
          <div>
            <label htmlFor="token" className={ui.label}>{t.codeLabel}</label>
            <input id="token" name="token" required autoComplete="one-time-code" className={`${ui.input} text-center text-xl tracking-widest`} />
          </div>
          <div>
            <label htmlFor="password3" className={ui.label}>{t.newPassword}</label>
            <input id="password3" name="password" type="password" required minLength={8} autoComplete="new-password" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>{t.save}</button>
        </form>
      )}
    </div>
  );
}