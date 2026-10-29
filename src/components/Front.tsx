"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Story } from "@/lib/news";
import { filterArticles } from "@/lib/filter";
import { Hero } from "./Hero";
import { StickyBar } from "./StickyBar";
import { StoryCard } from "./StoryCard";
import { THEME_LABELS } from "./format";
import { useStoredSet } from "./use-stored-set";
import { useSavedStories } from "./use-saved-stories";
import { DailyGame } from "./DailyGame";
import type { DuelPair } from "@/lib/hn";

type Props = {
  stories: Story[];
  failed: string[];
  today: string;
  day: string;
  duels: DuelPair[] | null;
};

type View = "cartes" | "compact";

export function Front({ stories, failed, today, day, duels }: Props) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [view, setView] = useState<View>("cartes");
  const [read, markRead] = useStoredSet("depeche:lu");
  const { saved, isSaved, toggle: toggleSaved } = useSavedStories();

  // La barre du haut apparaît dès que la recherche du hero est passée au-dessus de l'écran.
  const searchRef = useRef<HTMLLabelElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const target = searchRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const sources = useMemo(() => {
    const seen = new Map<string, string>();
    stories.forEach((story) => seen.set(story.source.id, story.source.name));
    return [...seen.entries()];
  }, [stories]);

  const visible = useMemo(() => filterArticles(stories, { theme, sourceId, query }), [stories, theme, sourceId, query]);
  // La une est déjà dans le hero : sans filtre, la grille commence au deuxième article.
  const unfiltered = query === "" && theme === "" && sourceId === "";
  const grid = unfiltered ? visible.slice(1) : visible;
  const merged = stories.reduce((total, story) => total + story.alsoIn.length, 0);

  return (
    <>
      <StickyBar visible={stuck} savedCount={saved.length} query={query} onQuery={setQuery} />
      <Hero featured={stories[0]} query={query} onQuery={setQuery} today={today} savedCount={saved.length} searchRef={searchRef} />

      <section aria-label="Chiffres du jour" className="grid grid-cols-3 border-b border-ink font-mono text-center">
        <Stat value={stories.length} label="articles" />
        <Stat value={sources.length} label={`sources${failed.length ? ` (${failed.length} en panne)` : ""}`} />
        <Stat value={merged} label="doublons fusionnés" />
      </section>

      <section className="grid gap-px border-b border-ink bg-ink md:grid-cols-2">
        <div className="moving-border bg-paper p-6 md:p-8">
          <DailyGame day={day} pairs={duels} />
        </div>
        <div className="bg-paper p-6 md:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-mute">À lire plus tard · {saved.length}</h2>
            <Link href="/a-lire" className="font-mono text-xs uppercase tracking-wider underline hover:text-rust">
              Tout voir →
            </Link>
          </div>
          {saved.length === 0 ? (
            <p className="mt-4 font-body text-lg text-ink/60">Rien de gardé pour l’instant. Cliquez « Plus tard » sur un article.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {saved.slice(0, 4).map((story) => (
                <li key={story.url} className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-2">
                  <a href={story.url} target="_blank" rel="noopener noreferrer" className="font-body text-lg leading-snug hover:underline">
                    {story.title}
                  </a>
                  <button type="button" onClick={() => toggleSaved(story)} className="font-mono text-xs text-mute hover:text-rust">
                    retirer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="px-4 py-10 md:px-10">
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-ink pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wider">
            <Chip active={theme === ""} onClick={() => setTheme("")}>Tous</Chip>
            {Object.entries(THEME_LABELS).map(([value, label]) => (
              <Chip key={value} active={theme === value} onClick={() => setTheme(value)}>
                {label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
            <select
              aria-label="Filtrer par source"
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
              className="border border-ink bg-paper px-2 py-1"
            >
              <option value="">Toutes les sources</option>
              {sources.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <Chip active={view === "cartes"} onClick={() => setView("cartes")}>Cartes</Chip>
            <Chip active={view === "compact"} onClick={() => setView("compact")}>Compact</Chip>
          </div>
        </div>

        <p aria-live="polite" className="mb-6 font-mono text-xs text-mute">
          {visible.length} résultat{visible.length > 1 ? "s" : ""}
        </p>

        {visible.length === 0 ? (
          <p className="font-body text-2xl">Aucun article ne correspond. Essayez un autre mot ou retirez un filtre.</p>
        ) : view === "cartes" ? (
          <ul className="grid gap-3 md:grid-cols-3">
            {grid.map((story, index) => (
              <StoryCard
                key={story.url}
                story={story}
                large={index === 0 && unfiltered}
                read={read.has(story.url)}
                later={isSaved(story.url)}
                onRead={() => markRead(story.url)}
                onLater={() => toggleSaved(story)}
              />
            ))}
          </ul>
        ) : (
          <ul>
            {visible.map((story) => (
              <StoryCard
                key={story.url}
                story={story}
                compact
                read={read.has(story.url)}
                later={isSaved(story.url)}
                onRead={() => markRead(story.url)}
                onLater={() => toggleSaved(story)}
              />
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-ink px-4 py-6 font-mono text-xs uppercase tracking-wider text-mute md:px-10">
        Dépêche · jour 16 de{" "}
        <a href="https://projectp.fr/" className="underline hover:text-rust">
          30 jours, 30 projets
        </a>
      </footer>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="border-r border-ink py-6 last:border-r-0">
      <div className="font-display text-5xl leading-none md:text-7xl">{value}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-mute">{label}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border border-ink px-3 py-1.5 transition ${active ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
    >
      {children}
    </button>
  );
}
