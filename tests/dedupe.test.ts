import { test } from "node:test";
import assert from "node:assert/strict";
import { dedupe } from "../src/lib/dedupe.ts";

const story = (title: string, source: string) => ({ title, excerpt: "", source: { name: source } });

test("fusionne deux titres qui parlent du même sujet", () => {
  const result = dedupe([
    story("OpenAI lance GPT-6 pour les développeurs", "Numerama"),
    story("OpenAI lance GPT-6 pour développeurs", "The Verge"),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].source.name, "Numerama");
  assert.deepEqual(result[0].alsoIn, ["The Verge"]);
});

test("ne fusionne pas des titres différents", () => {
  const result = dedupe([
    story("La PS6 sortira en 2028", "Gamekult"),
    story("Nouveau clavier mécanique testé", "Frandroid"),
  ]);
  assert.equal(result.length, 2);
});

test("ignore les accents et la casse", () => {
  const result = dedupe([
    story("Préparer la sortie d'Élysée rapidement", "Numerama"),
    story("preparer la sortie d'elysee RAPIDEMENT", "Frandroid"),
  ]);
  assert.equal(result.length, 1);
});

test("ne fusionne pas une même source avec elle-même", () => {
  const result = dedupe([
    story("Rust 2.0 est disponible maintenant", "DEV.to"),
    story("Rust 2.0 est disponible maintenant", "DEV.to"),
  ]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].alsoIn, []);
});

test("ne fusionne pas les titres trop courts", () => {
  const result = dedupe([story("Test vidéo", "Jeuxvideo.com"), story("Test vidéo", "Gamekult")]);
  assert.equal(result.length, 2);
});
