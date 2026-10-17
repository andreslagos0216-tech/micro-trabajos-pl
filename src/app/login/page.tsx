"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ui } from "@/lib/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <main className={`${ui.container} max-w-md`}>
        <h1 className={ui.title}>Revisa tu correo</h1>
        <p className={`mt-4 ${ui.card} text-sm text-slate-700 dark:text-slate-300`}>
          Enviamos un enlace de acceso a <strong className="text-slate-900 dark:text-slate-100">{email}</strong>. Ábrelo desde este mismo navegador.
        </p>
      </main>
    );
  }

  return (
    <main className={`${ui.container} max-w-md`}>
      <h1 className={ui.title}>Iniciar sesión</h1>
      <p className={`mb-6 ${ui.subtitle}`}>Te enviaremos un enlace al correo. No necesitas contraseña.</p>

      <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
        <div>
          <label htmlFor="email" className={ui.label}>Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className={ui.input}
          />
        </div>

        <button type="submit" disabled={status === "sending"} className={`${ui.button} w-full`}>
          {status === "sending" ? "Enviando..." : "Enviar enlace de acceso"}
        </button>

        {status === "error" && (
          <p className={ui.errorBox}>No se pudo enviar el enlace. Revisa el correo e inténtalo de nuevo.</p>
        )}
      </form>
    </main>
  );
}
