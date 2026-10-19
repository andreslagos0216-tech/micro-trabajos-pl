import type { Lang } from "@/lib/i18n";

type FormDict = {
  categoryLabel: string;
  categoryPlaceholder: string;
  categoryNoResults: string;
  customLabel: string;
  customPlaceholder: string;
  customHint: string;
  contactLabel: string;
  contactChat: string;
  contactWhatsapp: string;
  contactBoth: string;
  contactHint: string;
  searchJobsTitle: string;
  searchJobsText: string;
};

export const formText: Record<Lang, FormDict> = {
  pl: {
    categoryLabel: "Kategoria",
    categoryPlaceholder: "Zacznij pisać, np. „spr” albo „opie”",
    categoryNoResults: "Brak wyników. Wybierz „Inne”.",
    customLabel: "Opisz swoją kategorię",
    customPlaceholder: "Np. Naprawa rowerów",
    customHint: "Podaj krótko, jaką pracę lub usługę oferujesz.",
    contactLabel: "Jak mają się z Tobą kontaktować?",
    contactChat: "Czat w aplikacji",
    contactWhatsapp: "WhatsApp",
    contactBoth: "Czat i WhatsApp",
    contactHint: "WhatsApp pokaże się tylko, jeśli zapiszesz numer w swoim profilu.",
    searchJobsTitle: "Szukaj ofert pracy",
    searchJobsText: "Przeglądaj oferty dostępne w Twojej okolicy i w całej Polsce.",
  },
  es: {
    categoryLabel: "Categoría",
    categoryPlaceholder: "Empieza a escribir, p. ej. «lim» o «cuid»",
    categoryNoResults: "Sin resultados. Elige «Otro».",
    customLabel: "Describe tu categoría",
    customPlaceholder: "Ej.: Reparación de bicicletas",
    customHint: "Indica brevemente qué trabajo o servicio ofreces.",
    contactLabel: "¿Cómo quieres que te contacten?",
    contactChat: "Chat dentro de la app",
    contactWhatsapp: "WhatsApp",
    contactBoth: "Chat y WhatsApp",
    contactHint: "WhatsApp solo se mostrará si guardas tu número en tu perfil.",
    searchJobsTitle: "Buscar ofertas de empleo",
    searchJobsText: "Mira las ofertas disponibles en tu zona y en toda Polonia.",
  },
  en: {
    categoryLabel: "Category",
    categoryPlaceholder: "Start typing, e.g. “clea” or “child”",
    categoryNoResults: "No results. Choose “Other”.",
    customLabel: "Describe your category",
    customPlaceholder: "E.g.: Bicycle repair",
    customHint: "Briefly say what job or service you offer.",
    contactLabel: "How should people contact you?",
    contactChat: "In-app chat",
    contactWhatsapp: "WhatsApp",
    contactBoth: "Chat and WhatsApp",
    contactHint: "WhatsApp will only show if you save your number in your profile.",
    searchJobsTitle: "Search job offers",
    searchJobsText: "Browse the offers available in your area and across Poland.",
  },
};