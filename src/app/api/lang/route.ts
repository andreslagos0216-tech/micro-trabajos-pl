import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const l = new URL(request.url).searchParams.get("l");
  const lang = l === "es" || l === "en" ? l : "pl";

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
