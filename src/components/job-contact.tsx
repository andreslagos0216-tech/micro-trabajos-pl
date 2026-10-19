import { setJobStatus } from "@/app/jobs/[id]/status-actions";
import { detailText } from "@/lib/detail-i18n";
import type { Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { ContactBlock } from "@/components/contact-block";

type Props = {
  lang: Lang;
  jobId: string;
  authorId: string;
  title: string;
  status: string;
  viewerId: string | null;
  contactMethod?: string | null;
};

export async function JobContact({ lang, jobId, authorId, title, status, viewerId, contactMethod }: Props) {
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

  return (
    <ContactBlock
      lang={lang}
      authorId={authorId}
      title={title}
      contactMethod={contactMethod ?? "chat"}
      viewerId={viewerId}
    />
  );
}