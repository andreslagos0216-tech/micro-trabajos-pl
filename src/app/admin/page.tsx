import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ui } from "@/lib/ui";
import { moderateListing } from "./actions";

const REASON: Record<string, string> = {
  scam: "Posible estafa o pago por adelantado",
  contact: "Contacto escrito en el texto (debe ir por el chat)",
  no_photos: "Sin fotos",
  new_author: "Autor nuevo (primeros anuncios)",
};

const TABLE_LABEL: Record<string, string> = {
  job_posts: "Empleo",
  sale_listings: "Compraventa",
  rental_listings: "Alquiler",
};

export default function AdminPage() {
  return (
    <main className={ui.container}>
      <Suspense fallback={null}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) redirect("/");

  const admin = createAdminClient();
  const cols = "id, title, description, review_note, created_at";
  const [jobs, sales, rents] = await Promise.all([
    admin.from("job_posts").select(cols).eq("status", "pending_review").order("created_at").limit(100),
    admin.from("sale_listings").select(cols).eq("status", "pending_review").order("created_at").limit(100),
    admin.from("rental_listings").select(cols).eq("status", "pending_review").order("created_at").limit(100),
  ]);

  const items = [
    ...(jobs.data ?? []).map((x) => ({ ...x, table: "job_posts" })),
    ...(sales.data ?? []).map((x) => ({ ...x, table: "sale_listings" })),
    ...(rents.data ?? []).map((x) => ({ ...x, table: "rental_listings" })),
  ];

  return (
    <>
      <h1 className={ui.title}>Revisión de anuncios</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{items.length} pendientes</p>

      {items.length === 0 && <p className={ui.emptyBox}>No hay anuncios pendientes.</p>}

      <ul className="space-y-4">
        {items.map((item) => {
          const reasons = (item.review_note ?? "").split(",").filter(Boolean);
          return (
            <li key={`${item.table}-${item.id}`} className={`${ui.card} space-y-3`}>
              <div className="flex flex-wrap gap-2">
                <span className={ui.badgeNeutral}>{TABLE_LABEL[item.table]}</span>
                {reasons.map((r: string) => (
                  <span key={r} className={ui.badge}>{REASON[r] ?? r}</span>
                ))}
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
              <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                {item.description.slice(0, 400)}
              </p>
              <form action={moderateListing} className="flex flex-wrap gap-2">
                <input type="hidden" name="table" value={item.table} />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" name="decision" value="approve" className={ui.button}>Aprobar</button>
                <button type="submit" name="decision" value="reject" className={ui.buttonSecondary}>Rechazar</button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}