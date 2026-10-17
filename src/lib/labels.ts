import type { Lang } from "@/lib/i18n";

const categoryNames: Record<string, Record<Lang, string>> = {
  limpieza: { pl: "Sprzątanie", es: "Limpieza", en: "Cleaning" },
  mudanzas: { pl: "Przeprowadzki", es: "Mudanzas", en: "Removals" },
  conduccion: { pl: "Kierowcy", es: "Conducción", en: "Driving" },
  eventos: { pl: "Eventy", es: "Eventos", en: "Events" },
  reformas: { pl: "Remonty", es: "Reformas", en: "Renovation" },
  hosteleria: { pl: "Gastronomia", es: "Hostelería", en: "Hospitality" },
  tlumaczenia: { pl: "Tłumaczenia", es: "Traducción", en: "Translation" },
  uroda: { pl: "Uroda", es: "Belleza", en: "Beauty" },
  "praca-zdalna": { pl: "Praca zdalna", es: "Trabajo virtual", en: "Remote work" },
  edukacja: { pl: "Edukacja", es: "Educación", en: "Education" },
};

export function categoryName(slug: string | null | undefined, lang: Lang, fallback = "") {
  if (!slug || !categoryNames[slug]) return fallback;
  return categoryNames[slug][lang];
}

export const adLangLabel: Record<Lang, string> = {
  pl: "Język, w którym piszesz ogłoszenie",
  es: "Idioma en que escribes el anuncio",
  en: "Language you write the listing in",
};

export const adLangPlaceholder: Record<Lang, string> = {
  pl: "Wybierz język tekstu",
  es: "Elige el idioma del texto",
  en: "Choose the language of the text",
};

export const adLangHint: Record<Lang, string> = {
  pl: "Wybierz język, w którym napisałeś tytuł i opis. Pozostałe języki zostaną wygenerowane automatycznie.",
  es: "Elige el idioma en que escribiste el título y la descripción. Los demás idiomas se generarán automáticamente.",
  en: "Pick the language you wrote the title and description in. The other languages will be generated automatically.",
};
