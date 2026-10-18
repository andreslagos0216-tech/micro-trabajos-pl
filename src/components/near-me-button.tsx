"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { geoText } from "@/lib/i18n-geo";
import { ui } from "@/lib/ui";

export function NearMeButton({ lang, radius }: { lang: Lang; radius: number }) {
  const t = geoText[lang];
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function locate() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Se redondea a unos 100 m para no guardar ni mostrar la posición exacta
        const lat = pos.coords.latitude.toFixed(3);
        const lng = pos.coords.longitude.toFixed(3);
        window.location.href = `/?lat=${lat}&lng=${lng}&r=${radius}#ofertas`;
      },
      () => setStatus("error"),
      { timeout: 10000, maximumAge: 300000 }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={locate} disabled={status === "loading"} className={ui.button}>
        {status === "loading" ? t.nearMeLoading : t.nearMe}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-700 dark:text-red-300">{t.nearMeDenied}</p>
      )}
    </div>
  );
}
