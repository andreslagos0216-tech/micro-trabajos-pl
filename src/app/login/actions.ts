"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fail(tab: string, key: string, extra: Record<string, string> = {}): never {
  const params = new URLSearchParams({ tab, error: key, ...extra });
  redirect(`/login?${params.toString()}`);
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function signInWithPassword(formData: FormData) {
  const email = clean(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail("entrar", "credentials", { msg: error.message.slice(0, 200) });

  redirect("/");
}

export async function signUpWithPassword(formData: FormData) {
  const email = clean(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  if (password.length < 8) fail("registro", "short");

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) fail("registro", "register", { msg: error.message.slice(0, 200) });

  if (data.session) redirect("/");
  redirect("/login?tab=entrar&created=1");
}

export async function requestResetCode(formData: FormData) {
  const email = clean(formData.get("email"));
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) fail("recuperar", "code", { msg: error.message.slice(0, 200) });

  redirect(`/login?tab=recuperar&check=${encodeURIComponent(email)}`);
}

export async function setNewPassword(formData: FormData) {
  const email = clean(formData.get("email"));
  const token = clean(formData.get("token")).replace(/\s/g, "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const back = { check: email };

  if (password.length < 8) fail("recuperar", "short", back);

  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (verifyError) fail("recuperar", "invalid", { ...back, msg: verifyError.message.slice(0, 200) });

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) fail("recuperar", "invalid", { ...back, msg: updateError.message.slice(0, 200) });

  redirect("/perfil");
}