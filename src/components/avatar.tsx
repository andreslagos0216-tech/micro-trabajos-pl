export function Avatar({ name, size = 40 }: { name: string | null; size?: number }) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const color = ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-violet-600"][
    (name ?? "").length % 5
  ];

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`${color} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
    >
      {initials || "👤"}
    </span>
  );
}