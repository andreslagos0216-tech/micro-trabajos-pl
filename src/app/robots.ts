import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/perfil", "/login", "/publicar", "/jobs/new", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://taskgo.pl/sitemap.xml",
    host: "https://taskgo.pl",
  };
}