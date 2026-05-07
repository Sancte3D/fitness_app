# Daily Core

Progressive Web App für **tägliches Push-up- und Plank-Training** mit Profilen **David**, **Michalis** und **Nico**. Daten pro Profil in `localStorage`; optional **Supabase**-Sync.

**Theme:** Electric Kiwi (Akzent `#CCFF00`, Hintergrund `#F7F7F2`, Typo *Neue Haas Unica* wenn WOFF2 unter `fonts/` liegen).

## iPhone: Zum Home-Bildschirm

1. Seite in **Safari** öffnen (deployte GitHub-Pages-URL).
2. **Teilen** → **Zum Home-Bildschirm**.
3. Es werden `apple-touch-icon.png` (180×180), `manifest.webmanifest` und `meta apple-mobile-web-app-*` genutzt; im **Standalone**-Modus setzt die App `theme-color` / Statusleiste passend zu Hell‑/Dunkelmodus (`black-translucent` im Dark Mode).
4. **`?purge=1`** an die URL hängen, falls nach einem Update noch ein alter Service-Worker oder Cache klemmt (dann einmal neu laden).

**App-Icons (Start/PWA):** `icon-192.svg` / `icon-512.svg` (Quelle), daraus gerenderte `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — Kiwi-Fortschrittsring auf dunklem Kachel, passend zum UI.

## Verhalten & Feinschliff

- **Safe Area:** `viewport-fit=cover`, Innenabstände nutzen `env(safe-area-inset-*)`.
- **Touch:** `touch-action: manipulation` auf Haupt-Controls (weniger Doppeltipp-Zoom-Verzögerung); Modals/Gate mit `-webkit-overflow-scrolling: touch`.
- **Volle Höhe:** `min-height: 100dvh` und `-webkit-fill-available` gegen Safari-Toolbar-Sprünge.
- **Animationen:** Leichte `transform`-Rückmeldung auf `:active`; bei **`prefers-reduced-motion: reduce`** werden Transitions und Druck-Scale deaktiviert.
- **Profil-Gate:** Persona-Icons als **PNG** (`assets/personas/persona-*.png`), Quellen als `.svg` im gleichen Ordner.

## Cloud-Sync (optional)

1. Projekt auf [Supabase](https://supabase.com) anlegen.
2. SQL aus `../supabase/schema.sql` im SQL Editor ausführen.
3. In `sync-config.js` **Project URL** und **anon public** Key eintragen (`Settings` → `API`).
4. App deployen oder lokal öffnen; Profil wählen. Ohne gültige Konfiguration bleibt alles **nur lokal**, getrennt nach Profil.

## GitHub Pages

Deploy per GitHub Actions (`.github/workflows/pages.yml` im Repo-Root). Trainingsdaten liegen auf dem Gerät bzw. in deiner Supabase-Instanz — nicht im Git-Repository.
