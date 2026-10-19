"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ui } from "@/lib/ui";

const MAX_PHOTOS = 8;

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

type Props = {
  listingTable: "sale_listings" | "rental_listings";
  listingId: string;
  authorId: string;
  current: number;
  lang: "pl" | "es" | "en";
};

const TEXT = {
  pl: { add: "Dodaj zdjęcia", uploading: "Wysyłanie...", limit: "Osiągnięto limit 8 zdjęć.", error: "Nie udało się wysłać zdjęcia.", hint: "Do 8 zdjęć, JPG, PNG lub WebP." },
  es: { add: "Añadir fotos", uploading: "Subiendo...", limit: "Has alcanzado el límite de 8 fotos.", error: "No se pudo subir la foto. Inténtalo de nuevo.", hint: "Hasta 8 fotos, JPG, PNG o WebP." },
  en: { add: "Add photos", uploading: "Uploading...", limit: "You have reached the limit of 8 photos.", error: "The photo could not be uploaded. Please try again.", hint: "Up to 8 photos, JPG, PNG or WebP." },
};

export function PhotoUploader({ listingTable, listingId, authorId, current, lang }: Props) {
  const t = TEXT[lang];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const left = MAX_PHOTOS - current;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, left);
    e.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setFailed(false);
    const supabase = createClient();

    try {
      for (const [i, file] of files.entries()) {
        const blob = await compress(file);
        const path = `${authorId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;

        const { error: rowError } = await supabase.from("listing_photos").insert({
          author_id: authorId,
          storage_path: path,
          position: current + i,
          sale_listing_id: listingTable === "sale_listings" ? listingId : null,
          rental_listing_id: listingTable === "rental_listings" ? listingId : null,
        });
        if (rowError) throw rowError;
      }
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (left <= 0) return <p className={ui.muted}>{t.limit}</p>;

  return (
    <div className="space-y-2">
      <label className={`${ui.buttonSecondary} inline-flex cursor-pointer ${busy ? "opacity-50" : ""}`}>
        {busy ? t.uploading : t.add}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={onChange}
          className="sr-only"
        />
      </label>
      <p className={`text-xs ${ui.muted}`}>{t.hint}</p>
      {failed && <p className={ui.errorBox}>{t.error}</p>}
    </div>
  );
}