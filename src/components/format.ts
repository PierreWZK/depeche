// Fuseau fixe : serveur et navigateur affichent la même date, sans erreur d'hydratation.
export function formatDate(iso: string | null): string {
  if (!iso) return "date inconnue";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

import { fallbackImage } from "../lib/images.ts";

// fallback : photo de repli choisie côté serveur (tour de rôle dans le fil). Absente sur les anciens articles gardés.
type Illustrated = { url: string; image: string | null; fallback?: string; source: { theme: string } };

function fallbackFor(story: Illustrated): string {
  return story.fallback ?? fallbackImage(story);
}

export function imageFor(story: Illustrated): string {
  return story.image ?? fallbackFor(story);
}

// Image du flux cassée (404, hotlink refusé) : on bascule une seule fois sur la photo de repli.
export function fallbackOnError(story: Illustrated) {
  return (event: { currentTarget: HTMLImageElement }) => {
    const img = event.currentTarget;
    const fallback = fallbackFor(story);
    if (!img.src.endsWith(fallback)) img.src = fallback;
  };
}

export const THEME_LABELS: Record<string, string> = {
  dev: "Dev",
  jeux: "Jeux",
  materiel: "Matériel",
};
