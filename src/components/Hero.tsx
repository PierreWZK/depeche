"use client";

import Link from "next/link";
import type { MouseEvent, RefObject } from "react";
import type { Story } from "@/lib/news";
import { fallbackOnError, formatDate, imageFor } from "./format";

type Props = {
  featured: Story | undefined;
  query: string;
  onQuery: (value: string) => void;
  today: string;
  savedCount: number;
  searchRef: RefObject<HTMLLabelElement | null>;
};

const TAGLINE = "L'actu dev et gaming, sans le bruit.";

// Spotlight (inspiré d'Aceternity UI) : une lumière suit le curseur.
function moveSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--sx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--sy", `${event.clientY - rect.top}px`);
}

export function Hero({ featured, query, onQuery, today, savedCount, searchRef }: Props) {
  return (
    <header
      onMouseMove={moveSpotlight}
      className="relative overflow-hidden bg-ink text-paper"
      style={{
        backgroundImage: "radial-gradient(600px circle at var(--sx, 50%) var(--sy, 30%), rgba(242,236,223,0.14), transparent 60%)",
      }}
    >
      <div className="flex items-center justify-between border-b border-paper/20 px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper/70">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-rust" aria-hidden />
          Édition du jour
        </span>
        <span className="flex items-center gap-4">
          <span className="hidden sm:inline">{today}</span>
          <Link href="/a-lire" className="border border-paper/40 px-2 py-1 text-paper hover:bg-paper hover:text-ink">
            À lire · {savedCount}
          </Link>
        </span>
      </div>

      <div className="px-4 pb-10 pt-16 md:px-10 md:pt-24">
        <h1 aria-label="Dépêche" className="font-display text-[29vw] leading-[0.95] tracking-tight md:text-[31vw]">
          DÉPÊCHE
        </h1>
        <p className="mt-6 font-body text-2xl italic md:text-3xl">
          {TAGLINE.split(" ").map((word, index) => (
            <span key={index} className="word-in mr-[0.25em]" style={{ ["--i" as string]: index }}>
              {word}
            </span>
          ))}
        </p>

        <label ref={searchRef} className="mt-8 flex max-w-xl items-center gap-3 border-b-2 border-paper pb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-paper/70">Chercher</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="ex. rust, switch 2, prix…"
            className="w-full bg-transparent font-body text-xl placeholder:text-paper/40 focus:outline-none"
          />
        </label>
      </div>

      {featured && (
        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid border-t border-paper/20 md:grid-cols-[1.2fr_1fr]"
        >
          {/* Hauteur bornée : l'image ne dicte plus la taille du bloc, quelle que soit sa taille d'origine. */}
          <div className="relative aspect-[16/10] overflow-hidden bg-paper/5 md:aspect-auto md:h-[min(26rem,40vw)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- image externe d'un flux, URL validée */}
            <img
              src={imageFor(featured)}
              alt=""
              referrerPolicy="no-referrer"
              onError={fallbackOnError(featured)}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
            />
          </div>
          <div className="flex flex-col justify-end gap-4 p-4 md:p-8">
            <span className="inline-flex w-fit items-center gap-2 bg-rust px-2 py-1 font-mono text-xs uppercase tracking-widest">
              À la une
            </span>
            <h2 className="font-body text-3xl leading-tight group-hover:underline md:text-4xl">{featured.title}</h2>
            {featured.excerpt && <p className="line-clamp-3 font-body text-lg text-paper/70">{featured.excerpt}</p>}
            <p className="font-mono text-xs uppercase tracking-wider text-paper/60">
              {featured.source.name} · {formatDate(featured.date)}
            </p>
          </div>
        </a>
      )}
    </header>
  );
}
