"use client";

import Link from "next/link";

type Props = {
  visible: boolean;
  savedCount: number;
  query?: string;
  onQuery?: (value: string) => void;
};

function scrollToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

// Barre du haut : apparaît quand la recherche du hero sort de l'écran (accueil), toujours visible ailleurs.
export function StickyBar({ visible, savedCount, query, onQuery }: Props) {
  const home = onQuery !== undefined;

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-50 border-b border-paper/20 bg-ink/95 text-paper backdrop-blur transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2 md:gap-6 md:px-10">
        {home ? (
          <button type="button" onClick={scrollToTop} className="font-display text-2xl leading-none tracking-tight hover:text-rust">
            DÉPÊCHE
          </button>
        ) : (
          <Link href="/" className="font-display text-2xl leading-none tracking-tight hover:text-rust">
            DÉPÊCHE
          </Link>
        )}

        {home ? (
          <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-paper/60 py-1">
            <span className="hidden font-mono text-[11px] uppercase tracking-widest text-paper/60 md:inline">Chercher</span>
            <input
              type="search"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              aria-label="Chercher dans les articles"
              placeholder="rust, switch 2, prix…"
              className="w-full min-w-0 bg-transparent font-body text-lg placeholder:text-paper/40 focus:outline-none"
            />
          </label>
        ) : (
          <span className="flex-1" />
        )}

        <Link
          href="/a-lire"
          className="whitespace-nowrap border border-paper/40 px-2 py-1 font-mono text-[11px] uppercase tracking-wider hover:bg-paper hover:text-ink"
        >
          À lire · {savedCount}
        </Link>
        {home && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Remonter en haut de la page"
            className="border border-paper/40 px-2 py-1 font-mono text-xs hover:bg-paper hover:text-ink"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}
