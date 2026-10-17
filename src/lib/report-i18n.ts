import type { Lang } from "@/lib/i18n";

export type ReportDict = {
  open: string;
  intro: string;
  reasonLabel: string;
  reasons: Record<"illegal" | "discrimination" | "scam" | "spam" | "other", string>;
  detailsLabel: string;
  detailsPlaceholder: string;
  submit: string;
  thanks: string;
  duplicate: string;
  loginFirst: string;
};

export const reportText: Record<Lang, ReportDict> = {
  pl: {
    open: "Zgłoś ogłoszenie",
    intro: "Zgłoszenie trafi do moderacji. Nie informujemy o tym autora ogłoszenia.",
    reasonLabel: "Powód zgłoszenia",
    reasons: {
      illegal: "Treść niezgodna z prawem",
      discrimination: "Dyskryminacja",
      scam: "Oszustwo lub podejrzana oferta",
      spam: "Spam lub reklama",
      other: "Inny powód",
    },
    detailsLabel: "Szczegóły (opcjonalnie)",
    detailsPlaceholder: "Opisz, co jest nieprawidłowe",
    submit: "Wyślij zgłoszenie",
    thanks: "Dziękujemy. Zgłoszenie zostało przyjęte.",
    duplicate: "Już wcześniej zgłosiłeś to ogłoszenie.",
    loginFirst: "Zaloguj się, aby zgłosić ogłoszenie.",
  },
  es: {
    open: "Denunciar anuncio",
    intro: "La denuncia pasará a moderación. No informamos de ello al autor del anuncio.",
    reasonLabel: "Motivo de la denuncia",
    reasons: {
      illegal: "Contenido ilegal",
      discrimination: "Discriminación",
      scam: "Estafa u oferta sospechosa",
      spam: "Spam o publicidad",
      other: "Otro motivo",
    },
    detailsLabel: "Detalles (opcional)",
    detailsPlaceholder: "Describe qué no es correcto",
    submit: "Enviar denuncia",
    thanks: "Gracias. Hemos recibido tu denuncia.",
    duplicate: "Ya habías denunciado este anuncio.",
    loginFirst: "Inicia sesión para denunciar un anuncio.",
  },
  en: {
    open: "Report listing",
    intro: "The report goes to moderation. We don't tell the listing author about it.",
    reasonLabel: "Reason for report",
    reasons: {
      illegal: "Illegal content",
      discrimination: "Discrimination",
      scam: "Scam or suspicious offer",
      spam: "Spam or advertising",
      other: "Other reason",
    },
    detailsLabel: "Details (optional)",
    detailsPlaceholder: "Describe what is wrong",
    submit: "Send report",
    thanks: "Thank you. Your report has been received.",
    duplicate: "You have already reported this listing.",
    loginFirst: "Log in to report a listing.",
  },
};
