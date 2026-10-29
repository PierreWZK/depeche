import { normalize } from "./text.ts";

// Mots vides fr/en : ils font croire à des titres proches alors qu'ils ne disent rien.
const STOPWORDS = new Set([
  "le", "la", "les", "de", "du", "des", "un", "une", "et", "en", "a", "au", "aux", "pour", "sur", "dans",
  "the", "an", "and", "of", "to", "in", "on", "for", "is", "by", "with", "at", "from",
]);

// En dessous de 3 mots utiles, deux titres se ressemblent trop facilement : on ne fusionne pas.
const MIN_TOKENS = 3;
const SIMILARITY_THRESHOLD = 0.5;

export function titleTokens(title: string): Set<string> {
  const words = normalize(title)
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !STOPWORDS.has(word));
  return new Set(words);
}

// Indice de Jaccard : mots communs sur mots distincts.
function similarity(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const word of a) if (b.has(word)) shared++;
  return shared / (a.size + b.size - shared);
}

// Garde le premier de chaque groupe (l'ordre d'entrée décide) et note les autres sources.
export function dedupe<T extends { title: string; source: { name: string } }>(
  items: T[],
): (T & { alsoIn: string[] })[] {
  const kept: { item: T & { alsoIn: string[] }; tokens: Set<string> }[] = [];

  for (const item of items) {
    const tokens = titleTokens(item.title);
    const match =
      tokens.size >= MIN_TOKENS ? kept.find((entry) => similarity(entry.tokens, tokens) >= SIMILARITY_THRESHOLD) : undefined;

    if (!match) {
      kept.push({ item: { ...item, alsoIn: [] }, tokens });
    } else if (item.source.name !== match.item.source.name && !match.item.alsoIn.includes(item.source.name)) {
      match.item.alsoIn.push(item.source.name);
    }
  }

  return kept.map((entry) => entry.item);
}
