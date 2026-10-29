import type { Metadata } from "next";
import { Anton, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const display = Anton({
  variable: "--f-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Newsreader({
  variable: "--f-body",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--f-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const title = "Dépêche · L'actu dev et gaming, sans le bruit";
const description = "Un agrégateur d'actualités dev et jeu vidéo : flux RSS, doublons fusionnés, fil filtrable.";

export const metadata: Metadata = {
  metadataBase: new URL("https://depeche.projectp.fr"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Dépêche",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Dépêche, l'actu dev et gaming" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
