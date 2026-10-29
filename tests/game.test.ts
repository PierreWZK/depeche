import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPairs, currentStreak, nextStreak, parisDay, previousDay, seededShuffle, shareText, ROUNDS } from "../src/lib/game.ts";

const items = Array.from({ length: 30 }, (_, i) => ({ id: `s${i}`, points: 10 + i * 7 }));

test("le tirage est stable pour une même graine et change avec le jour", () => {
  assert.deepEqual(seededShuffle(items, "2026-10-29"), seededShuffle(items, "2026-10-29"));
  assert.notDeepEqual(
    seededShuffle(items, "2026-10-29").map((i) => i.id),
    seededShuffle(items, "2026-10-30").map((i) => i.id),
  );
});

test("buildPairs donne dix duels sans égalité de points", () => {
  const pairs = buildPairs(items, "2026-10-29");
  assert.equal(pairs.length, ROUNDS);
  for (const [a, b] of pairs) assert.notEqual(a.points, b.points);
});

test("buildPairs n'utilise pas deux fois la même histoire", () => {
  const ids = buildPairs(items, "2026-10-29").flat().map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("buildPairs ne tente rien avec des points tous égaux", () => {
  assert.deepEqual(buildPairs([{ points: 5 }, { points: 5 }, { points: 5 }], "x"), []);
});

test("previousDay passe au jour précédent, y compris à cheval sur un mois", () => {
  assert.equal(previousDay("2026-10-29"), "2026-10-28");
  assert.equal(previousDay("2026-11-01"), "2026-10-31");
});

test("parisDay donne le jour à Paris, pas en UTC", () => {
  // 23 h 30 UTC le 29 octobre = 0 h 30 à Paris le 30 octobre (heure d'hiver : UTC+1)
  assert.equal(parisDay(new Date("2026-10-29T23:30:00Z")), "2026-10-30");
});

test("la série continue le lendemain et repart de 1 après un jour manqué", () => {
  assert.equal(nextStreak("2026-10-28", "2026-10-29", 3), 4);
  assert.equal(nextStreak("2026-10-26", "2026-10-29", 3), 1);
  assert.equal(nextStreak("2026-10-29", "2026-10-29", 4), 4);
});

test("la série affichée tombe à 0 si la veille n'a pas été jouée", () => {
  assert.equal(currentStreak("2026-10-28", "2026-10-29", 3), 3);
  assert.equal(currentStreak("2026-10-26", "2026-10-29", 3), 0);
});

test("le texte de partage contient le score et la série", () => {
  assert.equal(shareText("2026-10-29", 7, 1), "Dépêche · Plus ou moins HN du 2026-10-29 : 7/10");
  assert.equal(shareText("2026-10-29", 7, 3), "Dépêche · Plus ou moins HN du 2026-10-29 : 7/10 · série 3 🔥🔥🔥");
});
