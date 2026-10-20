import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://taskgo.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [jobs, sales, rents] = await Promise.all([
    admin.from("job_posts").select("id, bumped_at").eq("status", "active").limit(5000),
    admin.from("sale_listings").select("id, bumped_at").eq("status", "active").limit(5000),
    admin.from("rental_listings").select("id, bumped_at").eq("status", "active").limit(5000),
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

  const cityPages: MetadataRoute.Sitemap = [];
  const { data: cities } = await admin
    .from("localities")
    .select("name")
    .gte("population", 20000)
    .limit(200);
  const cats = ["limpieza", "nieve", "mudanzas", "cuidado", "masajes", "reparaciones", "ayuda"];
  for (const c of cities ?? []) {
    const citySlug = c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    for (const cat of cats) {
      cityPages.push({ url: `${BASE}/trabajo/${citySlug}/${cat}`, changeFrequency: "daily", priority: 0.7 });
    }
  }

  return [...staticPages, ...jobPages, ...salePages, ...rentPages, ...cityPages];
}