"use client";

import { useEffect, useId, useState } from "react";
import { ui } from "@/lib/ui";

export type Locality = {
  id: number;
  name: string;
  voivodeship: string | null;
  lat: number;
  lng: number;
};

type PickerProps = {
  label: string;
  placeholder: string;
  noResults: string;
  name?: string;
  required?: boolean;
  onPick?: (loc: Locality) => void;
};

export function LocalityPicker({ label, placeholder, noResults, name, required, onPick }: PickerProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Locality[]>([]);
  const [selected, setSelected] = useState<Locality | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) return;
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/localities?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Locality[];
        setResults(data);
        setOpen(true);
      } catch {
        // Búsqueda cancelada o sin conexión
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected]);

  function pick(loc: Locality) {
    setSelected(loc);
    setQuery(loc.name);
    setOpen(false);
    onPick?.(loc);
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className={ui.label}>{label}</label>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        required={required}
        aria-autocomplete="list"
        aria-expanded={open}
        className={ui.input}
      />
      {name && <input type="hidden" name={name} value={selected?.id ?? ""} />}
      {loading && <p className={`mt-1 text-xs ${ui.muted}`}>…</p>}
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">{noResults}</li>
          ) : (
            results.map((loc) => (
              <li key={loc.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(loc)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">{loc.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{loc.voivodeship ?? ""}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// Buscador que, al elegir una localidad, muestra los anuncios en su radio
export function LocalityNav({
  basePath,
  label,
  placeholder,
  noResults,
  radius,
}: {
  basePath: string;
  label: string;
  placeholder: string;
  noResults: string;
  radius: number;
}) {
  return (
    <LocalityPicker
      label={label}
      placeholder={placeholder}
      noResults={noResults}
      onPick={(loc) => {
        const sep = basePath.includes("?") ? "&" : "?";
        window.location.assign(`${basePath}${sep}lat=${loc.lat}&lng=${loc.lng}&r=${radius}#ofertas`);
      }}
    />
  );
}