import { cookies } from "next/headers";

export type Lang = "pl" | "es" | "en";

const pl = {
  navOffers: "Ogłoszenia",
  navPublish: "Dodaj ogłoszenie",
  navLogin: "Zaloguj się",
  heroTitle: "Praca i usługi w Polsce",
  heroSubtitle: "Ogłoszenia między osobami prywatnymi: praca dorywcza, na godziny i usługi.",
  cardWorkTitle: "Szukam pracy",
  cardWorkText: "Przeglądaj ogłoszenia według miasta i kategorii.",
  cardHireTitle: "Szukam pracownika",
  cardHireText: "Opublikuj ofertę i otrzymuj zgłoszenia.",
  cardServiceTitle: "Oferuję usługi",
  cardServiceText: "Tłumacz, fryzjer, manicure, praca zdalna i inne.",
  searchLabel: "Szukaj",
  searchPlaceholder: "Szukaj po tytule",
  cityLabel: "Miasto",
  allCities: "Wszystkie miasta",
  searchButton: "Szukaj",
  featured: "Wyróżnione",
  recent: "Najnowsze",
  empty: "Brak ogłoszeń. Dodaj pierwsze.",
  loadError: "Nie udało się załadować ogłoszeń.",
  loading: "Ładowanie ofert...",
  badgeFeatured: "Wyróżnione",
  perHour: "godz.",
  perProject: "projekt",
  footerLegal: "Regulamin",
  footerPrivacy: "Polityka prywatności",
  footerRights: "Wszelkie prawa zastrzeżone.",
};

export type Dict = typeof pl;

const es: Dict = {
  navOffers: "Anuncios",
  navPublish: "Publicar anuncio",
  navLogin: "Iniciar sesión",
  heroTitle: "Empleo y servicios en Polonia",
  heroSubtitle: "Anuncios entre particulares: trabajo puntual, por horas y servicios.",
  cardWorkTitle: "Busco trabajo",
  cardWorkText: "Revisa los anuncios por ciudad y categoría.",
  cardHireTitle: "Busco personal",
  cardHireText: "Publica una oferta y recibe candidatos.",
  cardServiceTitle: "Ofrezco servicios",
  cardServiceText: "Traductor, peluquero, manicura, trabajo remoto y más.",
  searchLabel: "Buscar",
  searchPlaceholder: "Buscar por título",
  cityLabel: "Ciudad",
  allCities: "Todas las ciudades",
  searchButton: "Buscar",
  featured: "Destacados",
  recent: "Recientes",
  empty: "No hay anuncios todavía. Publica el primero.",
  loadError: "No se pudieron cargar los anuncios.",
  loading: "Cargando anuncios...",
  badgeFeatured: "Destacado",
  perHour: "hora",
  perProject: "proyecto",
  footerLegal: "Reglamento",
  footerPrivacy: "Política de privacidad",
  footerRights: "Todos los derechos reservados.",
};

const en: Dict = {
  navOffers: "Listings",
  navPublish: "Post a listing",
  navLogin: "Log in",
  heroTitle: "Jobs and services in Poland",
  heroSubtitle: "Listings between private people: short-term work, hourly jobs and services.",
  cardWorkTitle: "I'm looking for work",
  cardWorkText: "Browse listings by city and category.",
  cardHireTitle: "I'm hiring",
  cardHireText: "Post a job and receive applications.",
  cardServiceTitle: "I offer services",
  cardServiceText: "Translator, barber, manicurist, remote work and more.",
  searchLabel: "Search",
  searchPlaceholder: "Search by title",
  cityLabel: "City",
  allCities: "All cities",
  searchButton: "Search",
  featured: "Featured",
  recent: "Recent",
  empty: "No listings yet. Post the first one.",
  loadError: "Listings could not be loaded.",
  loading: "Loading listings...",
  badgeFeatured: "Featured",
  perHour: "hour",
  perProject: "project",
  footerLegal: "Terms",
  footerPrivacy: "Privacy policy",
  footerRights: "All rights reserved.",
};

export const dict: Record<Lang, Dict> = { pl, es, en };

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get("lang")?.value;
  return value === "es" || value === "en" ? value : "pl";
}
