import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed, toText } from "../src/lib/rss.ts";

test("toText retire les balises et décode les entités", () => {
  assert.equal(toText("<p>Tom &amp; Jerry &#233; &#x41;</p>"), "Tom & Jerry é A");
});

test("toText retire le HTML échappé dans le flux", () => {
  assert.equal(toText("&lt;p&gt;Bonjour &amp;amp; ciao&lt;/p&gt;"), "Bonjour & ciao");
});

test("toText garde le texte d'un CDATA sans l'interpréter", () => {
  assert.equal(toText("<![CDATA[<b>Gras</b> et <script>x</script>]]>"), "Gras et x");
});

test("parseFeed lit un flux RSS 2.0", () => {
  const xml = `<rss><channel>
    <item>
      <title><![CDATA[Un titre &amp; plus]]></title>
      <link>https://example.com/a</link>
      <description><![CDATA[<p>Un <b>extrait</b>.</p><img src="https://example.com/a.jpg">]]></description>
      <pubDate>Wed, 28 Oct 2026 10:00:00 GMT</pubDate>
    </item>
  </channel></rss>`;

  const [item] = parseFeed(xml);
  assert.equal(item.title, "Un titre & plus");
  assert.equal(item.url, "https://example.com/a");
  assert.equal(item.excerpt, "Un extrait.");
  assert.equal(item.image, "https://example.com/a.jpg");
  assert.equal(item.date, "2026-10-28T10:00:00.000Z");
});

test("parseFeed lit un flux Atom avec lien href et média", () => {
  const xml = `<feed>
    <entry>
      <title>Atom</title>
      <link rel="alternate" href="https://example.com/atom"/>
      <summary>Résumé</summary>
      <media:thumbnail url="https://example.com/t.jpg"/>
      <updated>2026-10-27T08:00:00Z</updated>
    </entry>
  </feed>`;

  const [item] = parseFeed(xml);
  assert.equal(item.url, "https://example.com/atom");
  assert.equal(item.image, "https://example.com/t.jpg");
  assert.equal(item.date, "2026-10-27T08:00:00.000Z");
});

test("parseFeed trouve l'image dans <content> quand <summary> n'en a pas (The Verge)", () => {
  const xml = `<feed><entry>
    <title>Verge</title>
    <link rel="alternate" href="https://example.com/verge"/>
    <summary type="html">Court résumé</summary>
    <content type="html">&lt;figure&gt;&lt;img alt="x" src="https://example.com/v.jpg?w=1200&amp;q=80" /&gt;&lt;/figure&gt;</content>
  </entry></feed>`;

  const [item] = parseFeed(xml);
  assert.equal(item.excerpt, "Court résumé");
  assert.equal(item.image, "https://example.com/v.jpg?w=1200&q=80");
});

test("parseFeed écarte les liens non http et les articles sans titre", () => {
  const xml = `<rss>
    <item><title>Dangereux</title><link>javascript:alert(1)</link></item>
    <item><link>https://example.com/sans-titre</link></item>
    <item><title>OK</title><link>https://example.com/ok</link></item>
  </rss>`;

  const items = parseFeed(xml);
  assert.deepEqual(items.map((item) => item.title), ["OK"]);
  assert.equal(items[0].image, null);
  assert.equal(items[0].date, null);
});

test("parseFeed échoue sur un flux sans article", () => {
  assert.throws(() => parseFeed("<html>page d'erreur</html>"), /aucun article/);
});
