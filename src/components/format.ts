// Fuseau fixe : serveur et navigateur affichent la même date, sans erreur d'hydratation.
export function formatDate(iso: string | null): string {
  if (!iso) return "date inconnue";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

export const THEME_LABELS: Record<string, string> = {
  dev: "Dev",
  jeux: "Jeux",
  materiel: "Matériel",
};
