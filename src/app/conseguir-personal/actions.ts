"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, notifyAdmin } from "@/lib/notify";

const PAY = ["hour", "day", "project", "agreed"];
const LANGS = ["pl", "es", "en"];

export async function sendStaffRequest(formData: FormData) {
  const requesterName = String(formData.get("requester_name") ?? "").trim().slice(0, 80);
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/[^\d+\s-]/g, "").trim().slice(0, 20);
  const workType = String(formData.get("work_type") ?? "").trim().slice(0, 120);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000);
  const whenNeeded = String(formData.get("when_needed") ?? "").trim().slice(0, 120);
  const peopleCount = Math.min(50, Math.max(1, Number(formData.get("people_count") ?? 1)));
  const payType = String(formData.get("pay_type") ?? "hour");
  const payRaw = String(formData.get("pay_pln") ?? "").trim();
  const language = String(formData.get("language") ?? "es");
  const localityId = Number(formData.get("locality_id") ?? 0) || null;

  if (requesterName.length < 2 || whatsapp.replace(/\D/g, "").length < 7 || workType.length < 3) {
    redirect("/conseguir-personal?error=datos");
  }
  if (!PAY.includes(payType) || !LANGS.includes(language)) {
    redirect("/conseguir-personal?error=datos");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("staff_requests").insert({
    requester_name: requesterName,
    whatsapp,
    work_type: workType,
    description: description || null,
    when_needed: whenNeeded || null,
    people_count: peopleCount,
    pay_type: payType,
    pay_pln: payRaw && payType !== "agreed" ? Number(payRaw) : null,
    language,
    locality_id: localityId,
  });
  if (error) redirect("/conseguir-personal?error=guardar");

  await notifyAdmin(
    `Nueva solicitud de personal: ${workType}`,
    `<h2>Nueva solicitud de personal</h2>
     <p><strong>Trabajo:</strong> ${escapeHtml(workType)}</p>
     <p><strong>Personas:</strong> ${peopleCount}</p>
     <p><strong>Pago:</strong> ${escapeHtml(payType)}${payRaw ? ` · ${escapeHtml(payRaw)} zł` : ""}</p>
     <p><strong>Cuándo:</strong> ${escapeHtml(whenNeeded || "—")}</p>
     <p><strong>Detalles:</strong> ${escapeHtml(description || "—")}</p>
     <p><strong>Contacto:</strong> ${escapeHtml(requesterName)} · WhatsApp ${escapeHtml(whatsapp)}</p>
     <p><a href="https://taskgo.pl/admin">Ver en el panel de administración</a></p>`
  );

  redirect("/conseguir-personal?ok=1");
}

export async function setStaffStatus(id: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!["new", "contacted", "done", "discarded"].includes(status)) throw new Error("Estado no válido");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) redirect("/");

  const admin = createAdminClient();
  const { error } = await admin.from("staff_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin");
}