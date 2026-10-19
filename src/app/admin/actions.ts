"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TABLES = ["job_posts", "sale_listings", "rental_listings"] as const;

export async function moderateListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) redirect("/");

  const table = String(formData.get("table")) as (typeof TABLES)[number];
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  if (!TABLES.includes(table) || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Datos no válidos");

  const status = decision === "approve" ? "active" : "closed";
  const admin = createAdminClient();
  const { error } = await admin
    .from(table as "job_posts")
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}