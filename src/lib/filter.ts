import { normalize } from "./text.ts";

export type ArticleFilter = {
  theme?: string;
  sourceId?: string;
  query?: string;
};

type Filterable = {
  title: string;
  excerpt: string;
  source: { id: string; theme: string };
};

// Tous les mots de la recherche doivent apparaître dans le titre ou l'extrait.
export function filterArticles<T extends Filterable>(articles: T[], { theme, sourceId, query }: ArticleFilter): T[] {
  const words = normalize(query ?? "").split(" ").filter(Boolean);

  return articles.filter((article) => {
    if (theme && article.source.theme !== theme) return false;
    if (sourceId && article.source.id !== sourceId) return false;
    const haystack = normalize(`${article.title} ${article.excerpt}`);
    return words.every((word) => haystack.includes(word));
  });
}
