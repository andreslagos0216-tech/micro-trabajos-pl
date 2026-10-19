import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ConfirmBanner } from "@/components/confirm-banner";

export async function ConfirmGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email_confirmed_at || !user.email) return null;

  const lang = await getLang();
  return <ConfirmBanner email={user.email} lang={lang} />;
}