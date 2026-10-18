import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { setJobStatus } from "@/app/jobs/[id]/status-actions";
import { detailText } from "@/lib/detail-i18n";
import type { Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

type Props = {
  lang: Lang;
  jobId: string;
  authorId: string;
  title: string;
  status: string;
  viewerId: string | null;
};

export async function JobContact({ lang, jobId, authorId, title, status, viewerId }: Props) {
  const t = detailText[lang];

  if (viewerId === authorId) {
    const actions = [
      { value: "active", label: t.activate },
      { value: "paused", label: t.pause },
      { value: "closed", label: t.filled },
    ].filter((a) => a.value !== status);

    return (
      <section className={ui.card}>
        <h2 className={ui.sectionTitle}>{t.ownerActions}</h2>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <form key={a.value} action={setJobStatus.bind(null, jobId)}>
              <input type="hidden" name="status" value={a.value} />
              <button type="submit" className={ui.buttonSecondary}>{a.label}</button>
            </form>
          ))}
        </div>
      </section>
    );
  }

  if (!viewerId) {
    return (
      <p className="text-sm">
        <Link href="/login" className={ui.link}>{t.loginToContact}</Link>
      </p>
    );
  }

  const admin = createAdminClient();
  const { data: contact } = await admin
    .from("profile_contacts")
    .select("phone")
    .eq("profile_id", authorId)
    .maybeSingle();

  const digits = (contact?.phone ?? "").replace(/\D/g, "");
  const number = digits.length === 9 ? `48${digits}` : digits;
  if (!number) return <p className={ui.muted}>{t.noPhone}</p>;

  const text = encodeURIComponent(`${t.whatsappText} ${title}`);
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className={ui.button}
    >
      {t.whatsapp}
    </a>
  );
}