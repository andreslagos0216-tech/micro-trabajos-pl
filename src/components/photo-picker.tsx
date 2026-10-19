"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";

const MAX = 8;

const T: Record<Lang, { title: string; hint: string; add: string; uploading: string; remove: string; main: string; error: string; full: string }> = {
  pl: {
    title: "Zdjęcia produktu",
    hint: "Dodaj do 8 zdjęć. Wysyłają się od razu, a pierwsze będzie głównym.",
    add: "Dodaj zdjęcia",
    uploading: "Wysyłanie...",
    remove: "Usuń",
    main: "Główne",
    error: "Nie udało się wysłać zdjęcia. Spróbuj ponownie.",
    full: "Osiągnięto limit 8 zdjęć.",
  },
  es: {
    title: "Fotos del producto",
    hint: "Añade hasta 8 fotos. Se suben al momento y la primera será la principal.",
    add: "Añadir fotos",
    uploading: "Subiendo...",
    remove: "Quitar",
    main: "Principal",
    error: "No se pudo subir la foto. Inténtalo de nuevo.",
    full: "Has alcanzado el límite de 8 fotos.",
  },
  en: {
    title: "Product photos",
    hint: "Add up to 8 photos. They upload right away, and the first one is the main photo.",
    add: "Add photos",
    uploading: "Uploading...",
    remove: "Remove",
    main: "Main",
    error: "The photo could not be uploaded. Please try again.",
    full: "You have reached the limit of 8 photos.",
  },
};

type Item = { path: string; preview: string };

// Reduce la foto a 1280 px en su lado mayor, para que cargue rápido en el móvil
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", 0.8)
  );
}

export function PhotoPicker({ userId, lang }: { userId: string; lang: Lang }) {
  const t = T[lang];
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const room = MAX - items.length;
    if (room <= 0) {
      setError(t.full);
      return;
    }

    setBusy(true);
    setError(null);
    const supabase = createClient();
    const added: Item[] = [];

    try {
      for (const file of picked.slice(0, room)) {
        const blob = await compress(file);
        // La ruta empieza por el id del usuario: así lo exigen las políticas de Storage
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        added.push({ path, preview: URL.createObjectURL(blob) });
      }
    } catch {
      setError(t.error);
    }

    setItems((prev) => [...prev, ...added]);
    setBusy(false);
  }

  async function remove(item: Item) {
    const supabase = createClient();
    await supabase.storage.from("listing-photos").remove([item.path]);
    setItems((prev) => prev.filter((i) => i.path !== item.path));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
      <p className={`text-xs ${ui.muted}`}>{t.hint}</p>

      <label
        className={`${ui.buttonSecondary} inline-flex cursor-pointer ${
          busy || items.length >= MAX ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {busy ? t.uploading : t.add}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || items.length >= MAX}
          onChange={onFiles}
          className="sr-only"
        />
      </label>

      {items.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.path} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="" className="aspect-square w-full rounded-md object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-blue-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {t.main}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(item)}
                className="absolute bottom-1 right-1 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-900"
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.map((item) => (
        <input key={`in-${item.path}`} type="hidden" name="photo_path" value={item.path} />
      ))}

      {error && <p className={ui.errorBox}>{error}</p>}
    </div>
  );
}