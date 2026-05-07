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

test("profile gate HTML is placeholders only; real SVG comes from app.js", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="userGate"/);
  assert.match(html, /PROFILE GATE ICONS v56/);
  const mainIdx = html.indexOf("<main");
  const gateCardStart = html.indexOf('class="user-gate-card"');
  assert.ok(gateCardStart !== -1 && mainIdx !== -1);
  const gateCardHtml = html.slice(gateCardStart, mainIdx);
  assert.ok(!gateCardHtml.includes("<svg"), "gate card must not contain inline SVG — mounted by app.js");
  assert.ok(!gateCardHtml.includes("persona-gate-icon"));
  assert.ok(!gateCardHtml.includes("assets/personas/persona-"), "no raster in gate card HTML");
  assert.equal((gateCardHtml.match(/class="persona-frame"><\/span>/g) || []).length, 3);
  assert.match(html, /persona-david\.png\?v=56/);
  assert.match(html, /<!--\s*deploy-asset-rev:56\s*-->/);
  assert.ok(!/<text[\s>]/.test(gateCardHtml), "no SVG text in static gate");
  assert.ok(!/eigenes\s+konto/i.test(html), "Eigenes Konto must not appear");
  assert.match(html, /class="settings-overlay"/);
  assert.match(html, /purge.*unregister/s);
});

test("app.js mounts persona gate from PERSONA_GATE_MARKUP (mask paths, no initials)", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /PROFILE_GATE_ICON_VERSION\s*=\s*"inline-real-svg-v56"/);
  assert.match(js, /PERSONA_GATE_MARKUP/);
  assert.match(js, /mountProfileGateIcons/);
  assert.match(js, /a15\.5,15\.5,0,0,0,2\.61-1\.76/);
  assert.match(js, /3\.25-5S48\.84/);
  assert.match(js, /a5\.43,5\.43/);
  assert.match(js, /41\.67,42/);
  assert.ok(!js.includes("<text"), "no text nodes in SVG markup strings");
  assert.ok(!js.includes("personaSrcMap"), "icons must not be scraped from DOM");
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

test("manifest.webmanifest is valid and points to start URL", () => {
  const raw = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
  const m = JSON.parse(raw);
  assert.equal(m.name, "Daily Core");
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 1);
  assert.ok(m.start_url);
});

test("service worker: v56, purge old daily-core caches, network-first for documents", () => {
  const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  assert.match(sw, /const CACHE_NAME\s*=\s*"daily-core-v56"/);
  assert.match(sw, /PERSONA_QS\s*=\s*"\?v=56"/);
  assert.match(sw, /startsWith\("daily-core-"\)/);
  assert.match(sw, /networkFirstWithCacheFallback/);
  assert.match(sw, /navigate/);
  assert.match(sw, /\/app\.js/);
});

test("referenced icons exist on disk", () => {
  for (const name of ["icon-192.svg", "icon-512.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
    assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
  }
});
