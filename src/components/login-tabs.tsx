import { ui } from "@/lib/ui";
import { signInWithPassword, signUpWithPassword, sendCode, verifyCode, resetPassword } from "@/app/login/actions";

type Tab = "entrar" | "registro" | "codigo";

export function LoginTabs({
  tab,
  error,
  check,
  reset,
}: {
  tab: Tab;
  error?: string;
  check?: string;
  reset?: boolean;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "entrar", label: "Entrar con contraseña" },
    { id: "registro", label: "Crear cuenta" },
    { id: "codigo", label: "Entrar con código" },
  ];

  const messages: Record<string, string> = {
    credenciales: "Correo o contraseña incorrectos.",
    corta: "La contraseña debe tener al menos 8 caracteres.",
    registro: "No se pudo crear la cuenta. Puede que el correo ya exista.",
    codigo: "No se pudo enviar el código. Inténtalo de nuevo en unos minutos.",
    codigo_no_valido: "El código no es válido o ha caducado.",
    enlace: "El enlace ya no es válido. Pide uno nuevo.",
  };

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2" aria-label="Acceso">
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

      {error && messages[error] && <p className={ui.errorBox}>{messages[error]}</p>}
      {reset && <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">Te enviamos un correo para cambiar la contraseña.</p>}

      {tab === "entrar" && (
        <form action={signInWithPassword} className={`${ui.card} space-y-4`}>
          <div>
            <label htmlFor="email1" className={ui.label}>Correo electrónico</label>
            <input id="email1" name="email" type="email" required autoComplete="email" className={ui.input} />
          </div>
          <div>
            <label htmlFor="password1" className={ui.label}>Contraseña</label>
            <input id="password1" name="password" type="password" required autoComplete="current-password" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>Entrar</button>
          <form action={resetPassword} className="text-center">
            <input type="hidden" name="email" value="" />
            <button type="submit" className="text-sm text-blue-700 underline dark:text-blue-400">¿Olvidaste la contraseña?</button>
          </form>
        </form>
      )}

      {tab === "registro" && (
        <form action={signUpWithPassword} className={`${ui.card} space-y-4`}>
          <div>
            <label htmlFor="email2" className={ui.label}>Correo electrónico</label>
            <input id="email2" name="email" type="email" required autoComplete="email" className={ui.input} />
          </div>
          <div>
            <label htmlFor="password2" className={ui.label}>Contraseña (mínimo 8 caracteres)</label>
            <input id="password2" name="password" type="password" required minLength={8} autoComplete="new-password" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>Crear cuenta</button>
        </form>
      )}

      {tab === "codigo" && !check && (
        <form action={sendCode} className={`${ui.card} space-y-4`}>
          <div>
            <label htmlFor="email3" className={ui.label}>Correo electrónico</label>
            <input id="email3" name="email" type="email" required autoComplete="email" className={ui.input} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>Enviarme un código</button>
        </form>
      )}

      {tab === "codigo" && check && (
        <form action={verifyCode} className={`${ui.card} space-y-4`}>
          <p className="text-sm text-slate-700 dark:text-slate-300">Escribe el código de 6 cifras que enviamos a <strong>{check}</strong>.</p>
          <input type="hidden" name="email" value={check} />
          <div>
            <label htmlFor="token" className={ui.label}>Código</label>
            <input id="token" name="token" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" className={`${ui.input} text-center text-2xl tracking-widest`} />
          </div>
          <button type="submit" className={`${ui.button} w-full`}>Confirmar</button>
        </form>
      )}
    </div>
  );
}