import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/text";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const term = normalizeText(raw).replace(/[%_,()*]/g, "").trim();
  if (term.length < 2) return NextResponse.json([]);

  const supabase = await createClient();
  const columns = "id, name, voivodeship, lat, lng, population";

  // Primero las que empiezan por el texto escrito, después las que lo contienen
  const { data: prefix } = await supabase
    .from("localities")
    .select(columns)
    .like("name_norm", `${term}%`)
    .order("population", { ascending: false })
    .limit(10);

  let results = prefix ?? [];
  if (results.length < 10) {
    const { data: contains } = await supabase
      .from("localities")
      .select(columns)
      .like("name_norm", `%${term}%`)
      .order("population", { ascending: false })
      .limit(10);
    const seen = new Set(results.map((r) => r.id));
    results = [...results, ...(contains ?? []).filter((r) => !seen.has(r.id))].slice(0, 10);
  }

  return NextResponse.json(results);
}