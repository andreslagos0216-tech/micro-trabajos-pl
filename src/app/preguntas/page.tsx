import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getLang } from "@/lib/i18n";
import { faqText } from "@/lib/faq-text";
import { ui } from "@/lib/ui";

export default function FaqPage() {
  return (
    <main className={`${ui.container} max-w-2xl`}>
      <Suspense fallback={null}>
        <FaqContent />
      </Suspense>
    </main>
  );
}

async function FaqContent() {
  await connection();
  const lang = await getLang();
  const t = faqText[lang];

  return (
    <>
      <h1 className={ui.title}>{t.title}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.subtitle}</p>

      <div className="space-y-3">
        {t.items.map((item) => (
          <details key={item.q} className={`${ui.card} group`}>
            <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 dark:text-slate-50 [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-8 text-sm">
        <Link href="/conseguir-personal" className={ui.link}>→</Link>
      </p>
    </>
  );
}