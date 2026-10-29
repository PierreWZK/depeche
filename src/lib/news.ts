import { cacheLife } from "next/cache";
import { sources, type Source } from "@/config/sources";
import { parseFeed, type FeedItem } from "@/lib/rss";
import { dedupe } from "@/lib/dedupe";
import { assignFallbacks } from "@/lib/images";

export const REVALIDATE_SECONDS = 15 * 60;

export type Article = FeedItem & {
  source: Pick<Source, "id" | "name" | "theme" | "lang">;
};

// Un même sujet vu par plusieurs sources : une carte, et les autres sources listées dans alsoIn.
// fallback : photo de repli du thème, si l'image du flux manque ou ne charge pas.
export type Story = Article & { alsoIn: string[]; fallback?: string };

async function fetchSource(source: Source): Promise<Article[]> {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "Depeche/1.0 (+https://depeche.projectp.fr)",
      Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const items = parseFeed(await response.text());
  const { id, name, theme, lang } = source;
  return items.map((item) => ({ ...item, source: { id, name, theme, lang } }));
}

// Une source en panne ne bloque pas les autres : on la signale et on continue.
export async function getArticles(): Promise<{ articles: Story[]; failed: string[] }> {
  "use cache";
  cacheLife({ revalidate: REVALIDATE_SECONDS });

  const results = await Promise.allSettled(sources.map(fetchSource));
  const articles: Article[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      failed.push(sources[index].name);
      console.warn(`[depeche] ${sources[index].name} : ${result.reason}`);
    }
  });

  articles.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return { articles: assignFallbacks(dedupe(articles)), failed };
}
