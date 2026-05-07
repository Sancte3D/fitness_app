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
});

test("index has no partner-only panel", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.ok(!html.includes('id="peerPanel"'));
});

test("index.html uses data-URI persona avatars (img, no file path)", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="userGate"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /data:image\/svg\+xml/);
  assert.match(html, /class="persona-avatar"/);
  assert.equal((html.match(/class="persona-avatar"/g) || []).length, 3);
  assert.match(html, /id="personaHeaderIcon"/);
});

test("app.js registers service worker and persona src map", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /service-worker\.js/);
  assert.match(js, /personaSrcMap/);
  assert.match(js, /headerPersonaSrc/);
});

test("app.js uses per-user storage prefix", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /daily-core-v3-\$\{/);
  assert.match(js, /David/);
  assert.match(js, /Michalis/);
  assert.match(js, /Nico/);
});

test("persona avatars exist", () => {
  assert.ok(fs.existsSync(path.join(root, "persona-david.svg")));
  assert.ok(fs.existsSync(path.join(root, "persona-michalis.svg")));
  assert.ok(fs.existsSync(path.join(root, "persona-nico.svg")));
});

test("manifest.webmanifest is valid and points to start URL", () => {
  const raw = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
  const m = JSON.parse(raw);
  assert.equal(m.name, "Daily Core");
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 1);
  assert.ok(m.start_url);
});

test("service worker lists cached static assets", () => {
  const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  assert.match(sw, /app\.js/);
  assert.match(sw, /index\.html/);
  assert.match(sw, /manifest\.webmanifest/);
});

test("referenced icons exist on disk", () => {
  for (const name of ["icon-192.svg", "icon-512.svg"]) {
    assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
  }
});
