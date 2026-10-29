import { test } from "node:test";
import assert from "node:assert/strict";
import { imageFor } from "../src/components/format.ts";
import { assignFallbacks, fallbackImage } from "../src/lib/images.ts";

const story = (url: string, theme: string, image: string | null = null) => ({ url, image, source: { theme } });

test("la photo de repli est stable pour un même article", () => {
  assert.equal(fallbackImage(story("https://a.fr/1", "jeux")), fallbackImage(story("https://a.fr/1", "jeux")));
});

test("la photo de repli suit le thème et reste dans les 10 de la rotation", () => {
  assert.match(fallbackImage(story("https://a.fr/1", "materiel")), /^\/images\/materiel-(0[1-9]|10)\.jpg$/);
  assert.match(fallbackImage(story("https://a.fr/1", "inconnu")), /^\/images\/dev-(0[1-9]|10)\.jpg$/);
});

test("dans le fil, 10 cartes sans image d'un même thème ont 10 photos différentes", () => {
  const stories = Array.from({ length: 10 }, (_, i) => story(`https://a.fr/${i}`, "dev"));
  const images = assignFallbacks(stories).map((item) => item.fallback);
  assert.equal(new Set(images).size, 10);
});

test("le tour de rôle compte par thème et saute les articles qui ont une image", () => {
  const result = assignFallbacks([
    story("https://a.fr/1", "dev"),
    story("https://a.fr/2", "jeux"),
    story("https://a.fr/3", "dev", "https://cdn.fr/x.jpg"),
    story("https://a.fr/4", "dev"),
  ]);
  assert.deepEqual(
    [result[0].fallback, result[1].fallback, result[3].fallback],
    ["/images/dev-01.jpg", "/images/jeux-01.jpg", "/images/dev-02.jpg"],
  );
});

test("l'image du flux passe avant la photo de repli, et le repli du serveur avant le hash", () => {
  assert.equal(imageFor(story("https://a.fr/1", "dev", "https://cdn.fr/x.jpg")), "https://cdn.fr/x.jpg");
  assert.equal(imageFor({ ...story("https://a.fr/1", "dev"), fallback: "/images/dev-07.jpg" }), "/images/dev-07.jpg");
});
