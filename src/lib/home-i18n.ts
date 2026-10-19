import type { Lang } from "@/lib/i18n";

type TileText = { label: string; keywords: string };

export type HomeDict = {
  searchPlaceholder: string;
  searchEmpty: string;
  feedTitle: string;
  forYou: string;
  sortLabel: string;
  sortRecent: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  apply: string;
  emptyFeed: string;
  agreed: string;
  negotiable: string;
  perMonth: string;
  filters: Record<"all" | "job" | "service" | "candidate" | "sale" | "rent", string>;
  tiles: Record<"job" | "service" | "candidate" | "sale" | "rent" | "map", TileText>;
};

export const homeText: Record<Lang, HomeDict> = {
  pl: {
    searchPlaceholder: "Czego szukasz? Np. sprzątanie, rower, mieszkanie, tłumacz...",
    searchEmpty: "Nie znaleziono. Przewiń w dół, aby zobaczyć wszystkie ogłoszenia.",
    feedTitle: "Wszystkie ogłoszenia",
    forYou: "Dla Ciebie",
    sortLabel: "Sortuj",
    sortRecent: "Najnowsze",
    sortPriceAsc: "Cena: od najniższej",
    sortPriceDesc: "Cena: od najwyższej",
    apply: "Pokaż",
    emptyFeed: "Brak ogłoszeń dla tego wyboru.",
    agreed: "Do uzgodnienia",
    negotiable: "do uzgodnienia",
    perMonth: "mies.",
    filters: { all: "Wszystkie", job: "Praca", service: "Usługi", candidate: "Szukają pracy", sale: "Sprzedaż", rent: "Wynajem" },
    tiles: {
      job: { label: "Oferty pracy", keywords: "praca oferta zatrudnienie firma pracownik" },
      service: { label: "Usługi", keywords: "usługa usługi serwis naprawa sprzątanie tłumacz fryzjer" },
      candidate: { label: "Szukam pracy", keywords: "szukam pracy kandydat cv praca dorywcza" },
      sale: { label: "Sprzedaż", keywords: "sprzedaż sprzedam kupię rzeczy przedmioty samochód telefon" },
      rent: { label: "Wynajem", keywords: "wynajem mieszkanie pokój dom kawalerka" },
      map: { label: "Mapa", keywords: "mapa lokalizacja okolica" },
    },
  },
  es: {
    searchPlaceholder: "¿Qué buscas? Ej.: limpieza, bicicleta, piso, traductor...",
    searchEmpty: "No encontramos nada. Desplázate para ver todos los anuncios.",
    feedTitle: "Todos los anuncios",
    forYou: "Para ti",
    sortLabel: "Ordenar",
    sortRecent: "Más recientes",
    sortPriceAsc: "Precio: de menor a mayor",
    sortPriceDesc: "Precio: de mayor a menor",
    apply: "Mostrar",
    emptyFeed: "No hay anuncios para esta opción.",
    agreed: "A convenir",
    negotiable: "negociable",
    perMonth: "mes",
    filters: { all: "Todos", job: "Empleo", service: "Servicios", candidate: "Buscan trabajo", sale: "Compraventa", rent: "Alquiler" },
    tiles: {
      job: { label: "Ofertas de empleo", keywords: "trabajo empleo oferta empresa contratar job" },
      service: { label: "Servicios", keywords: "servicio servicios reparación limpieza traductor peluquería" },
      candidate: { label: "Busco trabajo", keywords: "busco trabajo candidato cv empleo buscar" },
      sale: { label: "Compraventa", keywords: "venta vender comprar compraventa producto coche teléfono" },
      rent: { label: "Alquiler", keywords: "alquiler alquilar piso habitación casa apartamento" },
      map: { label: "Mapa", keywords: "mapa ubicación zona cerca" },
    },
  },
  en: {
    searchPlaceholder: "What are you looking for? E.g. cleaning, bicycle, flat, translator...",
    searchEmpty: "Nothing found. Scroll down to see all listings.",
    feedTitle: "All listings",
    forYou: "For you",
    sortLabel: "Sort",
    sortRecent: "Newest",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    apply: "Show",
    emptyFeed: "No listings for this choice.",
    agreed: "Negotiable",
    negotiable: "negotiable",
    perMonth: "month",
    filters: { all: "All", job: "Jobs", service: "Services", candidate: "Looking for work", sale: "For sale", rent: "Rentals" },
    tiles: {
      job: { label: "Job offers", keywords: "job work offer employer hiring employment" },
      service: { label: "Services", keywords: "service repair cleaning translator hairdresser" },
      candidate: { label: "I'm looking for work", keywords: "looking for work candidate cv resume job seeker" },
      sale: { label: "For sale", keywords: "sale sell buy product car phone second hand" },
      rent: { label: "Rentals", keywords: "rent flat room house apartment rental" },
      map: { label: "Map", keywords: "map location area nearby" },
    },
  },
};