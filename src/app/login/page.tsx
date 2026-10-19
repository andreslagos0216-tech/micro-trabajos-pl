import { Suspense } from "react";
import { connection } from "next/server";
import { getLang } from "@/lib/i18n";
import { authText } from "@/lib/auth-i18n";
import { ui } from "@/lib/ui";
import { LoginTabs } from "@/components/login-tabs";

type SearchParams = Promise<{
  tab?: string;
  error?: string;
  msg?: string;
  check?: string;
  created?: string;
}>;

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className={`${ui.container} max-w-md`}>
      <Suspense fallback={null}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = authText[lang];
  const { tab, error, msg, check, created } = await searchParams;
  const current = tab === "registro" || tab === "recuperar" ? tab : "entrar";

  return (
    <>
      <h1 className={ui.title}>{t.title}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.subtitle}</p>
      <LoginTabs
        lang={lang}
        tab={current}
        error={error}
        msg={msg}
        check={check}
        created={created === "1"}
      />
    </>
  );
}