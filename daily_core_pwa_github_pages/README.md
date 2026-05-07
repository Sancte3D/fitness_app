# Daily Core

Private PWA für tägliche Liegestütze und Planks – Profile **David**, **Michalis** und **Nico**; Icons: `assets/personas/persona-*.png` (Anzeige), passende `.svg` im gleichen Ordner als bearbeitbare Quelle.

## Cloud-Sync (gemeinsamer Stand)

1. Projekt auf [Supabase](https://supabase.com) anlegen.
2. SQL aus `../supabase/schema.sql` im SQL Editor ausführen (Tabelle + Richtlinien).
3. In `sync-config.js` die **Project URL** und den **anon public** Key eintragen (`Settings` → `API`).
4. App deployen oder lokal öffnen; beim Start Profil wählen. Jeder Name hat eine eigene Zeile in der Datenbank; der Partner-Kalender wird schreibgeschützt angezeigt (alle ~12 s aktualisiert).

Ohne Supabase bleibt alles **nur lokal** und getrennt nach gewähltem Profil (verschiedene `localStorage`-Keys).

## GitHub Pages

Pages-Deploy wird per GitHub Actions aus diesem Ordner gebaut (siehe `.github/workflows/pages.yml` im Repo-Root).

Trainingsdaten liegen auf dem Gerät; mit aktivem Sync zusätzlich in deiner Supabase-Datenbank (nicht im Git-Repository).
