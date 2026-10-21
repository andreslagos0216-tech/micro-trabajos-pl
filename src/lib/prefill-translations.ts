import { createAdminClient } from "@/lib/supabase/admin";
import type { Lang } from "@/lib/i18n";
import { translateField } from "@/lib/translate";

const LANGS: Lang[] = ["pl", "es", "en"];

type Kind = "job" | "sale" | "rent";

const TABLES: Record<Kind, { table: string; cache: string; idColumn: string }> = {
  job: { table: "job_posts", cache: "job_translations", idColumn: "job_id" },
  sale: { table: "sale_listings", cache: "sale_translations", idColumn: "sale_listing_id" },
  rent: { table: "rental_listings", cache: "rental_translations", idColumn: "rental_listing_id" },
};

// Traduce un anuncio a los otros idiomas y guarda el resultado en la caché.
// Se llama al publicar o editar, nunca al abrir la página.
export async function prefillTranslations(kind: Kind, id: string, originalLang: string, title: string, description: string) {
  const from = (["pl", "es", "en"].includes(originalLang) ? originalLang : "es") as Lang;
  const admin = createAdminClient();
  const cfg = TABLES[kind];

  for (const lang of LANGS) {
    if (lang === from) continue;
    try {
      const t = await translateField(title, from, lang);
      const d = await translateField(description, from, lang);
      await admin.from(cfg.cache).upsert(
        { [cfg.idColumn]: id, lang, title: t, description: d } as never,
        { onConflict: `${cfg.idColumn},lang` }
      );
    } catch {
      // Si el servicio falla, la página sigue mostrando el texto original
    }
  }
}