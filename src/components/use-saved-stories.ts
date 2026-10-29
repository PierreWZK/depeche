"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Story } from "@/lib/news";

// Les articles gardés sont copiés en entier : ils restent lisibles même quand ils sortent du fil.
const STORAGE_KEY = "depeche:a-lire";

// Le stockage du navigateur peut être modifié à la main : on ne garde que des articles bien formés.
function isStory(value: unknown): value is Story {
  const story = value as Story;
  return (
    typeof story?.title === "string" &&
    typeof story?.url === "string" &&
    /^https?:\/\//.test(story.url) &&
    typeof story?.source?.name === "string" &&
    Array.isArray(story?.alsoIn)
  );
}

export function useSavedStories() {
  const [saved, setSaved] = useState<Story[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture du navigateur après l'hydratation, voulue
      if (raw) setSaved((JSON.parse(raw) as unknown[]).filter(isStory));
    } catch {
      // Stockage indisponible ou illisible : liste vide.
    }
  }, []);

  const toggle = useCallback((story: Story) => {
    setSaved((current) => {
      const next = current.some((item) => item.url === story.url)
        ? current.filter((item) => item.url !== story.url)
        : [story, ...current];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Sans stockage, la liste vaut pour la session.
      }
      return next;
    });
  }, []);

  const urls = useMemo(() => new Set(saved.map((story) => story.url)), [saved]);
  const isSaved = useCallback((url: string) => urls.has(url), [urls]);

  return { saved, isSaved, toggle };
}
