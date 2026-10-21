import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const LANGS = ["pl", "es", "en"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(text, from, to) {
  if (!text || !text.trim() || from === to) return text;
  const out = [];
  let chunk = "";
  for (const line of text.split("\n")) {
    if ((chunk + "\n" + line).length > 400) { out.push(chunk); chunk = line; }
    else chunk = chunk ? chunk + "\n" + line : line;
  }
  if (chunk) out.push(chunk);
  const parts = [];
  for (const part of out) {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(part)}&langpair=${from}|${to}`);
    const data = await res.json();
    parts.push(data.responseData?.translatedText ?? part);
    await sleep(300);
  }
  return parts.join("\n");
}

async function getRows(table, select) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?select=${select}&status=eq.active`, { headers: H });
  return res.json();
}

async function saveTranslation(table, idColumn, id, lang, title, description) {
  await fetch(`${URL_BASE}/rest/v1/${table}?on_conflict=${idColumn},lang`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([{ [idColumn]: id, lang, title, description }]),
  });
}

const sets = [
  { table: "job_posts", cache: "job_translations", idColumn: "job_id" },
  { table: "sale_listings", cache: "sale_translations", idColumn: "sale_listing_id" },
  { table: "rental_listings", cache: "rental_translations", idColumn: "rental_listing_id" },
];

for (const set of sets) {
  const rows = await getRows(set.table, "id,title,description,original_lang");
  console.log(`${set.table}: ${rows.length} anuncios activos`);
  for (const row of rows) {
    const from = ["pl", "es", "en"].includes(row.original_lang) ? row.original_lang : "es";
    for (const lang of LANGS) {
      if (lang === from) continue;
      const title = await translate(row.title, from, lang);
      const description = await translate(row.description, from, lang);
      await saveTranslation(set.cache, set.idColumn, row.id, lang, title, description);
    }
    console.log(`  OK ${row.id.slice(0, 8)} (${from})`);
  }
}
console.log("Terminado.");