"use server";

import { createClient } from "@/lib/supabase/server";

export type ConfirmState = { sent?: boolean; ok?: boolean; error?: string } | null;

export async function sendConfirmCode(_prev: ConfirmState, _formData: FormData): Promise<ConfirmState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "no-session" };

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });
  if (error) return { error: "send" };
  return { sent: true };
}

export async function verifyConfirmCode(_prev: ConfirmState, formData: FormData): Promise<ConfirmState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "no-session" };

  const token = String(formData.get("token") ?? "").replace(/\s/g, "");
  const { error } = await supabase.auth.verifyOtp({ email: user.email, token, type: "email" });
  if (error) return { error: "invalid" };
  return { ok: true };
}