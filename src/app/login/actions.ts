"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credenciales");

  redirect("/");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  if (password.length < 8) redirect("/login?error=corta&tab=registro");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect("/login?error=registro&tab=registro");

  // Si Supabase requiere confirmar el correo, el usuario verá el aviso en la página
  redirect("/login?tab=entrar&created=1");
}

export async function requestResetCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) redirect("/login?tab=recuperar&error=codigo");

  redirect(`/login?tab=recuperar&check=${encodeURIComponent(email)}`);
}

export async function setNewPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").replace(/\s/g, "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  if (password.length < 8) redirect(`/login?tab=recuperar&check=${encodeURIComponent(email)}&error=corta`);

  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (verifyError) redirect(`/login?tab=recuperar&check=${encodeURIComponent(email)}&error=codigo_no_valido`);

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) redirect(`/login?tab=recuperar&check=${encodeURIComponent(email)}&error=codigo_no_valido`);

  redirect("/perfil");
}