import type { MetadataRoute } from "next";

// NEXT_PUBLIC_SITE_URL sera defini au deploiement, une fois le nom de domaine
// choisi (section 10 du cahier des charges). Pas de domaine devine ici.
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

const routes = [
  "",
  "/qui-sommes-nous",
  "/equipe",
  "/cultes-et-programmes",
  "/departements",
  "/galerie",
  "/actualites",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!baseUrl) return [];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
