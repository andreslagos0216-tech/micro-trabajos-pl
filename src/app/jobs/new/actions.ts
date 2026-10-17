"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("job_posts").insert({
    author_id: user.id,
    city_id: Number(formData.get("city_id")),
    category_id: Number(formData.get("category_id")),
    title: String(formData.get("title")),
    description: String(formData.get("description")),
    pay_type: String(formData.get("pay_type")) as "hour" | "project",
    pay_pln: Number(formData.get("pay_pln")),
  });

  if (error) throw new Error(error.message);

  redirect("/");
}
