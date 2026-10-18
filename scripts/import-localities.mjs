import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltan variables en .env.local");

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Quita tildes y convierte ł en l, para que "kamienna gora" encuentre "Kamienna Góra"
function normalize(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .trim();
}

// Formato GeoNames: columna 0 = id, 1 = nombre, 4 = latitud, 5 = longitud,
// 6 = clase (P = localidad), 10 = voivodato, 14 = población
const lines = readFileSync("data/PL.txt", "utf8").split("\n");
const rows = [];

for (const line of lines) {
  if (!line) continue;
  const c = line.split("\t");
  if (c[6] !== "P") continue;
  rows.push({
    id: Number(c[0]),
    name: c[1],
    name_norm: normalize(c[1]),
    voivodeship: c[10] || null,
    lat: Number(c[4]),
    lng: Number(c[5]),
    population: Number(c[14]) || 0,
  });
}

console.log(`Localidades encontradas: ${rows.length}`);

const size = 1000;
for (let i = 0; i < rows.length; i += size) {
  const { error } = await supabase.from("localities").upsert(rows.slice(i, i + size));
  if (error) throw error;
  console.log(`Guardadas ${Math.min(i + size, rows.length)} de ${rows.length}`);
}

console.log("Importación terminada");
