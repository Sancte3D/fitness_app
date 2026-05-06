import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

test("index.html loads app and profile gate", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="userGate"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /class="app"/);
});

test("app.js registers service worker", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /service-worker\.js/);
});

test("app.js uses per-user storage prefix", () => {
  const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(js, /daily-core-v3-\$\{/);
  assert.match(js, /David/);
  assert.match(js, /Michalis/);
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
  assert.match(sw, /\.\/app\.js/);
  assert.match(sw, /index\.html/);
  assert.match(sw, /manifest\.webmanifest/);
});

test("referenced icons exist on disk", () => {
  for (const name of ["icon-192.svg", "icon-512.svg"]) {
    assert.ok(fs.existsSync(path.join(root, name)), `missing ${name}`);
  }
});
