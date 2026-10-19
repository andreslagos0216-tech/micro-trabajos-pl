import type { Lang } from "@/lib/i18n";

// Ejemplos que aparecen dentro de cada campo del formulario, para orientar al usuario
export const examples: Record<Lang, Record<string, string>> = {
  pl: {
    title: "Np. Rower górski Kross 2019, stan bardzo dobry",
    description: "Opisz stan, wyposażenie, historię naprawy, powód sprzedaży. Np.: Wymieniony napęd w 2024, hamulce tarczowe, komplet kluczy w cenie.",
    rent_description: "Opisz mieszkanie: piętro, dojazd, zasady, co jest w cenie. Np.: 2 pokoje, 45 m², 3 piętro, blisko przystanku, umeblowane, woda i prąd osobno.",
    price: "Np. 350",
    rent: "Np. 2200",
    deposit: "Np. 2200 (zwykle równa miesięcznemu czynszowi)",
    area: "Np. 45",
    rooms: "Np. 2",
    photos: "Dodaj zdjęcia z różnych stron: całość, szczegóły, wady. Pierwsze zdjęcie będzie głównym.",
  },
  es: {
    title: "Ej.: Bicicleta de montaña Kross 2019, muy buen estado",
    description: "Describe el estado, el equipamiento, las reparaciones y el motivo de la venta. Ej.: Transmisión cambiada en 2024, frenos de disco, juego de llaves incluido.",
    rent_description: "Describe el piso: planta, transporte, normas y qué incluye. Ej.: 2 habitaciones, 45 m², 3.º piso, cerca de la parada, amueblado, agua y luz aparte.",
    price: "Ej.: 350",
    rent: "Ej.: 2200",
    deposit: "Ej.: 2200 (normalmente igual al alquiler mensual)",
    area: "Ej.: 45",
    rooms: "Ej.: 2",
    photos: "Añade fotos desde distintos ángulos: conjunto, detalles y defectos. La primera será la foto principal.",
  },
  en: {
    title: "E.g.: 2019 Kross mountain bike, very good condition",
    description: "Describe the condition, extras, repairs and reason for selling. E.g.: Drivetrain replaced in 2024, disc brakes, tool kit included.",
    rent_description: "Describe the flat: floor, transport, rules and what is included. E.g.: 2 rooms, 45 m², 3rd floor, near the stop, furnished, water and electricity separate.",
    price: "E.g.: 350",
    rent: "E.g.: 2200",
    deposit: "E.g.: 2200 (usually equal to one month's rent)",
    area: "E.g.: 45",
    rooms: "E.g.: 2",
    photos: "Add photos from different angles: the whole item, details and any flaws. The first photo will be the main one.",
  },
};