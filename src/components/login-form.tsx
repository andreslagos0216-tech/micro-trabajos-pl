"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ui } from "@/lib/ui";
import type { Dict } from "@/lib/i18n";

export function LoginForm({ t }: { t: Dict }) {
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
      <div className={`${ui.card} text-sm text-slate-700 dark:text-slate-300`}>
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{t.checkEmailTitle}</h2>
        <p>
          {t.checkEmailText}{" "}
          <strong className="text-slate-900 dark:text-slate-100">{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
      <div>
        <label htmlFor="email" className={ui.label}>{t.emailLabel}</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          required
          className={ui.input}
        />
      </div>

      <button type="submit" disabled={status === "sending"} className={`${ui.button} w-full`}>
        {status === "sending" ? t.sendingLink : t.sendLink}
      </button>

      {status === "error" && <p className={ui.errorBox}>{t.loginError}</p>}
    </form>
  );
}
