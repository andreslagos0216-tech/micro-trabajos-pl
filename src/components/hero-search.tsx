"use client";

import { useState } from "react";
import { LocalityPicker, type Locality } from "@/components/locality-picker";
import { ui } from "@/lib/ui";

export function HeroSearch({
  label,
  placeholder,
  noResults,
  button,
  radius,
}: {
  label: string;
  placeholder: string;
  noResults: string;
  button: string;
  radius: number;
}) {
  const [picked, setPicked] = useState<Locality | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (picked) window.location.assign(`/?lat=${picked.lat}&lng=${picked.lng}&r=${radius}#ofertas`);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <LocalityPicker label={label} placeholder={placeholder} noResults={noResults} onPick={setPicked} />
      </div>
      <button type="submit" disabled={!picked} className={`${ui.button} sm:mt-7`}>
        {button}
      </button>
    </form>
  );
}