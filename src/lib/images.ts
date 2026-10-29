// Photos CC0 de repli, 10 par thème (crédits dans CREDITS.md).

const FALLBACK_THEMES = ["dev", "jeux", "materiel"];
const FALLBACK_COUNT = 10;

type Themed = { url: string; source: { theme: string } };

function fallbackPath(theme: string, index: number): string {
  const safeTheme = FALLBACK_THEMES.includes(theme) ? theme : "dev";
  return `/images/${safeTheme}-${String((index % FALLBACK_COUNT) + 1).padStart(2, "0")}.jpg`;
}

// Repli d'un article isolé (ex. gardé avant cette version) : l'URL choisit la photo, toujours la même.
export function fallbackImage(story: Themed): string {
  let hash = 0;
  for (let i = 0; i < story.url.length; i++) hash = (hash * 31 + story.url.charCodeAt(i)) >>> 0;
  return fallbackPath(story.source.theme, hash);
}

// Dans le fil : tour de rôle par thème, donc jamais deux fois la même photo sur 10 cartes sans image du même thème.
export function assignFallbacks<T extends Themed & { image: string | null }>(stories: T[]): (T & { fallback: string })[] {
  const counters = new Map<string, number>();
  return stories.map((story) => {
    const count = counters.get(story.source.theme) ?? 0;
    if (story.image) return { ...story, fallback: fallbackImage(story) };
    counters.set(story.source.theme, count + 1);
    return { ...story, fallback: fallbackPath(story.source.theme, count) };
  });
}
