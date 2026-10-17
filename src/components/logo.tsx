import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="SC opcje, inicio"
      className="inline-flex rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="SC opcje" width={220} height={56} className="h-10 w-auto" />
    </Link>
  );
}
