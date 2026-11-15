# Teacher Line — PWA v1 : installer l’appli sur téléphone, tablette et ordinateur

## Fichiers du correctif
- `index.html` : 9 lignes ajoutées dans <head> (manifest, icône iPhone, balises Apple) + 1 balise <script> juste avant </body>. Rien d’autre ne change.
- `manifest.webmanifest` : nom, couleurs, icônes de l’appli.
- `service-worker.js` : mode hors ligne et mises à jour.
- `pwa/pwa.js` : bouton « Installer » dans la barre du haut, bandeau, modes d’emploi (iPhone, Android, PC, Mac), message « Nouvelle version ».
- `pwa/` : 6 icônes (le rond Teacher Line).

## GitHub Desktop
Copie tout le contenu du zip à la racine du dépôt Teacher-Line (remplace `index.html`), puis Commit to main > Push origin.

## Ensuite
- Quand tu ajoutes un outil dans index.html : rien de spécial, la mise à jour arrive toute seule.
- Si tu remplaces index.html par une nouvelle version : garde les lignes « PWA » du <head> et la balise `pwa/pwa.js` avant </body>.
- Si tu modifies `service-worker.js` lui-même : change `VERSION` en haut (v1 → v2).
