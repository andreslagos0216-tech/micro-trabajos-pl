import type { Lang } from "@/lib/i18n";

export type Kind = "job" | "candidate" | "service";

type KindText = {
  label: string;
  badge: string;
  formTitle: string;
  formSubtitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  rateLabel: string;
  submit: string;
};

export type KindDict = Record<Kind, KindText> & {
  all: string;
  adLanguage: string;
  availability: string;
  availabilityPlaceholder: string;
  spokenLanguages: string;
  autoTranslated: string;
  langNames: Record<Lang, string>;
};

const langNames = { pl: "Polski", es: "Español", en: "English" };

const pl: KindDict = {
  job: {
    label: "Praca",
    badge: "Oferta pracy",
    formTitle: "Dodaj ofertę pracy",
    formSubtitle: "Szukasz pracownika? Opisz zadanie i stawkę.",
    titleLabel: "Tytuł oferty",
    titlePlaceholder: "Np. Sprzątanie mieszkania 60 m²",
    descLabel: "Opis pracy",
    descPlaceholder: "Zadania, godziny, wymagania",
    rateLabel: "Stawka",
    submit: "Opublikuj ofertę",
  },
  candidate: {
    label: "Szukam pracy",
    badge: "Szukam pracy",
    formTitle: "Pokaż, że szukasz pracy",
    formSubtitle: "Opisz swoje doświadczenie. Pracodawcy zobaczą Twoje ogłoszenie.",
    titleLabel: "Jakiej pracy szukasz?",
    titlePlaceholder: "Np. Kelner z doświadczeniem",
    descLabel: "O sobie i doświadczeniu",
    descPlaceholder: "Doświadczenie, umiejętności, referencje",
    rateLabel: "Oczekiwana stawka",
    submit: "Opublikuj ogłoszenie",
  },
  service: {
    label: "Oferuję usługi",
    badge: "Usługa",
    formTitle: "Dodaj swoją usługę",
    formSubtitle: "Opisz, co oferujesz i ile to kosztuje.",
    titleLabel: "Nazwa usługi",
    titlePlaceholder: "Np. Tłumaczenia PL–ES",
    descLabel: "Opis usługi",
    descPlaceholder: "Co obejmuje, czas realizacji, doświadczenie",
    rateLabel: "Cena",
    submit: "Opublikuj usługę",
  },
  all: "Wszystkie",
  adLanguage: "Język ogłoszenia",
  availability: "Dostępność",
  availabilityPlaceholder: "Np. pn–pt po 17:00, weekendy",
  spokenLanguages: "Języki",
  autoTranslated: "Przetłumaczono automatycznie",
  langNames,
};

const es: KindDict = {
  job: {
    label: "Empleo",
    badge: "Oferta de empleo",
    formTitle: "Publicar oferta de empleo",
    formSubtitle: "¿Buscas personal? Describe el trabajo y la tarifa.",
    titleLabel: "Título de la oferta",
    titlePlaceholder: "Ej.: Limpieza de piso de 60 m²",
    descLabel: "Descripción del trabajo",
    descPlaceholder: "Tareas, horario, requisitos",
    rateLabel: "Tarifa",
    submit: "Publicar oferta",
  },
  candidate: {
    label: "Busco trabajo",
    badge: "Busco trabajo",
    formTitle: "Muestra que buscas trabajo",
    formSubtitle: "Describe tu experiencia. Los empleadores verán tu anuncio.",
    titleLabel: "¿Qué tipo de trabajo buscas?",
    titlePlaceholder: "Ej.: Camarero con experiencia",
    descLabel: "Sobre ti y tu experiencia",
    descPlaceholder: "Experiencia, habilidades, referencias",
    rateLabel: "Tarifa esperada",
    submit: "Publicar mi anuncio",
  },
  service: {
    label: "Ofrezco servicios",
    badge: "Servicio",
    formTitle: "Publica tu servicio",
    formSubtitle: "Describe qué ofreces y cuánto cuesta.",
    titleLabel: "Nombre del servicio",
    titlePlaceholder: "Ej.: Traducciones PL–ES",
    descLabel: "Descripción del servicio",
    descPlaceholder: "Qué incluye, plazos, experiencia",
    rateLabel: "Precio",
    submit: "Publicar servicio",
  },
  all: "Todos",
  adLanguage: "Idioma del anuncio",
  availability: "Disponibilidad",
  availabilityPlaceholder: "Ej.: L–V tras las 17:00, fines de semana",
  spokenLanguages: "Idiomas",
  autoTranslated: "Traducido automáticamente",
  langNames,
};

const en: KindDict = {
  job: {
    label: "Jobs",
    badge: "Job offer",
    formTitle: "Post a job offer",
    formSubtitle: "Looking for workers? Describe the job and the rate.",
    titleLabel: "Job title",
    titlePlaceholder: "E.g.: Cleaning a 60 m² flat",
    descLabel: "Job description",
    descPlaceholder: "Tasks, hours, requirements",
    rateLabel: "Rate",
    submit: "Publish offer",
  },
  candidate: {
    label: "I'm looking for work",
    badge: "Looking for work",
    formTitle: "Show that you're looking for work",
    formSubtitle: "Describe your experience. Employers will see your listing.",
    titleLabel: "What kind of work are you looking for?",
    titlePlaceholder: "E.g.: Experienced waiter",
    descLabel: "About you and your experience",
    descPlaceholder: "Experience, skills, references",
    rateLabel: "Expected rate",
    submit: "Publish my listing",
  },
  service: {
    label: "I offer services",
    badge: "Service",
    formTitle: "Post your service",
    formSubtitle: "Describe what you offer and the price.",
    titleLabel: "Service name",
    titlePlaceholder: "E.g.: PL–EN translations",
    descLabel: "Service description",
    descPlaceholder: "What it includes, timing, experience",
    rateLabel: "Price",
    submit: "Publish service",
  },
  all: "All",
  adLanguage: "Listing language",
  availability: "Availability",
  availabilityPlaceholder: "E.g.: Mon–Fri after 17:00, weekends",
  spokenLanguages: "Languages",
  autoTranslated: "Automatically translated",
  langNames,
};

export const kindDict: Record<Lang, KindDict> = { pl, es, en };
