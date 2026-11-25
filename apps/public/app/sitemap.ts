import type { MetadataRoute } from "next";

// NEXT_PUBLIC_SITE_URL sera défini au déploiement, une fois le nom de domaine
// choisi (section 10 du cahier des charges). Pas de domaine deviné ici.
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

const routes = [
  "",
  "/a-propos",
  "/equipe",
  "/cultes-et-programmes",
  "/departements",
  "/mon-eglise-a-un-besoin",
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
