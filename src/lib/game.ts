// Logique du jeu « Plus ou moins HN » : pure, sans réseau ni navigateur.

export const ROUNDS = 10;

// Même graine, même tirage : tous les visiteurs du jour voient les mêmes duels.
function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deux titres à égalité de points ne se départagent pas : on ne les oppose pas.
export function buildPairs<T extends { points: number }>(items: T[], seed: string): [T, T][] {
  const pool = seededShuffle(items, seed);
  const pairs: [T, T][] = [];
  while (pool.length >= 2 && pairs.length < ROUNDS) {
    const first = pool.shift() as T;
    const index = pool.findIndex((item) => item.points !== first.points);
    if (index < 0) break;
    const [second] = pool.splice(index, 1);
    pairs.push([first, second]);
  }
  return pairs;
}

// Jour au format YYYY-MM-DD, à l'heure de Paris.
export function parisDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(date);
}

export function previousDay(day: string): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}

// Série : jours joués d'affilée. Un jour manqué la remet à zéro.
export function nextStreak(lastDay: string | null, day: string, streak: number): number {
  if (lastDay === day) return streak;
  return lastDay === previousDay(day) ? streak + 1 : 1;
}

export function currentStreak(lastDay: string | null, day: string, streak: number): number {
  return lastDay === day || lastDay === previousDay(day) ? streak : 0;
}

export function shareText(day: string, score: number, streak: number): string {
  const flames = "🔥".repeat(Math.min(streak, 5));
  return `Dépêche · Plus ou moins HN du ${day} : ${score}/${ROUNDS}${streak > 1 ? ` · série ${streak} ${flames}` : ""}`;
}
