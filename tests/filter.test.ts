import { test } from "node:test";
import assert from "node:assert/strict";
import { filterArticles } from "../src/lib/filter.ts";

const articles = [
  { title: "Test de la RTX 6090", excerpt: "Carte graphique puissante", source: { id: "tom", theme: "materiel" } },
  { title: "Sortie de Hollow Knight 2", excerpt: "Le jeu arrive en mars", source: { id: "gk", theme: "jeux" } },
  { title: "Rust 2.0 disponible", excerpt: "Le langage évolue", source: { id: "devto", theme: "dev" } },
];

const titles = (items: { title: string }[]) => items.map((item) => item.title);

test("sans filtre, tout passe", () => {
  assert.equal(filterArticles(articles, {}).length, 3);
});

test("filtre par thème", () => {
  assert.deepEqual(titles(filterArticles(articles, { theme: "jeux" })), ["Sortie de Hollow Knight 2"]);
});

test("filtre par source", () => {
  assert.deepEqual(titles(filterArticles(articles, { sourceId: "devto" })), ["Rust 2.0 disponible"]);
});

test("recherche : tous les mots doivent apparaître, sans tenir compte des accents", () => {
  assert.deepEqual(titles(filterArticles(articles, { query: "CARTE  graphique" })), ["Test de la RTX 6090"]);
  assert.deepEqual(titles(filterArticles(articles, { query: "evolue langage" })), ["Rust 2.0 disponible"]);
  assert.deepEqual(filterArticles(articles, { query: "rust hollow" }), []);
});

test("thème et recherche se combinent", () => {
  assert.deepEqual(filterArticles(articles, { theme: "dev", query: "jeu" }), []);
});
