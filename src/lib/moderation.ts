import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type Review = { status: "active" | "pending_review"; reasons: string[] };

// Frases típicas de estafa, en polaco, español e inglés
const SCAM_PATTERNS: RegExp[] = [
  /zaliczk/i,
  /przedpłat/i,
  /przelew.{0,15}z góry/i,
  /bitcoin|kryptowalut|crypto/i,
  /gwarantowany (zarobek|dochód)/i,
  /western union|moneygram/i,
  /adelanto/i,
  /pago por adelantado/i,
  /ganancias garantizadas/i,
  /advance fee|guaranteed (income|profit)/i,
];

// Datos de contacto escritos en el texto: el contacto debe ir por el chat o el campo de WhatsApp
const CONTACT_PATTERNS: RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/,
  /(\+?48[\s-]?)?\b\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/,
  /https?:\/\/|\bwww\./i,
];

async function isTrusted(supabase: Supa, userId: string) {
  const counts = await Promise.all(
    ["job_posts", "sale_listings", "rental_listings"].map((table) =>
      supabase
        .from(table as "job_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId)
        .eq("status", "active")
    )
  );
  const total = counts.reduce((sum, r) => sum + (r.count ?? 0), 0);
  return total >= 2;
}

export async function reviewStatus(
  supabase: Supa,
  userId: string,
  text: string,
  opts: { needsPhotos: boolean; photoCount: number }
): Promise<Review> {
  const reasons: string[] = [];
  if (SCAM_PATTERNS.some((p) => p.test(text))) reasons.push("scam");
  if (CONTACT_PATTERNS.some((p) => p.test(text))) reasons.push("contact");
  if (opts.needsPhotos && opts.photoCount === 0) reasons.push("no_photos");
  if (!(await isTrusted(supabase, userId))) reasons.push("new_author");
  return { status: reasons.length === 0 ? "active" : "pending_review", reasons };
}