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

test("coach onboarding overlay (no legacy three-tile profile gate)", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="coachOnboard"/);
  assert.match(html, /Hi! I'm your daily coach/);
  assert.match(html, /What's your name\?/);
  assert.match(html, /id="onboardNameInput"/);
  assert.match(html, /id="onboardContinueBtn"/);
  assert.match(html, /id="onboardingPersonaImg"/);
  assert.match(html, /<!--\s*deploy-asset-rev:63\s*-->/);
  assert.ok(!html.includes('id="userGate"'));
  assert.ok(!html.includes('data-user="David"'));
  assert.ok(!html.includes("userSwitchBtn"));
  assert.ok(!html.includes(".user-gate{"), "legacy three-tile gate CSS must be gone");
  assert.ok(!html.includes("user-picks"), "no user-picks grid styles");
  assert.match(html, /persona-david\.png\?v=63/);
  assert.ok(!/eigenes\s+konto/i.test(html));
  assert.match(html, /id="resetProfileBtn"/);
});

test("app.js: profile v1, persona hash, single data bucket", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /PROFILE_KEY\s*=\s*"daily-core-profile-v1"/);
  assert.match(js, /DATA_STORAGE_KEY\s*=\s*"daily-core-v3-data"/);
  assert.match(js, /personaFromDisplayName/);
  assert.match(js, /wireCoachOnboard/);
  assert.match(js, /Welcome back,/);
  assert.match(js, /Hi,/);
  assert.match(js, /PERSONA_ICON_SRC/);
  assert.match(js, /removeLegacyProfileGateDom/);
  assert.match(js, /service-worker\.js/);
  assert.match(js, /updateViaCache:\s*"none"/);
});

test("settings panel is fixed modal (not in-page section)", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="settingsPanel"[^>]*role="dialog"/);
  assert.match(html, /id="settingsPanel"[^>]*aria-modal="true"/);
  assert.match(html, /\.settings-overlay\{[^}]*position:fixed/);
  assert.match(html, /settings-backdrop/);
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

test("persona-nico.svg uses original 64×80 mask paths (hair detail)", () => {
  const svg = fs.readFileSync(path.join(root, "assets/personas/persona-nico.svg"), "utf8");
  assert.match(svg, /a5\.43,5\.43,0,0,0-1\.94-4\.47/);
  assert.match(svg, /M29\.94,34\.61/);
});

test("index has iPhone / full-screen web app head configuration", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /apple-mobile-web-app-status-bar-style/);
  assert.match(html, /name="format-detection"/);
  assert.match(html, /rel="apple-touch-icon"[^>]+apple-touch-icon\.png/);
  assert.match(html, /touch-action:manipulation/);
  assert.match(html, /-webkit-overflow-scrolling:touch/);
  assert.match(html, /-webkit-fill-available/);
});

test("manifest.webmanifest is valid and points to start URL", () => {
  const raw = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
  const m = JSON.parse(raw);
  assert.equal(m.name, "Daily Core");
  assert.equal(m.lang, "de");
  assert.ok(m.id);
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 1);
  assert.ok(m.start_url);
});

test("service worker: v63, purge old daily-core caches, network-first for documents", () => {
  const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  assert.match(sw, /const CACHE_NAME\s*=\s*"daily-core-v63"/);
  assert.match(sw, /PERSONA_QS\s*=\s*"\?v=63"/);
  assert.match(sw, /startsWith\("daily-core-"\)/);
  assert.match(sw, /networkFirstWithCacheFallback/);
  assert.match(sw, /navigate/);
  assert.match(sw, /\/app\.js/);
});

test("app mask icons use Electric Kiwi branding (vector source)", () => {
  const svg = fs.readFileSync(path.join(root, "icon-192.svg"), "utf8");
  assert.match(svg, /#CCFF00/);
  assert.match(svg, /#111111/);
});

test("referenced icons exist on disk", () => {
  for (const name of ["icon-192.svg", "icon-512.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
    assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
  }
});
