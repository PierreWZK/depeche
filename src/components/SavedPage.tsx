"use client";

import Link from "next/link";
import { StickyBar } from "./StickyBar";
import { StoryCard } from "./StoryCard";
import { useSavedStories } from "./use-saved-stories";
import { useStoredSet } from "./use-stored-set";

export function SavedPage() {
  const { saved, isSaved, toggle } = useSavedStories();
  const [read, markRead] = useStoredSet("depeche:lu");

  return (
    <>
      <StickyBar visible savedCount={saved.length} />

      <main className="px-4 pb-16 pt-24 md:px-10 md:pt-28">
        <p className="font-mono text-xs uppercase tracking-widest text-mute">Votre sélection · gardée dans ce navigateur</p>
        <h1 className="mt-2 font-display text-[15vw] leading-[0.95] md:text-[9vw]">À LIRE PLUS TARD</h1>
        <p aria-live="polite" className="mt-4 border-b-2 border-ink pb-4 font-mono text-xs text-mute">
          {saved.length} article{saved.length > 1 ? "s" : ""} gardé{saved.length > 1 ? "s" : ""}
        </p>

        {saved.length === 0 ? (
          <div className="mt-10 flex flex-col gap-6">
            <p className="font-body text-2xl">Rien de gardé pour l&apos;instant. Cliquez « Plus tard » sur un article du fil.</p>
            <Link
              href="/"
              className="w-fit border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper hover:bg-rust"
            >
              ← Retour au fil
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {saved.map((story) => (
              <StoryCard
                key={story.url}
                story={story}
                read={read.has(story.url)}
                later={isSaved(story.url)}
                onRead={() => markRead(story.url)}
                onLater={() => toggle(story)}
              />
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-ink px-4 py-6 font-mono text-xs uppercase tracking-wider text-mute md:px-10">
        Dépêche · jour 16 de{" "}
        <a href="https://projectp.fr/" className="underline hover:text-rust">
          30 jours, 30 projets
        </a>
      </footer>
    </>
  );
}
