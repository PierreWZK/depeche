import { cacheLife } from "next/cache";
import { buildPairs, previousDay } from "./game.ts";

export type Duel = {
  id: string;
  title: string;
  points: number;
  link: string;
};

export type DuelPair = [Duel, Duel];

type AlgoliaHit = {
  objectID: string;
  title: string | null;
  points: number | null;
  url: string | null;
};

// Titres de la veille (UTC) via l'API Algolia de Hacker News. Une erreur n'est pas mise en cache :
// elle remonte, et la page affiche le jeu indisponible sans casser le reste.
export async function getDuels(day: string): Promise<DuelPair[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86_400, expire: 172_800 });

  const start = Date.parse(`${previousDay(day)}T00:00:00Z`) / 1000;
  const params = new URLSearchParams({
    tags: "story",
    numericFilters: `created_at_i>=${start},created_at_i<${start + 86_400},points>=10`,
    hitsPerPage: "200",
  });

  const response = await fetch(`https://hn.algolia.com/api/v1/search_by_date?${params}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`HN HTTP ${response.status}`);

  const { hits } = (await response.json()) as { hits: AlgoliaHit[] };
  const stories: Duel[] = hits.flatMap((hit) =>
    hit.title && typeof hit.points === "number"
      ? [
          {
            id: hit.objectID,
            title: hit.title,
            points: hit.points,
            link: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
          },
        ]
      : [],
  );

  return buildPairs(stories, day);
}
