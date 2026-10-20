import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://taskgo.pl";

const SLUG_TO_KEY: Record<string, string> = {
  "limpieza": "limpieza",
  "sprzatanie-domow": "limpieza",
  "odsniezanie-ogrody": "nieve",
  "mudanzas": "mudanzas",
  "przeprowadzki": "mudanzas",
  "opieka-dzieci-seniorzy": "cuidado",
  "opieka-dzieci": "cuidado",
  "masaze-pielegnacja": "masajes",
  "drobne-naprawy": "reparaciones",
  "pomoc-ogolna": "ayuda",
};

function slugify(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [jobs, sales, rents, jobsForCities] = await Promise.all([
    admin.from("job_posts").select("id, bumped_at").eq("status", "active").limit(5000),
    admin.from("sale_listings").select("id, bumped_at").eq("status", "active").limit(5000),
    admin.from("rental_listings").select("id, bumped_at").eq("status", "active").limit(5000),
    admin.from("job_posts").select("locality_id, categories(slug)").eq("status", "active").not("locality_id", "is", null).limit(5000),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/listados/sale`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/listados/rent`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/mapa`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/regulamin`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/polityka-prywatnosci`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const jobPages = (jobs.data ?? []).map((j) => ({
    url: `${BASE}/jobs/${j.id}`,
    lastModified: new Date(j.bumped_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const salePages = (sales.data ?? []).map((s) => ({
    url: `${BASE}/listados/sale/${s.id}`,
    lastModified: new Date(s.bumped_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const rentPages = (rents.data ?? []).map((r) => ({
    url: `${BASE}/listados/rent/${r.id}`,
    lastModified: new Date(r.bumped_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Combinaciones ciudad + categoría que tienen al menos un anuncio activo
  const localityIds = [...new Set((jobsForCities.data ?? []).map((j) => j.locality_id as number))];
  const { data: localities } = localityIds.length
    ? await admin.from("localities").select("id, name").in("id", localityIds)
    : { data: [] as { id: number; name: string }[] };
  const cityName = new Map((localities ?? []).map((l) => [l.id, l.name]));

  const combos = new Set<string>();
  for (const j of jobsForCities.data ?? []) {
    const cat = (j.categories as unknown as { slug: string } | null)?.slug;
    const key = cat ? SLUG_TO_KEY[cat] : undefined;
    const name = cityName.get(j.locality_id as number);
    if (key && name) combos.add(`${slugify(name)}/${key}`);
  }

  const cityPages: MetadataRoute.Sitemap = [...combos].map((combo) => ({
    url: `${BASE}/trabajo/${combo}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...jobPages, ...salePages, ...rentPages, ...cityPages];
}