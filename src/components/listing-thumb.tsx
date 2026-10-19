import { ui } from "@/lib/ui";

export function ListingThumb({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-20 w-20 shrink-0 rounded-md object-cover sm:h-24 sm:w-24"
    />
  );
}

export const cardClass = `${ui.card} flex gap-3`;