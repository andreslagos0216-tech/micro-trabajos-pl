import { reportListing } from "@/app/jobs/[id]/report-actions";
import { reportText, type ReportDict } from "@/lib/report-i18n";
import type { Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

type ReasonKey = keyof ReportDict["reasons"];

export function ReportForm({
  targetType,
  targetId,
  returnPath,
  lang,
}: {
  targetType: "job" | "sale" | "rent";
  targetId: string;
  returnPath: string;
  lang: Lang;
}) {
  const t = reportText[lang];
  const reportAction = reportListing.bind(null, targetType, targetId, returnPath);
  const reasons = Object.keys(t.reasons) as ReasonKey[];

  return (
    <details className="rounded-md border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
      <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-200">{t.open}</summary>

      <form action={reportAction} className="mt-4 space-y-4">
        <p className={ui.muted}>{t.intro}</p>

        <div>
          <label htmlFor="reason" className={ui.label}>{t.reasonLabel}</label>
          <select id="reason" name="reason" required defaultValue="" className={ui.input}>
            <option value="" disabled>{t.reasonLabel}</option>
            {reasons.map((key) => (
              <option key={key} value={key}>{t.reasons[key]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="details" className={ui.label}>{t.detailsLabel}</label>
          <textarea id="details" name="details" rows={3} maxLength={500} placeholder={t.detailsPlaceholder} className={ui.input} />
        </div>

        <button type="submit" className={ui.buttonSecondary}>{t.submit}</button>
      </form>
    </details>
  );
}