import { Suspense } from "react";
import { connection } from "next/server";
import { ui } from "@/lib/ui";
import { LoginTabs } from "@/components/login-tabs";

type SearchParams = Promise<{
  tab?: string;
  error?: string;
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
  const { tab, error, check, created } = await searchParams;
  const current = tab === "registro" || tab === "recuperar" ? tab : "entrar";

  return (
    <>
      <h1 className={ui.title}>Acceso</h1>
      <p className={`mb-6 ${ui.subtitle}`}>Entra o crea tu cuenta sin salir de esta página.</p>
      <LoginTabs tab={current} error={error} check={check} created={created === "1"} />
    </>
  );
}