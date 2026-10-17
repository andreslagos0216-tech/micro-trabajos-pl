import { Suspense } from "react";
import { connection } from "next/server";
import { dict, getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  await connection();
  const t = dict[await getLang()];

  return (
    <main className={`${ui.container} max-w-md`}>
      <h1 className={ui.title}>{t.loginTitle}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.loginSubtitle}</p>
      <LoginForm t={t} />
    </main>
  );
}
