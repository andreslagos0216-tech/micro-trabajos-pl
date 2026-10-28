// Logo de la empresa o agencia; si no hay, muestra la inicial sobre un círculo de color.
export function CompanyLogo({ url, name, size = 44 }: { url: string | null; name: string | null; size?: number }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={`Logo de ${name ?? "la empresa"}`} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span aria-hidden="true" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} className="flex shrink-0 items-center justify-center rounded-full bg-slate-700 font-semibold text-white">
      {initial}
    </span>
  );
}