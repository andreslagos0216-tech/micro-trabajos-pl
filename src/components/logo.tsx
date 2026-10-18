import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="TaskGo, inicio"
      className="inline-flex rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="TaskGo" width={230} height={56} className="h-10 w-auto" />
    </Link>
  );
}