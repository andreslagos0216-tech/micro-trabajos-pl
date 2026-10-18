import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getLang } from "@/lib/i18n";
import { kindDict } from "@/lib/i18n-kinds";
import { listingsText } from "@/lib/listings-i18n";
import { ui } from "@/lib/ui";

export default function PublishChooser() {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <Chooser />
      </Suspense>
    </main>
  );
}

async function Chooser() {
  await connection();
  const lang = await getLang();
  const k = kindDict[lang];
  const l = listingsText[lang];

  const options = [
    { href: "/jobs/new?kind=job", title: k.job.badge, text: k.job.formSubtitle, icon: "💼" },
    { href: "/jobs/new?kind=candidate", title: k.candidate.badge, text: k.candidate.formSubtitle, icon: "🔍" },
    { href: "/jobs/new?kind=service", title: k.service.badge, text: k.service.formSubtitle, icon: "🛠️" },
    { href: "/publicar/sale", title: l.sale, text: l.saleSubtitle, icon: "🛒" },
    { href: "/publicar/rent", title: l.rent, text: l.rentSubtitle, icon: "🏠" },
  ];

  return (
    <>
      <h1 className={ui.title}>{l.publish}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{l.pickCategoryHint}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.href}>
            <Link
              href={o.href}
              className="flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
            >
              <span className="text-2xl" aria-hidden="true">{o.icon}</span>
              <span>
                <span className="block font-semibold text-slate-900 dark:text-slate-50">{o.title}</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{o.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}