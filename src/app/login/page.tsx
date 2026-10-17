"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
      <main className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-2xl font-bold">Revisa tu correo</h1>
        <p className="text-gray-600">
          Te hemos enviado un enlace para entrar a {email}. Ábrelo desde este mismo navegador.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
          className="w-full rounded border px-3 py-2"
        />
        <button
          disabled={status === "sending"}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {status === "sending" ? "Enviando..." : "Enviar enlace mágico"}
        </button>
        {status === "error" && (
          <p className="text-red-600">No se pudo enviar el enlace. Inténtalo de nuevo.</p>
        )}
      </form>
    </main>
  );
}
