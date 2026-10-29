import { cacheLife } from "next/cache";
import { getArticles, REVALIDATE_SECONDS } from "@/lib/news";
import { getDuels } from "@/lib/hn";
import { parisDay } from "@/lib/game";
import { Front } from "@/components/Front";

// Le jour et sa date suivent le cache des articles : ils se mettent à jour au même rythme (15 min).
async function getEdition() {
  "use cache";
  cacheLife({ revalidate: REVALIDATE_SECONDS });
  const now = new Date();
  return {
    day: parisDay(now),
    today: now.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Paris",
    }),
  };
}

export default async function Home() {
  const edition = await getEdition();
  const [{ articles, failed }, duels] = await Promise.all([
    getArticles(),
    getDuels(edition.day).catch(() => null),
  ]);

  // Données structurées fixes (pas de saisie utilisateur) : sérialisées sans risque.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dépêche",
    url: "https://depeche.projectp.fr/",
    description: "Agrégateur d'actualités dev et jeu vidéo, avec doublons fusionnés et un jeu du jour.",
    applicationCategory: "NewsApplication",
    operatingSystem: "Any",
    inLanguage: "fr",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    isPartOf: { "@type": "WebSite", name: "30 jours, 30 projets", url: "https://projectp.fr/" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Front
        stories={articles}
        failed={failed}
        today={edition.today}
        day={edition.day}
        duels={duels}
      />
    </>
  );
}
