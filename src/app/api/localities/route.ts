import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/text";
import { voivodeshipNames } from "@/lib/voivodeships";

type Row = {
  id: number;
  name: string;
  name_norm: string;
  voivodeship: string | null;
  lat: number;
  lng: number;
  population: number;
};

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const term = normalizeText(raw).replace(/[%_,()*]/g, "").trim();
  if (term.length < 2) return NextResponse.json([]);

  const supabase = await createClient();
  const columns = "id, name, name_norm, voivodeship, lat, lng, population";

  // Primero las que empiezan por el texto; si hay pocas, también las que lo contienen
  const { data: prefix } = await supabase
    .from("localities")
    .select(columns)
    .like("name_norm", `${term}%`)
    .limit(60);

  let rows = (prefix ?? []) as Row[];
  if (rows.length < 10) {
    const { data: contains } = await supabase
      .from("localities")
      .select(columns)
      .like("name_norm", `%${term}%`)
      .limit(60);
    const seen = new Set(rows.map((r) => r.id));
    rows = [...rows, ...((contains ?? []) as Row[]).filter((r) => !seen.has(r.id))];
  }

  const ranked = rows
    .map((row) => ({
      row,
      rank: row.name_norm === term ? 0 : row.name_norm.startsWith(term) ? 1 : 2,
    }))
    .sort((a, b) => a.rank - b.rank || b.row.population - a.row.population || a.row.name.length - b.row.name.length)
    .slice(0, 10)
    .map(({ row }) => ({
      id: row.id,
      name: row.name,
      voivodeship: row.voivodeship ? (voivodeshipNames[row.voivodeship] ?? null) : null,
      lat: row.lat,
      lng: row.lng,
    }));

  return NextResponse.json(ranked);
}