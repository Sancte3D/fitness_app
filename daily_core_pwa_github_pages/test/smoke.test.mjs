import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

test("index loads Neue Haas Unica @font-face and scale vars", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /@font-face/);
  assert.match(html, /--font-ui:"Neue Haas Unica"/);
  assert.match(html, /--size-body:15px/);
});

test("index uses Electric Kiwi theme tokens", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /--kiwi-500:#CCFF00/);
  assert.match(html, /--neutral-050:#F7F7F2/);
  assert.match(html, /--color-bg:/);
  assert.match(html, /--overlay-scrim:/);
});

test("index has no partner-only panel", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.ok(!html.includes('id="peerPanel"'));
});

test("index.html profile gate uses inline SVG icons; header uses PNG", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="userGate"/);
  assert.match(html, /id="themeColorMeta"/);
  assert.match(html, /id="userGateTitle"/);
  assert.match(html, /src="\.\/app\.js"/);
  const gateOnly = html.split("<main")[0];
  assert.ok(
    !gateOnly.includes("assets/personas/persona-"),
    "profile gate must embed vectors in HTML, not separate PNG requests",
  );
  assert.equal((html.match(/class="persona-gate-icon"/g) || []).length, 3);
  assert.match(html, /M 38 32 A 16 16 0 0 1 38 64/);
  assert.match(html, /3\.25-5S48\.84/);
  assert.match(html, /a5\.43,5\.43/);
  assert.match(html, /M29\.94,34\.61/);
  assert.match(html, /persona-david\.png\?v=54/);
  assert.ok(!html.includes("persona-michalis.png"), "Michalis gate is inline SVG; PNG only for header icon when active");
  assert.ok(!/class="persona-avatar"[^>]*src="data:image/.test(html), "no data: URIs on raster avatars");
  assert.ok(!/eigenes\s+konto/i.test(html), "Eigenes Konto must not appear in profile gate HTML");
  assert.match(html, /class="persona-frame"/);
  assert.equal((html.match(/class="persona-frame"/g) || []).length, 3);
  assert.match(html, /id="personaHeaderIcon"/);
  assert.match(html, /class="settings-overlay"/);
  assert.match(html, /id="settingsPanel"/);
  assert.match(html, /<!--\s*deploy-asset-rev:54\s*-->/);
  assert.match(html, /purge.*unregister/s);
  assert.match(html, /role="dialog"/);
  assert.match(html, /apple-touch-icon\.png/);
});

test("settings panel is fixed modal (not in-page section)", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="settingsPanel"[^>]*role="dialog"/);
  assert.match(html, /id="settingsPanel"[^>]*aria-modal="true"/);
  assert.match(html, /\.settings-overlay\{[^}]*position:fixed/);
  assert.match(html, /settings-backdrop/);
});

test("app.js registers service worker and persona icon URLs", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /service-worker\.js/);
  assert.match(js, /themeColorMeta/);
  assert.match(js, /apple-mobile-web-app-status-bar-style/);
  assert.match(js, /applyThemeChrome/);
  assert.match(js, /syncBodyScrollLock/);
  assert.match(js, /readStoredUserTheme/);
  assert.match(js, /getProfileIconUrl/);
  assert.match(js, /PERSONA_ICON_SRC/);
  assert.ok(!js.includes("personaSrcMap"), "icons must not be scraped from DOM");
  assert.match(js, /updateViaCache:\s*"none"/);
});

test("app.js uses per-user storage prefix", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /daily-core-v3-\$\{/);
  assert.match(js, /David/);
  assert.match(js, /Michalis/);
  assert.match(js, /Nico/);
});

test("persona avatars exist", () => {
  const b = path.join(root, "assets", "personas");
  for (const f of ["persona-david.png", "persona-michalis.png", "persona-nico.png"]) {
    assert.ok(fs.existsSync(path.join(b, f)), `missing ${f}`);
  }
  for (const f of ["persona-david.svg", "persona-michalis.svg", "persona-nico.svg"]) {
    assert.ok(fs.existsSync(path.join(b, f)), `missing source ${f}`);
  }
});

test("manifest.webmanifest is valid and points to start URL", () => {
  const raw = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
  const m = JSON.parse(raw);
  assert.equal(m.name, "Daily Core");
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 1);
  assert.ok(m.start_url);
  const png = m.icons.find((i) => i.type === "image/png" && i.src.includes("icon-192.png"));
  assert.ok(png, "manifest should list PNG app icons for install / iOS");
});

test("service worker lists cached static assets", () => {
  const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  assert.match(sw, /app\.js/);
  assert.match(sw, /index\.html/);
  assert.match(sw, /manifest\.webmanifest/);
  assert.match(sw, /assets\/personas\/persona-david\.png/);
  assert.match(sw, /icon-192\.png/);
  assert.match(sw, /const CACHE_NAME="daily-core-v54"/);
  assert.match(sw, /PERSONA_QS="\?v=54"/);
});

test("referenced icons exist on disk", () => {
  for (const name of ["icon-192.svg", "icon-512.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
    assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
  }
});
