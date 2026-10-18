import type { Lang } from "@/lib/i18n";

export type Opt = { value: string; label: Record<Lang, string> };
export type FieldDef = {
  key: string;
  type: "text" | "number" | "select" | "bool";
  label: Record<Lang, string>;
  options?: Opt[];
  unit?: string;
};

const L = (pl: string, es: string, en: string): Record<Lang, string> => ({ pl, es, en });
const O = (value: string, pl: string, es: string, en: string): Opt => ({ value, label: L(pl, es, en) });

const carFields: FieldDef[] = [
  { key: "make", type: "text", label: L("Marka", "Marca", "Make") },
  { key: "model", type: "text", label: L("Model", "Modelo", "Model") },
  { key: "year", type: "number", label: L("Rok produkcji", "Año", "Year") },
  { key: "mileage", type: "number", label: L("Przebieg", "Kilometraje", "Mileage"), unit: "km" },
  {
    key: "fuel",
    type: "select",
    label: L("Paliwo", "Combustible", "Fuel"),
    options: [
      O("petrol", "Benzyna", "Gasolina", "Petrol"),
      O("diesel", "Diesel", "Diésel", "Diesel"),
      O("lpg", "LPG", "GLP", "LPG"),
      O("hybrid", "Hybryda", "Híbrido", "Hybrid"),
      O("electric", "Elektryczny", "Eléctrico", "Electric"),
    ],
  },
  {
    key: "gearbox",
    type: "select",
    label: L("Skrzynia biegów", "Caja de cambios", "Gearbox"),
    options: [
      O("manual", "Manualna", "Manual", "Manual"),
      O("automatic", "Automatyczna", "Automática", "Automatic"),
    ],
  },
];

const phoneFields: FieldDef[] = [
  { key: "make", type: "text", label: L("Marka", "Marca", "Brand") },
  { key: "model", type: "text", label: L("Model", "Modelo", "Model") },
  {
    key: "storage",
    type: "select",
    label: L("Pamięć", "Almacenamiento", "Storage"),
    options: ["32", "64", "128", "256", "512"].map((v) => O(v, `${v} GB`, `${v} GB`, `${v} GB`)),
  },
  { key: "color", type: "text", label: L("Kolor", "Color", "Color") },
  { key: "battery", type: "number", label: L("Stan baterii", "Estado de la batería", "Battery health"), unit: "%" },
  { key: "box", type: "bool", label: L("Z pudełkiem", "Con caja", "With original box") },
];

const propertyFields: FieldDef[] = [
  { key: "area_m2", type: "number", label: L("Powierzchnia", "Superficie", "Area"), unit: "m²" },
  { key: "rooms", type: "number", label: L("Liczba pokoi", "Habitaciones", "Rooms") },
];

const byCategory: Record<string, FieldDef[]> = {
  samochody: carFields,
  motocykle: carFields,
  dostawcze: carFields,
  telefony: phoneFields,
  "mieszkania-sprzedaz": propertyFields,
  "domy-sprzedaz": propertyFields,
};

export function fieldsFor(slug: string): FieldDef[] {
  return byCategory[slug] ?? [];
}

export function optionLabel(field: FieldDef, value: string, lang: Lang) {
  return field.options?.find((o) => o.value === value)?.label[lang] ?? value;
}