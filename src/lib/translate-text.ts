// Traduce un texto corto (mensaje de chat) con el mismo servicio gratuito que usan los anuncios.
// Si falla o no hay traducción, devuelve el texto original.
export async function translateText(text: string, from: "pl" | "es" | "en", to: "pl" | "es" | "en"): Promise<string> {
  if (from === to || !text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=${from}|${to}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return text;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const out = data.responseData?.translatedText;
    return out && out.trim() ? out : text;
  } catch {
    return text;
  }
}