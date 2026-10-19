import type { Metadata } from "next";

const BASE = "https://taskgo.pl";

export function listingMetadata(opts: {
  title: string;
  description: string;
  city: string | null;
  price: string | null;
  path: string;
  image?: string | null;
}): Metadata {
  const parts = [opts.title];
  if (opts.price) parts.push(opts.price);
  if (opts.city) parts.push(opts.city);
  const title = parts.join(" · ");

  const description = (opts.description || opts.title).replace(/\s+/g, " ").trim().slice(0, 155);
  const url = `${BASE}${opts.path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TaskGo",
      locale: "pl_PL",
      type: "article",
      images: opts.image ? [{ url: opts.image }] : [{ url: `${BASE}/icons/icon-512.png` }],
    },
    twitter: {
      card: opts.image ? "summary_large_image" : "summary",
      title,
      description,
      images: opts.image ? [opts.image] : undefined,
    },
  };
}