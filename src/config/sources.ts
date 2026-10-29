export type Theme = "dev" | "jeux" | "materiel";

export type Source = {
  id: string;
  name: string;
  url: string;
  theme: Theme;
  lang: "fr" | "en";
};

// Pour ajouter une source : une entrée de plus, et c'est tout.
export const sources: Source[] = [
  { id: "hn", name: "Hacker News", url: "https://hnrss.org/frontpage", theme: "dev", lang: "en" },
  { id: "devto", name: "DEV.to", url: "https://dev.to/feed", theme: "dev", lang: "en" },
  { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", theme: "materiel", lang: "en" },
  { id: "ars", name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", theme: "materiel", lang: "en" },
  { id: "numerama", name: "Numerama", url: "https://www.numerama.com/feed/", theme: "materiel", lang: "fr" },
  { id: "frandroid", name: "Frandroid", url: "https://www.frandroid.com/feed", theme: "materiel", lang: "fr" },
  { id: "lesnumeriques", name: "Les Numériques", url: "https://www.lesnumeriques.com/rss.xml", theme: "materiel", lang: "fr" },
  { id: "gamekult", name: "Gamekult", url: "https://www.gamekult.com/feed.xml", theme: "jeux", lang: "fr" },
  { id: "jv", name: "Jeuxvideo.com", url: "https://www.jeuxvideo.com/rss/rss.xml", theme: "jeux", lang: "fr" },
];
