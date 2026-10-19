import type { Lang } from "@/lib/i18n";

export const tipsText: Record<Lang, { title: string; items: { title: string; text: string }[] }> = {
  pl: {
    title: "Wskazówki",
    items: [
      { title: "Dodaj zdjęcia", text: "Ogłoszenia ze zdjęciami dostają znacznie więcej odpowiedzi." },
      { title: "Podaj konkretną cenę", text: "Jasna cena lub opcja „do uzgodnienia” przyspiesza kontakt." },
      { title: "Szukasz pracy?", text: "Wybierz „Szukają pracy” w Publikuj, by przedstawić swoje umiejętności." },
      { title: "Bezpieczeństwo", text: "Nie wysyłaj pieniędzy przed obejrzeniem towaru lub podpisaniem umowy." },
    ],
  },
  es: {
    title: "Consejos",
    items: [
      { title: "Añade fotos", text: "Los anuncios con fotos reciben muchas más respuestas." },
      { title: "Indica un precio claro", text: "Un precio concreto o «a convenir» agiliza el contacto." },
      { title: "¿Buscas trabajo?", text: "Publica un anuncio de «Busco trabajo» para mostrar tus habilidades." },
      { title: "Seguridad", text: "No envíes dinero antes de ver el producto o firmar un acuerdo." },
    ],
  },
  en: {
    title: "Tips",
    items: [
      { title: "Add photos", text: "Listings with photos get many more replies." },
      { title: "Set a clear price", text: "A specific price or “negotiable” speeds up contact." },
      { title: "Looking for work?", text: "Post a “Looking for work” listing to show your skills." },
      { title: "Stay safe", text: "Don't send money before seeing the item or signing an agreement." },
    ],
  },
};