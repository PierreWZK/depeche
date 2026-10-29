# Dépêche · L'actu dev et gaming, sans le bruit

> Jour 16 du défi **30 jours, 30 projets** · Next.js · TypeScript · ⏳ **À venir**

Un agrégateur d'actualités dev et jeu vidéo : **Dépêche** rassemble des flux RSS et des API (Hacker News, DEV.to, sites gaming), supprime les doublons, classe par thème et propose un fil personnalisable.

📄 Les règles détaillées sont dans le [cahier des charges](CAHIER_DES_CHARGES.md).

## Au programme

- Récupération des sources côté serveur, mise en cache (revalidation toutes les 15 minutes).
- Fil unifié : titre, source, date, image, lien.
- Filtres par thème (dev, jeux, matériel) et par source.
- Dédoublonnage des articles qui parlent de la même chose (titre proche).
- Recherche dans les articles récupérés.

## Lancer en local

```bash
npm install
npm run dev                  # http://localhost:3000
```

## Mise en ligne

Prévue sur Coolify : **https://depeche.projectp.fr**.

## Stack

Next.js · TypeScript.

## Avant de déclarer le projet terminé

> Rappel pour Claude : à faire sur chaque projet, sans que je le redemande (détail dans les sections 9 et 10 du cahier des charges).

- **Indexation** : `robots.txt`, `sitemap.xml`, balise canonical, données structurées JSON-LD (`WebApplication` rattachée à ProjectP) et lien « 30 jours, 30 projets » vers https://projectp.fr/ dans le pied de page. Vérifier en ligne, puis me rappeler de soumettre `https://depeche.projectp.fr/sitemap.xml` dans Google Search Console.
- **Aperçu du lien** : image Open Graph stylisée 1200 × 630 aux couleurs du projet et balises `og:*` / `twitter:card`, vérifiées en ligne.
- **Vitrine** : la mise à jour de `30days30projects` (README et `projects.js`) se fait **après ma validation**.
