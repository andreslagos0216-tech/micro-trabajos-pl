import type { Lang } from "@/lib/i18n";

const pl = {
  navMap: "Mapa",
  mapTitle: "Ogłoszenia na mapie",
  mapSubtitle: "Zobacz ogłoszenia w całej Polsce. Kliknij punkt, aby zobaczyć szczegóły.",
  mapEmpty: "Brak ogłoszeń z lokalizacją.",
  openListing: "Otwórz ogłoszenie",
  nearMe: "W pobliżu mnie",
  nearMeLoading: "Szukam Twojej lokalizacji...",
  nearMeDenied: "Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki.",
  nearSearching: "Pokazuję ogłoszenia w promieniu",
  clearNear: "Wyczyść filtr",
  installTitle: "Zainstaluj SC opcje",
  installText: "Dodaj aplikację na ekran główny, aby otwierać ją jednym dotknięciem.",
  installButton: "Zainstaluj",
  installIosSteps: "Na iPhonie: dotknij przycisk Udostępnij (kwadrat ze strzałką) w Safari i wybierz „Dodaj do ekranu początkowego”.",
  installDismiss: "Nie teraz",
};

export type GeoDict = typeof pl;

const es: GeoDict = {
  navMap: "Mapa",
  mapTitle: "Anuncios en el mapa",
  mapSubtitle: "Mira anuncios en toda Polonia. Pulsa un punto para ver el anuncio.",
  mapEmpty: "No hay anuncios con ubicación.",
  openListing: "Abrir anuncio",
  nearMe: "Cerca de mí",
  nearMeLoading: "Buscando tu ubicación...",
  nearMeDenied: "No se pudo obtener tu ubicación. Revisa los permisos del navegador.",
  nearSearching: "Mostrando anuncios a",
  clearNear: "Quitar filtro",
  installTitle: "Instala SC opcje",
  installText: "Añádela a tu pantalla de inicio para abrirla con un toque.",
  installButton: "Instalar",
  installIosSteps: "En iPhone: toca el botón Compartir (cuadrado con flecha) en Safari y elige «Añadir a pantalla de inicio».",
  installDismiss: "Ahora no",
};

const en: GeoDict = {
  navMap: "Map",
  mapTitle: "Listings on the map",
  mapSubtitle: "See listings across Poland. Tap a dot to see the listing.",
  mapEmpty: "No listings with a location yet.",
  openListing: "Open listing",
  nearMe: "Near me",
  nearMeLoading: "Finding your location...",
  nearMeDenied: "Could not get your location. Check your browser permissions.",
  nearSearching: "Showing listings within",
  clearNear: "Clear filter",
  installTitle: "Install SC opcje",
  installText: "Add it to your home screen to open it with one tap.",
  installButton: "Install",
  installIosSteps: "On iPhone: tap the Share button (square with arrow) in Safari, then choose “Add to Home Screen”.",
  installDismiss: "Not now",
};

export const geoText: Record<Lang, GeoDict> = { pl, es, en };
