import type { MetadataRoute } from "next";

// Seule page publique : l'accueil. Les pages privées, s'il y en a, ne doivent pas y figurer.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://depeche.projectp.fr/", changeFrequency: "hourly", priority: 1 }];
}
