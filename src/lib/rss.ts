export type FeedItem = {
  title: string;
  url: string;
  excerpt: string;
  image: string | null;
  date: string | null;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return point <= 0x10ffff ? String.fromCodePoint(point) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

// Texte brut uniquement : les balises sont retirées, jamais réinjectées dans la page.
// Les flux escapent souvent leur HTML (&lt;p&gt;) : on décode, on retire, puis on décode encore.
// Les balises de bloc deviennent un espace, les balises en ligne disparaissent (« extrait. » reste collé).
export function toText(raw: string): string {
  const decoded = decodeEntities(unwrapCdata(raw));
  const withoutBlocks = decoded.replace(/<\/?(p|div|br|li|h[1-6]|tr)\b[^>]*>/gi, " ");
  return decodeEntities(withoutBlocks.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapCdata(raw: string): string {
  return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function tagBody(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1] : null;
}

function tagAttr(block: string, tag: string, attr: string): string | null {
  const match = block.match(new RegExp(`<${tag}\\s[^>]*?\\b${attr}="([^"]+)"`, "i"));
  return match ? match[1] : null;
}

function httpUrl(candidate: string | null): string | null {
  if (!candidate) return null;
  try {
    const url = new URL(decodeEntities(candidate.trim()));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// Cherche dans tout l'article, pas seulement l'extrait : The Verge met l'image dans <content>, après <summary>.
function findImage(block: string): string | null {
  const html = decodeEntities(unwrapCdata(block));
  const candidates = [
    tagAttr(block, "media:content", "url"),
    tagAttr(block, "media:thumbnail", "url"),
    tagAttr(block, "enclosure", "url"),
    html.match(/<img\s[^>]*?\bsrc=["']([^"']+)["']/i)?.[1] ?? null,
  ];
  for (const candidate of candidates) {
    const url = httpUrl(candidate);
    if (url) return url;
  }
  return null;
}

function parseDate(block: string): string | null {
  const raw = tagBody(block, "pubDate") ?? tagBody(block, "published") ?? tagBody(block, "updated") ?? tagBody(block, "dc:date");
  if (!raw) return null;
  const time = Date.parse(toText(raw));
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function parseBlock(block: string): FeedItem | null {
  const title = toText(tagBody(block, "title") ?? "");
  const url = httpUrl(tagAttr(block, "link", "href") ?? toText(tagBody(block, "link") ?? ""));
  if (!title || !url) return null;

  const html = unwrapCdata(
    tagBody(block, "content:encoded") ?? tagBody(block, "description") ?? tagBody(block, "summary") ?? tagBody(block, "content") ?? "",
  );
  const excerpt = toText(html);

  return {
    title,
    url,
    excerpt: excerpt.length > 280 ? `${excerpt.slice(0, 280).trimEnd()}…` : excerpt,
    image: findImage(block),
    date: parseDate(block),
  };
}

// Accepte RSS 2.0 (<item>) et Atom (<entry>).
export function parseFeed(xml: string): FeedItem[] {
  const blocks = [...xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)].map((match) => match[0]);
  if (blocks.length === 0) throw new Error("aucun article dans le flux");
  return blocks.flatMap((block) => {
    const item = parseBlock(block);
    return item ? [item] : [];
  });
}
