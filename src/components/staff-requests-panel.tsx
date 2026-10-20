import { createAdminClient } from "@/lib/supabase/admin";
import { setStaffStatus } from "@/app/conseguir-personal/actions";
import { ui } from "@/lib/ui";

const STATUS_LABEL: Record<string, string> = {
  new: "Nueva",
  contacted: "Contactada",
  done: "Cerrada",
  discarded: "Descartada",
};

const PAY_LABEL: Record<string, string> = {
  hour: "por hora",
  day: "por día",
  project: "por trabajo",
  agreed: "a convenir",
};

export async function StaffRequestsPanel() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_requests")
    .select("id, created_at, requester_name, whatsapp, work_type, description, when_needed, people_count, pay_type, pay_pln, language, status, localities(name)")
    .neq("status", "discarded")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = data ?? [];

  return (
    <section className="mt-10">
      <h2 className={ui.sectionTitle}>Solicitudes de personal ({rows.length})</h2>
      {rows.length === 0 ? (
        <p className={ui.emptyBox}>No hay solicitudes.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((r) => {
            const digits = r.whatsapp.replace(/\D/g, "");
            const wa = digits.length === 9 ? `48${digits}` : digits;
            const locality = (r.localities as unknown as { name: string } | null)?.name;
            return (
              <li key={r.id} className={`${ui.card} space-y-2`}>
                <div className="flex flex-wrap gap-2">
                  <span className={ui.badge}>{STATUS_LABEL[r.status] ?? r.status}</span>
                  <span className={ui.badgeNeutral}>{r.people_count} {r.people_count === 1 ? "persona" : "personas"}</span>
                  <span className={ui.badgeNeutral}>{PAY_LABEL[r.pay_type] ?? r.pay_type}{r.pay_pln ? ` · ${r.pay_pln} zł` : ""}</span>
                  {locality && <span className={ui.badgeNeutral}>{locality}</span>}
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{r.work_type}</p>
                {r.description && <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{r.description}</p>}
                {r.when_needed && <p className={`text-sm ${ui.muted}`}>Cuándo: {r.when_needed}</p>}
                <p className="text-sm text-slate-900 dark:text-slate-100">
                  {r.requester_name} · <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={ui.link}>WhatsApp {r.whatsapp}</a>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["contacted", "done", "discarded"].map((s) => (
                    <form key={s} action={setStaffStatus.bind(null, r.id)}>
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className={ui.buttonSecondary}>{STATUS_LABEL[s]}</button>
                    </form>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}