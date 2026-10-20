import { createAdminClient } from "@/lib/supabase/admin";
import type { Lang } from "@/lib/i18n";

type TextRow = {
  id: string;
  title: string;
  description: string;
  original_lang: string;
};

const DEEPL_TARGET: Record<Lang, string> = { pl: "PL", es: "ES", en: "EN-GB" };
const DEEPL_SOURCE: Record<Lang, string> = { pl: "PL", es: "ES", en: "EN" };

export async function localizeJob(row: TextRow, target: Lang) {
  const source = row.original_lang as Lang;
  if (source === target) {
    return { title: row.title, description: row.description, translated: false };
  }

  const admin = createAdminClient();

  const { data: cached } = await admin
    .from("job_translations")
    .select("title, description")
    .eq("job_id", row.id)
    .eq("lang", target)
    .maybeSingle();

  if (cached) {
    return { title: cached.title, description: cached.description, translated: true };
  }

  try {
    const title = await translateField(row.title, source, target);
    const description = await translateField(row.description, source, target);

    await admin
      .from("job_translations")
      .upsert({ job_id: row.id, lang: target, title, description }, { onConflict: "job_id,lang" });

    return { title, description, translated: true };
  } catch {
    // Si falla el servicio de traducción, se muestra el texto original
    return { title: row.title, description: row.description, translated: false };
  }
}

export async function localizeMany<T extends TextRow>(rows: T[], target: Lang) {
  return Promise.all(rows.map(async (row) => ({ ...row, ...(await localizeJob(row, target)) })));
}

// Traduce respetando los saltos de línea
async function translateField(text: string, source: Lang, target: Lang): Promise<string> {
  if (source === target || !text.trim()) return text;

  // Una sola llamada por campo; los saltos de línea se conservan marcándolos antes
  const marked = text.replace(/\n/g, " ⏎ ");
  const translated = await translateChunk(marked, source, target);
  return translated.replace(/\s*⏎\s*/g, "\n");
}

// Divide un texto en trozos de hasta `max` caracteres, cortando por frases o por palabras
function chunk(text: string, max: number): string[] {
  const pieces: string[] = [];
  let current = "";

  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= max) {
      current = candidate;
      continue;
    }
    if (current) pieces.push(current);

    // Frase demasiado larga: se parte por palabras
    let buffer = "";
    for (const word of sentence.split(/\s+/)) {
      const next = buffer ? `${buffer} ${word}` : word;
      if (next.length > max && buffer) {
        pieces.push(buffer);
        buffer = word;
      } else {
        buffer = next;
      }
    }
    current = buffer;
  }

  if (current) pieces.push(current);
  return pieces;
}

async function myMemory(text: string, source: Lang, target: Lang): Promise<string> {
  const params = new URLSearchParams({ q: text, langpair: `${source}|${target}` });
  if (process.env.MYMEMORY_EMAIL) params.set("de", process.env.MYMEMORY_EMAIL);

  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);
  if (!res.ok) throw new Error(`MyMemory respondió ${res.status}`);

  const data = (await res.json()) as {
    responseStatus: number;
    responseData: { translatedText: string };
  };

  if (data.responseStatus !== 200) throw new Error(`MyMemory: ${data.responseStatus}`);
  return data.responseData.translatedText;
}

async function deepl(text: string, source: Lang, target: Lang): Promise<string> {
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: DEEPL_SOURCE[source],
      target_lang: DEEPL_TARGET[target],
    }),
  });

  if (!res.ok) throw new Error(`DeepL respondió ${res.status}`);

  const data = (await res.json()) as { translations: { text: string }[] };
  return data.translations[0].text;
}

// Una llamada al servicio de traducción: DeepL si hay clave, o MyMemory gratuito
async function translateChunk(text: string, source: Lang, target: Lang): Promise<string> {
  const deeplKey = process.env.DEEPL_API_KEY;
  if (deeplKey) {
    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${deeplKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: [text], source_lang: DEEPL_SOURCE[source], target_lang: DEEPL_TARGET[target] }),
    });
    if (!res.ok) throw new Error(`DeepL respondió ${res.status}`);
    const data = (await res.json()) as { translations: { text: string }[] };
    return data.translations[0].text;
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=${source}|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory respondió ${res.status}`);
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  return data.responseData?.translatedText ?? text;
}