import { Suspense } from "react";
import { connection } from "next/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { LoginTabs } from "@/components/login-tabs";

type SearchParams = Promise<{
  tab?: string;
  error?: string;
  check?: string;
  reset?: string;
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
  await getLang();
  const { tab, error, check, reset } = await searchParams;

  const current = tab === "registro" || tab === "codigo" ? tab : "entrar";

  return (
    <>
      <h1 className={ui.title}>Acceso</h1>
      <p className={`mb-6 ${ui.subtitle}`}>Entra o crea tu cuenta sin salir de esta página.</p>
      <LoginTabs tab={current} error={error} check={check} reset={reset === "1"} />
    </>
  );
}