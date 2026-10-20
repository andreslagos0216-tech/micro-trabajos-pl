import type { Lang } from "@/lib/i18n";

const LOCALE: Record<Lang, string> = { pl: "pl-PL", es: "es-ES", en: "en-GB" };

// Fecha y hora en el formato del idioma elegido, por ejemplo "20/10/26, 14:05"
export function formatDateTime(value: string | Date, lang: Lang): string {
  return new Date(value).toLocaleString(LOCALE[lang], { dateStyle: "short", timeStyle: "short" });
}

// Solo la fecha, por ejemplo "20/10/2026"
export function formatDate(value: string | Date, lang: Lang): string {
  return new Date(value).toLocaleDateString(LOCALE[lang]);
}