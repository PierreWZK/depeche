"use client";

import type { Story } from "@/lib/news";
import { THEME_LABELS, formatDate } from "./format";

type Props = {
  story: Story;
  large?: boolean;
  compact?: boolean;
  read: boolean;
  later: boolean;
  onRead: () => void;
  onLater: () => void;
};

export function StoryCard({ story, large, compact, read, later, onRead, onLater }: Props) {
  const meta = [story.source.name, formatDate(story.date), THEME_LABELS[story.source.theme]].join(" · ");
  const also = story.alsoIn.length ? `+ ${story.alsoIn.join(", ")}` : null;

  if (compact) {
    return (
      <li className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink/15 py-3 ${read ? "opacity-50" : ""}`}>
        <a href={story.url} target="_blank" rel="noopener noreferrer" onClick={onRead} className="font-body text-lg leading-snug hover:underline">
          {story.title}
        </a>
        <span className="font-mono text-xs text-mute">{meta}</span>
        <Actions read={read} later={later} onRead={onRead} onLater={onLater} />
      </li>
    );
  }

  return (
    <li className={`group flex flex-col border border-ink bg-paper ${large ? "md:col-span-2 md:row-span-2" : ""} ${read ? "opacity-55" : ""}`}>
      {story.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- images externes des flux, déjà validées en http(s)
        <img
          src={story.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full object-cover grayscale transition duration-500 group-hover:grayscale-0 ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`}
        />
      ) : (
        <div className={`flex items-end bg-ink p-4 ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`}>
          <span className="font-display text-6xl leading-none text-paper/90">{story.source.name.slice(0, 2).toUpperCase()}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-mute">{meta}</p>
        <a href={story.url} target="_blank" rel="noopener noreferrer" onClick={onRead} className={`font-body leading-tight hover:underline ${large ? "text-3xl md:text-4xl" : "text-xl"}`}>
          {story.title}
        </a>
        {large && story.excerpt && <p className="font-body text-base text-ink/75">{story.excerpt}</p>}
        {also && <p className="font-mono text-[11px] text-mute">{also}</p>}
        <div className="mt-auto pt-2">
          <Actions read={read} later={later} onRead={onRead} onLater={onLater} />
        </div>
      </div>
    </li>
  );
}

function Actions({ read, later, onRead, onLater }: Pick<Props, "read" | "later" | "onRead" | "onLater">) {
  const button = "font-mono text-[11px] uppercase tracking-wider border border-ink px-2 py-1 transition hover:bg-ink hover:text-paper";
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onRead} aria-pressed={read} className={`${button} ${read ? "bg-ink text-paper" : ""}`}>
        {read ? "Lu ✓" : "Marquer lu"}
      </button>
      <button type="button" onClick={onLater} aria-pressed={later} className={`${button} ${later ? "bg-rust border-rust text-paper" : ""}`}>
        {later ? "Gardé" : "Plus tard"}
      </button>
    </div>
  );
}
