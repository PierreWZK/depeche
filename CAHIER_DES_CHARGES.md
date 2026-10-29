# Jour 16/30 — Dépêche, l'actu dev et gaming, sans le bruit

> Stack : **Next.js**, **TypeScript** · hébergement **Coolify**, sous-domaine `depeche.projectp.fr`.
> Durée visée : **2 h 45** pour le MVP, les bonus ensuite.

Ce document est notre contrat : on le suit étape par étape, et toute décision qui s'en écarte est d'abord notée ici. Il s'ajuste au début de la journée.

## 1. L'idée

Un agrégateur d'actualités dev et jeu vidéo : **Dépêche** rassemble des flux RSS et des API (Hacker News, DEV.to, sites gaming), supprime les doublons, classe par thème et propose un fil personnalisable.

## 2. MVP — ce qui doit fonctionner à la fin

1. Récupération des sources côté serveur, mise en cache (revalidation toutes les 15 minutes).
2. Fil unifié : titre, source, date, image, lien.
3. Filtres par thème (dev, jeux, matériel) et par source.
4. Dédoublonnage des articles qui parlent de la même chose (titre proche).
5. Recherche dans les articles récupérés.
6. En ligne sur Coolify, avec un README à jour et un aperçu de lien (Open Graph).

### Périmètre volontairement limité

- Pas de compte : les préférences restent dans le navigateur.
- On n'affiche que le titre et un extrait, avec le lien vers la source.

## 3. Cahier des charges fonctionnel

### Lecture

- Marquer comme lu, mettre de côté pour plus tard.
- Mode compact ou cartes.

### Sources

- Liste des sources dans un fichier de configuration, facile à compléter.

## 4. Cahier des charges technique

- App Router, Server Components et `fetch` avec revalidation.
- Analyse RSS côté serveur, contenu nettoyé avant affichage.
- Déploiement Coolify (Nixpacks, `next start`).
- Mise en ligne sur Coolify à chaque push sur la branche principale.

## 5. Critères de réussite

- [ ] La page s'affiche en moins d'une seconde grâce au cache.
- [ ] Une source en panne n'empêche pas les autres de s'afficher.
- [ ] Aucun HTML venant d'un flux n'est injecté tel quel.

## 6. Bonus facultatifs

- Résumé du jour par e-mail.
- Mode hors ligne.
- Tendances (mots qui montent).

## 7. Définition du « terminé »

Le MVP fonctionne, les critères de la section 5 sont cochés, le site est en ligne sur `depeche.projectp.fr`, le README a son lien et sa capture, et la carte du projet passe à « terminé » sur la vitrine.

## 8. À me demander avant de coder

À poser **avant d'écrire le code**, et attendre ma réponse :

1. **Le jeu quotidien.** Chaque projet a un jeu du jour pour faire revenir les visiteurs : le même tirage pour tout le monde (d'après la date), une tentative par jour, une série 🔥 et un résultat à partager. Me proposer deux ou trois idées adaptées au projet, puis attendre mon choix.
2. **Le look.** Me demander une référence visuelle sur laquelle se baser (un site, une marque, une ambiance, une capture). Le site doit être original et agréable à regarder, **pas « basique »** : une vraie identité (typographie, palette, mise en page, détails, animations), pas un gabarit générique. Si je n'ai pas d'idée, me proposer deux directions et attendre mon choix.

### Réponses (29/10/2026)

- **Jeu du jour : « Plus ou moins HN ».** 10 duels de titres Hacker News de la veille : lequel a eu le plus de points ? Tirage d'après la date, via l'API Algolia HN sur la journée d'hier (figée, donc identique pour tous). Une partie par jour, série 🔥 et résultat à partager.
- **Look : « Encre de presse ».** Structure du mockup et de l'exemple (titre géant condensé façon « OWN THE COURT ») : hero noir encre, papier crème, accent rouge « breaking ». Style éditorial choisi sur Refero Styles, effets Aceternity UI sobres (3-4 : Spotlight, Text Generate, Bento Grid, Moving Border). Tailwind + motion.
- **Mise en page :** hero noir (nom géant, recherche, article à la une avec son image et une photo libre de droits si elle manque), puis les chiffres du jour (articles, sources, doublons fusionnés), puis le jeu du jour à gauche et « à lire plus tard » à droite, puis le fil filtrable.
- **Sources :** mélange FR et EN (HN, DEV.to, The Verge, Ars Technica, Numerama, Frandroid, Gamekult, JV, Les Numériques…), interface en français.
- **Dépôt :** nouveau dépôt GitHub créé au moment du déploiement, après validation.

## 9. Aperçu du lien (à faire sans me le redemander)

- Image Open Graph **1200 × 630** stylisée aux couleurs du projet : nom, accroche, technos et capture, générée avec `scripts/og/build-og.py` (ajouter le projet à la liste).
- Sur chaque page publique : `og:title`, `og:description`, `og:url`, `og:image` (adresse absolue), `og:image:width`, `og:image:height`, `og:image:alt` et `twitter:card` = `summary_large_image`.
- Vérifier en ligne que l'image répond en 200 et que les balises sont servies.

## 10. Indexation (à faire sans me le redemander)

- `robots.txt` : pages privées et routes techniques (API, JSON, admin) en `Disallow`, lien vers le sitemap.
- `sitemap.xml` : les pages publiques uniquement.
- Balise `canonical` sur chaque page publique ; `noindex` sur les pages privées.
- Données structurées JSON-LD sur l'accueil : `WebApplication`, avec `isPartOf` ProjectP (https://projectp.fr/).
- Lien « 30 jours, 30 projets » vers https://projectp.fr/ dans le pied de page.
- Site statique : ajouter le projet à `scripts/seo/apply-seo.py` et relancer le script.
- Vérifier en ligne, puis me rappeler de soumettre `https://depeche.projectp.fr/sitemap.xml` dans Google Search Console.

## 11. Vitrine 30days30projects (avec ma validation)

Une fois le projet en ligne, **me demander mon accord**, puis seulement :

- `projects.js` : l'entrée du jour 16 passe à `status: 'done'`, avec `name: 'Dépêche'`, `url`, `repo`, `image` et `description`.
- `preview-days-images/day16_depeche.png` : la capture de l'accueil, en 1600 × 900.
- `README.md` : la ligne du jour 16 dans le tableau des 30 projets.
- Commit et push du dépôt `30days30projects`.
