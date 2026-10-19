"use client";

import { useMemo, useState } from "react";
import { normalizeText } from "@/lib/text";
import { ui } from "@/lib/ui";

export type PickerOption = { id: number; label: string; other?: boolean };

type Props = {
  label: string;
  placeholder: string;
  noResults: string;
  options: PickerOption[];
  customLabel: string;
  customPlaceholder: string;
  customHint: string;
};

export function CategoryPicker({
  label,
  placeholder,
  noResults,
  options,
  customLabel,
  customPlaceholder,
  customHint,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PickerOption | null>(null);
  const [open, setOpen] = useState(false);

  const q = normalizeText(query);

  const results = useMemo(() => {
    const regular = options.filter((o) => !o.other);
    const matches = q ? regular.filter((o) => normalizeText(o.label).includes(q)) : regular;
    const ordered = [...matches].sort((a, b) => {
      const aStart = q && normalizeText(a.label).startsWith(q) ? 0 : 1;
      const bStart = q && normalizeText(b.label).startsWith(q) ? 0 : 1;
      return aStart - bStart || a.label.localeCompare(b.label);
    });
    const other = options.find((o) => o.other);
    return other ? [...ordered, other] : ordered;
  }, [q, options]);

  function pick(option: PickerOption) {
    setSelected(option);
    setQuery(option.label);
    setOpen(false);
  }

  const isOther = selected?.other === true;

  return (
    <div className="relative">
      <label htmlFor="category_search" className={ui.label}>{label}</label>
      <input
        id="category_search"
        type="text"
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-autocomplete="list"
        aria-expanded={open}
        className={ui.input}
      />
      <input type="hidden" name="category_id" value={selected?.id ?? ""} />

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">{noResults}</li>
          ) : (
            results.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    o.other
                      ? "font-semibold text-blue-800 dark:text-blue-300"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {isOther && (
        <div className="mt-4">
          <label htmlFor="custom_category" className={ui.label}>{customLabel}</label>
          <input
            id="custom_category"
            name="custom_category"
            required
            maxLength={80}
            placeholder={customPlaceholder}
            className={ui.input}
          />
          <p className={`mt-1.5 text-xs ${ui.muted}`}>{customHint}</p>
        </div>
      )}
    </div>
  );
}