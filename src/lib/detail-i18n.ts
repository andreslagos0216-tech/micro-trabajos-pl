import type { Lang } from "@/lib/i18n";

type DetailDict = {
  activate: string;
  pause: string;
  filled: string;
  ownerActions: string;
  whatsapp: string;
  whatsappText: string;
  noPhone: string;
  loginToContact: string;
  statusNames: Record<string, string>;
};

const pl: DetailDict = {
  activate: "Aktywuj ogłoszenie",
  pause: "Wstrzymaj",
  filled: "Oznacz jako zatrudniono",
  ownerActions: "Zarządzaj ogłoszeniem",
  whatsapp: "Napisz na WhatsApp",
  whatsappText: "Dzień dobry, piszę w sprawie ogłoszenia:",
  noPhone: "Autor nie podał numeru telefonu.",
  loginToContact: "Zaloguj się, aby zobaczyć kontakt.",
  statusNames: { active: "Aktywne", paused: "Wstrzymane", closed: "Zatrudniono" },
};

const es: DetailDict = {
  activate: "Activar anuncio",
  pause: "Pausar",
  filled: "Marcar como cubierta",
  ownerActions: "Gestionar anuncio",
  whatsapp: "Escribir por WhatsApp",
  whatsappText: "Hola, escribo por tu anuncio:",
  noPhone: "El autor no ha indicado teléfono.",
  loginToContact: "Inicia sesión para ver el contacto.",
  statusNames: { active: "Activo", paused: "Pausado", closed: "Cubierta" },
};

const en: DetailDict = {
  activate: "Activate listing",
  pause: "Pause",
  filled: "Mark as filled",
  ownerActions: "Manage listing",
  whatsapp: "Message on WhatsApp",
  whatsappText: "Hello, I'm writing about your listing:",
  noPhone: "The author has not provided a phone number.",
  loginToContact: "Log in to see contact details.",
  statusNames: { active: "Active", paused: "Paused", closed: "Filled" },
};

export const detailText: Record<Lang, DetailDict> = { pl, es, en };