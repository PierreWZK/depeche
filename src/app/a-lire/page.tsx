import type { Metadata } from "next";
import { SavedPage } from "@/components/SavedPage";

// Page personnelle (contenu du navigateur) : pas d'indexation, pas dans le sitemap.
export const metadata: Metadata = {
  title: "À lire plus tard · Dépêche",
  robots: { index: false, follow: true },
};

export default function ALire() {
  return <SavedPage />;
}
