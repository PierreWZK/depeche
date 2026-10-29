"use client";

import { useEffect, useState } from "react";
import type { DuelPair } from "@/lib/hn";
import { ROUNDS, currentStreak, nextStreak, shareText } from "@/lib/game";

type Side = "a" | "b";
type DayState = { picks: Side[]; score?: number };
type Saved = { lastDay: string | null; streak: number; days: Record<string, DayState> };

const STORAGE_KEY = "depeche:jeu";
const EMPTY: Saved = { lastDay: null, streak: 0, days: {} };

function loadSaved(): Saved {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Saved) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveState(state: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sans stockage, la partie reste visible jusqu'au rechargement.
  }
}

// Le plus de points gagne ; à égalité, le tirage ne pose pas de duel (voir buildPairs).
function winnerOf(pair: DuelPair): Side {
  return pair[0].points > pair[1].points ? "a" : "b";
}

export function DailyGame({ day, pairs }: { day: string; pairs: DuelPair[] | null }) {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setSaved(loadSaved()), []);

  if (!pairs || pairs.length < ROUNDS) {
    return (
      <div className="flex flex-col gap-4">
        <GameHeader />
        <p className="font-body text-lg text-ink/75">Le jeu n'est pas disponible aujourd'hui. Les articles restent à lire.</p>
      </div>
    );
  }

  if (!saved) {
    return (
      <div className="flex flex-col gap-4">
        <GameHeader />
        <p className="font-body text-lg text-ink/60">Chargement…</p>
      </div>
    );
  }

  const dayState: DayState = saved.days[day] ?? { picks: [] };
  const picks = dayState.picks;
  const streak = currentStreak(saved.lastDay, day, saved.streak);

  function commit(next: Saved) {
    setSaved(next);
    saveState(next);
  }

  function pick(side: Side) {
    if (shown || picks.length >= ROUNDS) return;
    const nextPicks = [...picks, side];
    const finishing = nextPicks.length === ROUNDS;
    const score = finishing ? nextPicks.filter((choice, index) => choice === winnerOf(pairs![index])).length : undefined;
    commit({
      lastDay: finishing ? day : saved!.lastDay,
      streak: finishing ? nextStreak(saved!.lastDay, day, saved!.streak) : saved!.streak,
      days: { ...saved!.days, [day]: { picks: nextPicks, score } },
    });
    setShown(true);
  }

  if (picks.length === ROUNDS && !shown) {
    const score = dayState.score ?? 0;
    return (
      <div className="flex flex-col gap-6">
        <GameHeader />
        <p className="font-display text-7xl leading-none md:text-8xl">
          {score}/{ROUNDS}
        </p>
        <p className="font-body text-xl">
          {streak > 1 ? `Série de ${streak} jours ${"🔥".repeat(Math.min(streak, 5))}` : "Partie terminée. Revenez demain pour une nouvelle série."}
        </p>
        <button
          type="button"
          onClick={async () => {
            const text = shareText(day, score, streak);
            try {
              if (navigator.share) await navigator.share({ text });
              else await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              // Partage annulé ou refusé : rien à signaler.
            }
          }}
          className="w-fit border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper hover:bg-rust"
        >
          {copied ? "Résultat copié" : "Partager mon score"}
        </button>
      </div>
    );
  }

  const index = shown ? picks.length - 1 : picks.length;
  const pair = pairs[index];
  const chosen = picks[index];
  const winner = winnerOf(pair);

  return (
    <div className="flex flex-col gap-6">
      <GameHeader />
      <div className="flex items-center gap-2" aria-label={`Manche ${index + 1} sur ${ROUNDS}`}>
        {Array.from({ length: ROUNDS }, (_, i) => {
          const result = picks[i];
          const correct = result !== undefined && result === winnerOf(pairs[i]);
          return (
            <span
              key={i}
              className={`h-2 flex-1 border border-ink ${
                i === index ? "bg-rust border-rust" : result === undefined ? "" : correct ? "bg-ink" : "bg-paper-deep"
              }`}
            />
          );
        })}
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-mute">
        Manche {index + 1} / {ROUNDS} · quel titre a fait le plus de points ?
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {(["a", "b"] as const).map((side) => {
          const duel = side === "a" ? pair[0] : pair[1];
          const isWinner = winner === side;
          return (
            <div key={side} className="flex flex-col gap-3">
              <button
                type="button"
                disabled={shown}
                onClick={() => pick(side)}
                aria-pressed={chosen === side}
                className={`flex min-h-40 flex-col justify-between border border-ink p-5 text-left transition ${
                  shown
                    ? isWinner
                      ? "bg-ink text-paper"
                      : "opacity-50"
                    : "bg-paper hover:bg-ink hover:text-paper"
                }`}
              >
                <span className="font-mono text-xs uppercase tracking-widest opacity-70">Titre {side.toUpperCase()}</span>
                <span className="font-body text-2xl leading-snug">{duel.title}</span>
              </button>
              {shown && (
                <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
                  <span>
                    {duel.points} pts{chosen === side ? " · votre choix" : ""}
                  </span>
                  <a href={duel.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-rust">
                    Lire ↗
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {shown && (
        <button
          type="button"
          onClick={() => setShown(false)}
          className="w-fit border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-ink hover:text-paper"
        >
          {picks.length === ROUNDS ? "Voir le résultat" : "Manche suivante"}
        </button>
      )}
    </div>
  );
}

function GameHeader() {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-widest text-mute">Jeu du jour</span>
      <h2 className="font-display text-5xl leading-none md:text-6xl">PLUS OU MOINS HN</h2>
    </div>
  );
}
