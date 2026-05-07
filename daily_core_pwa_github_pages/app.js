"use strict";

/**
 * Static PWA (no React/Vite). Profile gate icons: PERSONA_GATE_MARKUP in this file
 * (same geometry as assets/personas/*.svg) mounted by mountProfileGateIcons() — not
 * initials, not separate gate PNG fetch. Header uses PERSONA_ICON_SRC PNGs only.
 */
const USER_NAMES = ["David", "Michalis", "Nico"];
const ACTIVE_USER_KEY = "daily-core-active-user";
const PERSONA_FALLBACK_USER = "David";

const PERSONA_ASSET_QS = "?v=56";

/** Relative to index.html (GitHub Pages artifact root = this folder). */
const PERSONA_ICON_SRC = {
  David: `./assets/personas/persona-david.png${PERSONA_ASSET_QS}`,
  Michalis: `./assets/personas/persona-michalis.png${PERSONA_ASSET_QS}`,
  Nico: `./assets/personas/persona-nico.png${PERSONA_ASSET_QS}`,
};
const PROFILE_GATE_ICON_VERSION = "inline-real-svg-v56";
const PERSONA_GATE_MARKUP = {
  "David": "<rect width=\"96\" height=\"96\" rx=\"22\" fill=\"#000\"/><g transform=\"translate(16 8)\" fill=\"#FFFFFF\"><path d=\"M39,53.09V51.26a15.5,15.5,0,0,0,2.61-1.76,5.63,5.63,0,0,0,.85-.77,15,15,0,0,0,3-4.14,2.26,2.26,0,0,0,.17-.35,14.69,14.69,0,0,0,1.24-4.33l0,0s0,0,0,0A14.13,14.13,0,0,0,47,38v0c1.84-.19,3.25-2.29,3.25-5S48.84,28.22,47,28v0a15,15,0,0,0-30,0v0c-1.84.19-3.25,2.29-3.25,5s1.41,4.78,3.25,5v0a15,15,0,0,0,8,13.26v1.83c-8.71.88-14.51,5.1-16,11.69l2,.44c1.27-5.73,6.24-9.29,14-10.12v.16a4,4,0,0,0,2.32,3.64,10.51,10.51,0,0,0,9.36,0A4,4,0,0,0,39,55.26V55.1c7.78.83,12.75,4.39,14,10.12l2-.44C53.51,58.19,47.71,54,39,53.09ZM19,38V35.12a5.67,5.67,0,0,0,3-2.58c1.94-3.22-1.91-7.84,1.12-10.47,4.36,3.74,13.43,3.74,17.79,0,3,2.63-.82,7.25,1.12,10.47a5.67,5.67,0,0,0,3,2.57V38a13.21,13.21,0,0,1-.14,1.78,2.5,2.5,0,0,1-.09.25.13.13,0,0,0,0,0s0,0,0,0l-.11.22a6.52,6.52,0,0,1-.48.8c-.18.27-.37.54-.56.8l-.3.41a2.43,2.43,0,0,1-.14.2l-.06.08a3.47,3.47,0,0,1-.25.29l-.17.16,0,0,0,0c-.26.18-.53.34-.8.5s-.28.16-.43.24l-.07,0a3.3,3.3,0,0,1-2.73-.79,17.74,17.74,0,0,0-1.32-1.42,3,3,0,0,0-.56-.49,6.89,6.89,0,0,0-3.39-1.32,15.54,15.54,0,0,0-3.54.14,7.43,7.43,0,0,0-3.41,1.64l-.05.05a14.22,14.22,0,0,0-2,1.57c-.21.13-.41.27-.62.39s-.41.23-.62.34l-.27.12-.29,0h-.09a5.08,5.08,0,0,1-.78,0h0l-.18,0s-.19,0-.29-.08l-.07,0-.16-.1h0l-.13-.13a4,4,0,0,1-.22-.34l-.15-.27L20,42.33l-.41-.76c0-.09-.08-.18-.13-.27A12.82,12.82,0,0,1,19,38Zm13.58,9.69h-.95a4.77,4.77,0,0,1-3.35-.88c-.75-.66-1.46-1.75-1.05-2.75a3.22,3.22,0,0,1,1.57-1.23l.78-.28a7.3,7.3,0,0,1,1.69-.27,12.84,12.84,0,0,1,2.55.2,6.71,6.71,0,0,1,1.6.42l.09,0,.14.09h0l.25.24.1.12,0,0a5.32,5.32,0,0,1,.35.61.61.61,0,0,1,.05.12l0,0,.09.27c0,.11.05.23.07.34a3.8,3.8,0,0,1-.34,1.66,2,2,0,0,1-1.35,1A15.09,15.09,0,0,1,32.58,47.69ZM48.25,33c0,1.52-.62,2.69-1.25,3v-5.9C47.63,30.31,48.25,31.48,48.25,33Zm-32.5,0c0-1.52.62-2.69,1.25-2.95V36C16.37,35.69,15.75,34.52,15.75,33ZM35.82,57.09a8.43,8.43,0,0,1-7.64,0A2,2,0,0,1,27,55.26V52.12a14.64,14.64,0,0,0,10,0v3.14A2,2,0,0,1,35.82,57.09Z\"/><ellipse cx=\"38\" cy=\"33.5\" rx=\"2\" ry=\"2.5\"/><path d=\"M31,39h2a1,1,0,0,0,0-2H31a1,1,0,0,0,0,2Z\"/><ellipse cx=\"26\" cy=\"33.5\" rx=\"2\" ry=\"2.5\"/><path d=\"M34.68,43.55a8.21,8.21,0,0,1-5.36,0,1,1,0,1,0-.64,1.9,10.3,10.3,0,0,0,6.64,0,1,1,0,0,0-.64-1.9Z\"/></g>",
  "Michalis": "<rect width=\"96\" height=\"96\" rx=\"22\" fill=\"#000\"/><g transform=\"translate(16 8)\" fill=\"#FFFFFF\"><path d=\"M39,53.09V51.26A15,15,0,0,0,47,38v0c1.84-.19,3.25-2.29,3.25-5S48.84,28.22,47,28v0h4V27a4,4,0,0,0-4-4A12,12,0,0,0,35,11H29A12,12,0,0,0,17,23a4,4,0,0,0-4,4v1h4v0c-1.84.19-3.25,2.29-3.25,5s1.41,4.78,3.25,5v0a15,15,0,0,0,8,13.26v1.83c-8.71.88-14.51,5.1-16,11.69l2,.44c1.27-5.73,6.24-9.29,14-10.12v.16a4,4,0,0,0,2.32,3.64,10.51,10.51,0,0,0,9.36,0A4,4,0,0,0,39,55.26V55.1c7.78.83,12.75,4.39,14,10.12l2-.44C53.51,58.19,47.71,54,39,53.09ZM48.25,33c0,1.52-.62,2.69-1.25,3v-5.9C47.63,30.31,48.25,31.48,48.25,33Zm-32.5,0c0-1.52.62-2.69,1.25-2.95V36C16.37,35.69,15.75,34.52,15.75,33ZM19,38V28h3a11,11,0,0,0,10-6.42A11,11,0,0,0,42,28h3V38a13,13,0,0,1-26,0ZM35.82,57.09a8.43,8.43,0,0,1-7.64,0A2,2,0,0,1,27,55.26V52.12a14.64,14.64,0,0,0,10,0v3.14A2,2,0,0,1,35.82,57.09Z\"/><ellipse cx=\"38\" cy=\"33.5\" rx=\"2\" ry=\"2.5\"/><path d=\"M31,39h2a1,1,0,0,0,0-2H31a1,1,0,0,0,0,2Z\"/><ellipse cx=\"26\" cy=\"33.5\" rx=\"2\" ry=\"2.5\"/><path d=\"M41.67,42a1,1,0,0,0-2,0c0,.52-.3,1.47-1,1.18-2.19-1.47-4.92-3.31-6.73-1.2-1.8-2.11-4.53-.27-6.72,1.2-.68.29-1-.66-1-1.18a1,1,0,0,0-2,0c-.8,4.14,7.17,5.29,9.7,3C34.5,47.24,42.47,46.09,41.67,42Z\"/></g>",
  "Nico": "<rect width=\"96\" height=\"96\" rx=\"22\" fill=\"#000\"/><g transform=\"translate(16 8)\" fill=\"#FFFFFF\"><path d=\"M39,53.09V51.26A15,15,0,0,0,47,38v0c1.84-.19,3.25-2.29,3.25-5a5.43,5.43,0,0,0-1.94-4.47,2.49,2.49,0,0,0,.33-.57c0,1.18,1.93,1.15,2-.09,0,.11,0,0,.06,0l.28-.15c.26-.13.54-.23.79-.38a2.58,2.58,0,0,0,1.13-1.5A2.79,2.79,0,0,0,52.66,24l-.17-.33a.61.61,0,0,1,0-.11,2,2,0,0,0,.23-.14,3,3,0,0,0,1.65-2.76A5.27,5.27,0,0,0,54,19a1.49,1.49,0,0,0-.11-.83c-.07-.15-.07-.15,0,0a.45.45,0,0,1,0-.39,1.7,1.7,0,0,0-.54-2.5c.19-.73-.25-1.08-.75-1.49-.65-.81-.16-1.73-.51-2.6s-1-1.56-1.34-2.37c-.64-.7-2-.75-2.74-1.37S47,5.9,46.45,5.52a2.86,2.86,0,0,1-1.64-1.39c-.56-.53-1.71-.56-2.43-1a4.15,4.15,0,0,0-1.53-.76,32.23,32.23,0,0,1-4.8-.46,35.17,35.17,0,0,0-3.49-.56,5,5,0,0,1-2.09.51c-1.19-.32-2.09.26-3.09.83-1,.4-1.31-.07-2.19-.24s-1.42.62-2.12,1.08a3.2,3.2,0,0,0-1.19.06,2,2,0,0,0-.71.31,1.79,1.79,0,0,0-.47.48l0,0h-.16c-1.45.16-2.79,1-4.22,1.17-.27.17-.41.72-.62,1-.64.74-1.73.8-2.09,1.76-.53,1.33-2.17,1.68-1.85,3.33-.15,1.08-1.33,1.44-1.28,2.55A3.94,3.94,0,0,1,10,16.7c-.07.38.16.74.18,1.14,0,.89-.92,1.46-.76,2.32.11.63.55,1.07.55,1.64a1.81,1.81,0,0,0,0,2.83,4.63,4.63,0,0,0,.69,1.12,6.32,6.32,0,0,0,1.45,1.07l.06,0,0,0,.07.07,0,0a3.45,3.45,0,0,0,.36.94,3,3,0,0,0,1.67,1.36.81.81,0,0,0,.63,0A6.06,6.06,0,0,0,13.75,33c0,2.68,1.41,4.78,3.25,5v0a15,15,0,0,0,8,13.26v1.83c-8.71.88-14.51,5.1-16,11.69l2,.44c1.27-5.73,6.24-9.29,14-10.12v.16a4,4,0,0,0,2.32,3.64,10.51,10.51,0,0,0,9.36,0A4,4,0,0,0,39,55.26V55.1c7.78.83,12.75,4.39,14,10.12l2-.44C53.51,58.19,47.71,54,39,53.09ZM47,36v-5.9c.63.26,1.25,1.43,1.25,2.95S47.63,35.69,47,36ZM15.75,33c0-1.52.62-2.69,1.25-2.95V36C16.37,35.69,15.75,34.52,15.75,33ZM19,38V29.7a3.09,3.09,0,0,0,1.18-.38c.62-.38.68-.89.86-1.53.44-1.57,2.63-1.1,3.49-2.43a6.3,6.3,0,0,1,.42-.82c.4-.44.48-.29,1.07-.1a4.51,4.51,0,0,0,2.27.26c1.05-.19,1.6-.62,2.63-.11a5.16,5.16,0,0,0,2.37.71c1.88,0,4-1.25,5.57.25a15.73,15.73,0,0,0,4.38,3.24,10.94,10.94,0,0,0,1.76.73V38a13,13,0,0,1-26,0ZM35.82,57.09a8.43,8.43,0,0,1-7.64,0A2,2,0,0,1,27,55.26V52.12a14.64,14.64,0,0,0,10,0v3.14A2,2,0,0,1,35.82,57.09Z\"/><path d=\"M29.94,34.61a3.84,3.84,0,0,1,4.12,0,4,4,0,1,0,.24-2.11,5.75,5.75,0,0,0-4.6,0,4,4,0,1,0,.24,2.11ZM38,32a2,2,0,1,1-2,2A2,2,0,0,1,38,32ZM26,36a2,2,0,1,1,2-2A2,2,0,0,1,26,36Z\"/><path d=\"M31,37a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z\"/><path d=\"M37,43a1,1,0,0,0-1-1H28a1,1,0,0,0-1,1,5,5,0,0,0,10,0Zm-7.83,1h5.66a3,3,0,0,1-5.66,0Z\"/></g>"
};

function buildPersonaGateSvg(user) {
  const inner = PERSONA_GATE_MARKUP[user];
  if (!inner) return "";
  return (
    '<svg class="persona-gate-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="56" height="56" role="img" aria-hidden="true" focusable="false" data-icon-source="' +
    PROFILE_GATE_ICON_VERSION +
    '">' +
    inner +
    "</svg>"
  );
}

function mountProfileGateIcons() {
  if (!window.__PROFILE_GATE_ICONS_LOGGED) {
    window.__PROFILE_GATE_ICONS_LOGGED = true;
    console.log("profile gate icons source:", PROFILE_GATE_ICON_VERSION);
  }
  const gate = document.getElementById("userGate");
  if (!gate) return;
  gate.querySelectorAll(".user-pick[data-user]").forEach((btn) => {
    const u = btn.getAttribute("data-user");
    const frame = btn.querySelector(".persona-frame");
    if (!frame || !USER_NAMES.includes(u)) return;
    const html = buildPersonaGateSvg(u);
    if (html) frame.innerHTML = html;
  });
}


function getProfileIconUrl(user) {
  const key = USER_NAMES.includes(user) ? user : PERSONA_FALLBACK_USER;
  const rel = PERSONA_ICON_SRC[key] ?? PERSONA_ICON_SRC[PERSONA_FALLBACK_USER];
  try {
    return new URL(rel, document.baseURI || window.location.href).href;
  } catch {
    return rel;
  }
}

const defaults = {
  pushGoal: 100,
  pushSets: 10,
  pushSeconds: 45,
  plankMinutes: 5,
  plankSets: 10,
  sessionMinutes: 60,
  splitMode: "blocks",
  theme: "light",
};

let activeUser = null;
let state = null;
let timer = null;
let pushTimer = null;
let eventsBound = false;

const $ = (id) => document.getElementById(id);
const ids = [
  "dateLine",
  "sessionTitle",
  "pushGoalPill",
  "plankGoalPill",
  "progressRing",
  "progressPercent",
  "completion",
  "timerState",
  "currentTitle",
  "currentSubtitle",
  "timeDisplay",
  "mainBtn",
  "skipBtn",
  "steps",
  "stepCounter",
  "calendarTitle",
  "streakText",
  "calendarGrid",
  "settingsBtn",
  "themeBtn",
  "settingsPanel",
  "settingsBackdrop",
  "settingsCloseBtn",
  "pushGoal",
  "pushSets",
  "pushSeconds",
  "plankMinutes",
  "plankSets",
  "sessionMinutes",
  "splitMode",
  "newDayBtn",
  "resetBtn",
  "exportBtn",
  "importBtn",
  "importFile",
  "toast",
  "userGate",
  "userEyebrow",
  "userSwitchBtn",
  "settingsStorageNote",
];
const el = {};

function updatePersonaHeaderIcon() {
  const img = $("personaHeaderIcon");
  if (!img) return;
  const u = activeUser || PERSONA_FALLBACK_USER;
  img.src = getProfileIconUrl(u);
  img.alt = `${u} Profil-Icon`;
  img.draggable = false;
}

function storageKey(user) {
  return `daily-core-v3-${user}`;
}

function applyThemeChrome(theme) {
  if (theme !== "dark" && theme !== "light") return;
  document.documentElement.dataset.theme = theme;
  const metaTheme = document.getElementById("themeColorMeta");
  if (metaTheme) metaTheme.content = theme === "dark" ? "#000000" : "#F7F7F2";
  const appleBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleBar) appleBar.content = theme === "dark" ? "black-translucent" : "default";
}

function readStoredUserTheme() {
  try {
    const u = localStorage.getItem(ACTIVE_USER_KEY);
    if (!u || !USER_NAMES.includes(u)) return null;
    const raw = localStorage.getItem(storageKey(u));
    if (!raw) return null;
    const t = JSON.parse(raw)?.settings?.theme;
    return t === "dark" || t === "light" ? t : null;
  } catch {
    return null;
  }
}

function syncUserGateAria() {
  const g = el.userGate;
  if (!g) return;
  g.setAttribute("aria-hidden", g.classList.contains("open") ? "false" : "true");
}

function syncBodyScrollLock() {
  const gate = el.userGate?.classList.contains("open");
  const settings = el.settingsPanel?.classList.contains("open");
  document.body.style.overflow = gate || settings ? "hidden" : "";
}

function getSyncCfg() {
  const c = window.DAILY_CORE_SYNC;
  if (!c?.supabaseUrl || !c?.supabaseAnonKey) return null;
  if (!String(c.supabaseUrl).startsWith("https://")) return null;
  return c;
}

function key(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fresh() {
  const s = { ...defaults };
  return {
    version: 3,
    settings: s,
    history: {},
    session: create(s),
    restUntil: null,
    workStarted: null,
  };
}

function norm(x) {
  const s = { ...defaults, ...(x?.settings || {}) };
  const out = {
    version: 3,
    settings: s,
    history: x?.history || {},
    session: x?.session?.date === key() ? x.session : create(s),
    restUntil: x?.restUntil ?? null,
    workStarted: x?.workStarted ?? null,
  };
  if (x?._savedAt) out._savedAt = x._savedAt;
  return out;
}

function loadFromDisk() {
  try {
    const k = storageKey(activeUser);
    let raw = localStorage.getItem(k);
    if (!raw) {
      const legacy = localStorage.getItem("daily-core-v3");
      if (legacy) {
        localStorage.setItem(k, legacy);
        localStorage.removeItem("daily-core-v3");
        raw = legacy;
      }
    }
    return raw ? norm(JSON.parse(raw)) : fresh();
  } catch {
    return fresh();
  }
}

function mergeOnLoad(local, remoteRow) {
  if (!remoteRow) return norm(local);
  const remoteState = norm(remoteRow.state);
  const rt = new Date(remoteRow.updated_at).getTime();
  const lt = local._savedAt ? new Date(local._savedAt).getTime() : 0;
  if (rt > lt) {
    remoteState._savedAt = remoteRow.updated_at;
    return remoteState;
  }
  return norm(local);
}

function meaningfulLocal(s) {
  return Object.keys(s.history || {}).length > 0 || s.session?.started || s.session?.completed;
}

async function cloudPull(username) {
  const cfg = getSyncCfg();
  if (!cfg) return null;
  const u = encodeURIComponent(username);
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/fitness_user_state?username=eq.${u}&select=state,updated_at`, {
    headers: {
      apikey: cfg.supabaseAnonKey,
      Authorization: `Bearer ${cfg.supabaseAnonKey}`,
    },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

async function cloudPush() {
  const cfg = getSyncCfg();
  if (!cfg || !activeUser) return;
  const payload = JSON.parse(JSON.stringify(state));
  delete payload._savedAt;
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/fitness_user_state?on_conflict=username`, {
    method: "POST",
    headers: {
      apikey: cfg.supabaseAnonKey,
      Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify({ username: activeUser, state: payload }),
  });
  if (!r.ok) throw new Error("sync");
  const rows = await r.json();
  if (Array.isArray(rows) && rows[0]?.updated_at) {
    state._savedAt = rows[0].updated_at;
    persistLocal();
  }
}

function scheduleCloudPush() {
  const cfg = getSyncCfg();
  if (!cfg || !activeUser) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    cloudPush().catch(() => toast("Cloud-Sync fehlgeschlagen"));
  }, 1400);
}

function queueSync() {
  if (!activeUser) return;
  state._savedAt = new Date().toISOString();
  persistLocal();
  scheduleCloudPush();
}

function persistLocal() {
  if (!activeUser) return;
  localStorage.setItem(storageKey(activeUser), JSON.stringify(state));
}

async function loadInitialState() {
  const local = loadFromDisk();
  const remoteRow = await cloudPull(activeUser);
  state = mergeOnLoad(local, remoteRow);
  persistLocal();
  const rt = remoteRow ? new Date(remoteRow.updated_at).getTime() : 0;
  const lt = local._savedAt ? new Date(local._savedAt).getTime() : 0;
  if (getSyncCfg()) {
    if (remoteRow && lt > rt) scheduleCloudPush();
    else if (!remoteRow && meaningfulLocal(local)) scheduleCloudPush();
  }
}

function create(s) {
  return { date: key(), started: false, completed: false, currentIndex: 0, steps: build(s) };
}

function build(s) {
  const pg = +s.pushGoal,
    ps = +s.pushSets,
    pm = +s.plankMinutes * 60,
    pls = +s.plankSets,
    psec = +s.pushSeconds;
  const pb = Math.floor(pg / ps),
    pr = pg % ps,
    plb = Math.floor(pm / pls),
    plr = pm % pls;
  const push = Array.from({ length: ps }, (_, i) => ({
    id: `p${i}`,
    type: "push",
    title: `Push-ups ${i + 1}`,
    amount: pb + (i < pr ? 1 : 0),
    duration: psec,
    done: false,
  }));
  const plank = Array.from({ length: pls }, (_, i) => ({
    id: `l${i}`,
    type: "plank",
    title: `Plank ${i + 1}`,
    amount: 0,
    duration: plb + (i < plr ? 1 : 0),
    done: false,
  }));
  if (s.splitMode === "alternating") {
    const r = [],
      m = Math.max(push.length, plank.length);
    for (let i = 0; i < m; i++) {
      if (push[i]) r.push(push[i]);
      if (plank[i]) r.push(plank[i]);
    }
    return r;
  }
  return [...push, ...plank];
}

function ensure() {
  if (state.session.date !== key()) {
    state.session = create(state.settings);
    state.restUntil = null;
    state.workStarted = null;
  }
}

function cur() {
  return state.session.steps[state.session.currentIndex] || null;
}

function doneCount() {
  return state.session.steps.filter((s) => s.done).length;
}

function pct() {
  return Math.round((doneCount() / (state.session.steps.length || 1)) * 100);
}

function fmt(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60),
    s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function label(s) {
  return s.type === "push" ? `${s.amount} Liegestützen` : `${fmt(s.duration)} Plank`;
}

function isRest() {
  return state.restUntil && new Date(state.restUntil).getTime() > Date.now();
}

function rem(s) {
  if (!s) return 0;
  if (!state.workStarted) return s.duration;
  return Math.max(0, s.duration - (Date.now() - new Date(state.workStarted).getTime()) / 1000);
}

function restSeconds() {
  const totalTarget = state.settings.sessionMinutes * 60;
  const work = state.session.steps.reduce((a, s) => a + s.duration, 0);
  const gaps = Math.max(1, state.session.steps.length - 1);
  return Math.max(10, Math.round((totalTarget - work) / gaps));
}

function streakFrom(hist) {
  let c = 0,
    d = new Date();
  while (hist[key(d)]?.completed) {
    c++;
    d.setDate(d.getDate() - 1);
  }
  return c;
}

function fillCalendarGrid(gridEl, hist) {
  const now = new Date(),
    y = now.getFullYear(),
    m = now.getMonth(),
    first = new Date(y, m, 1),
    last = new Date(y, m + 1, 0),
    off = (first.getDay() + 6) % 7,
    f = document.createDocumentFragment();
  ["M", "D", "M", "D", "F", "S", "S"].forEach((w) => {
    const d = document.createElement("div");
    d.className = "weekday";
    d.textContent = w;
    f.appendChild(d);
  });
  for (let i = 0; i < off; i++) {
    const d = document.createElement("div");
    d.className = "day";
    d.style.opacity = 0;
    f.appendChild(d);
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const dt = new Date(y, m, d),
      k = key(dt),
      x = document.createElement("div");
    x.className = `day ${k === key() ? "today" : ""} ${hist[k]?.completed ? "done" : ""}`;
    x.innerHTML = `<span>${d}</span>`;
    f.appendChild(x);
  }
  gridEl.replaceChildren(f);
}

function renderSteps() {
  const f = document.createDocumentFragment(),
    a = state.session.currentIndex;
  state.session.steps.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `step ${s.done ? "done" : ""} ${i === a && !state.session.completed ? "active" : ""}`;
    b.innerHTML = `<div class=node><div class=dot></div></div><div><div class=stitle>${s.title}</div><div class=ssub>${s.type === "push" ? "Kraft" : "Core"} · ${i + 1} von ${state.session.steps.length}</div></div><div class=chip>${s.type === "push" ? s.amount + "x" : fmt(s.duration)}</div>`;
    b.onclick = () => {
      if (s.done) return;
      state.session.started = true;
      state.session.currentIndex = i;
      state.restUntil = null;
      startWork();
      queueSync();
      render();
    };
    f.appendChild(b);
  });
  el.steps.replaceChildren(f);
}

function renderCal() {
  const now = new Date();
  fillCalendarGrid(el.calendarGrid, state.history);
  el.calendarTitle.textContent = now.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  el.streakText.textContent = `${streakFrom(state.history)} Tage Streak`;
}

function bindSettingsForm() {
  ["pushGoal", "pushSets", "pushSeconds", "plankMinutes", "plankSets", "sessionMinutes", "splitMode"].forEach((id) => {
    el[id].value = state.settings[id];
  });
}

function render() {
  if (!state || !activeUser) return;
  ensure();
  applyThemeChrome(state.settings.theme);
  const p = pct(),
    s = cur(),
    rest = isRest();
  el.dateLine.textContent = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
  el.sessionTitle.textContent = state.session.completed ? "Done" : state.session.started ? "Läuft" : "Neuer Tag";
  const pushDone = state.session.steps.filter((x) => x.type === "push" && x.done).reduce((a, x) => a + x.amount, 0);
  const plankDone = state.session.steps.filter((x) => x.type === "plank" && x.done).reduce((a, x) => a + x.duration, 0);
  el.pushGoalPill.textContent = `${pushDone}/${state.settings.pushGoal} Push-ups`;
  el.plankGoalPill.textContent = `${fmt(plankDone)}/${fmt(state.settings.plankMinutes * 60)} Plank`;
  el.progressRing.style.setProperty("--p", p);
  el.progressPercent.textContent = p;
  el.stepCounter.textContent = `${doneCount()} / ${state.session.steps.length}`;
  el.completion.classList.toggle("show", state.session.completed);

  if (state.session.completed) {
    el.timerState.textContent = "Abgeschlossen";
    el.currentTitle.textContent = "Heute erledigt";
    el.currentSubtitle.textContent = "Kalender wurde markiert.";
    el.timeDisplay.textContent = "00:00";
    el.mainBtn.textContent = "Fertig";
    el.mainBtn.disabled = true;
    el.skipBtn.textContent = "Neuer Tag";
    el.skipBtn.disabled = false;
  } else if (rest) {
    const r = (new Date(state.restUntil).getTime() - Date.now()) / 1000;
    el.timerState.textContent = "Pause";
    el.currentTitle.textContent = "Kurz warten";
    el.currentSubtitle.textContent = s ? `Danach: ${label(s)}` : "Nächster Satz";
    el.timeDisplay.textContent = fmt(r);
    el.mainBtn.textContent = "Pause überspringen";
    el.mainBtn.disabled = false;
    el.skipBtn.textContent = "Nächster Satz";
    el.skipBtn.disabled = false;
  } else if (!state.session.started) {
    el.timerState.textContent = "Bereit";
    el.currentTitle.textContent = "Session starten";
    el.currentSubtitle.textContent = "Linearer Ablauf mit Countdown und Auto-Pace.";
    el.timeDisplay.textContent = "00:00";
    el.mainBtn.textContent = "Start";
    el.mainBtn.disabled = false;
    el.skipBtn.textContent = "Überspringen";
    el.skipBtn.disabled = true;
  } else if (s) {
    el.timerState.textContent = s.type === "push" ? "Push-up Satz" : "Plank Satz";
    el.currentTitle.textContent = label(s);
    el.currentSubtitle.textContent =
      s.type === "push" ? "Countdown läuft. Danach abhaken." : "Timer läuft. Bei 00:00 automatisch erledigt.";
    el.timeDisplay.textContent = fmt(rem(s));
    el.mainBtn.textContent = s.type === "push" ? "Abhaken" : "Läuft";
    el.mainBtn.disabled = s.type === "plank";
    el.skipBtn.textContent = "Überspringen";
    el.skipBtn.disabled = false;
  }

  renderSteps();
  renderCal();
  el.settingsStorageNote.textContent = getSyncCfg() ? "Profil + Supabase" : "nur lokal · Profil";
  bindSettingsForm();
  persistLocal();
}

function start() {
  state.session.started = true;
  startWork();
  queueSync();
  render();
  toast("Session gestartet");
}

function startWork() {
  if (!state.workStarted) state.workStarted = new Date().toISOString();
}

function completeStep() {
  const s = cur();
  if (!s) return completeAll();
  s.done = true;
  state.workStarted = null;
  const next = state.session.steps.findIndex((x) => !x.done);
  state.session.currentIndex = next < 0 ? state.session.steps.length : next;
  if (next < 0) return completeAll();
  state.restUntil = new Date(Date.now() + restSeconds() * 1000).toISOString();
  queueSync();
  render();
}

function completeAll() {
  state.session.completed = true;
  state.restUntil = null;
  state.workStarted = null;
  state.history[state.session.date] = { completed: true, completedAt: new Date().toISOString() };
  queueSync();
  render();
  toast("Training abgeschlossen");
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
}

function tick() {
  const s = cur();
  if (state.restUntil && new Date(state.restUntil).getTime() <= Date.now()) {
    state.restUntil = null;
    startWork();
  }
  if (s && state.session.started && !isRest() && state.workStarted && rem(s) <= 0) {
    if (s.type === "plank") completeStep();
    else state.workStarted = null;
  }
  render();
}

function apply() {
  state.settings.pushGoal = clamp(el.pushGoal.value, 10, 500, 100);
  state.settings.pushSets = clamp(el.pushSets.value, 2, 30, 10);
  state.settings.pushSeconds = clamp(el.pushSeconds.value, 10, 180, 45);
  state.settings.plankMinutes = clamp(el.plankMinutes.value, 1, 30, 5);
  state.settings.plankSets = clamp(el.plankSets.value, 2, 30, 10);
  state.settings.sessionMinutes = clamp(el.sessionMinutes.value, 10, 180, 60);
  state.settings.splitMode = el.splitMode.value;
  state.session = create(state.settings);
  state.restUntil = null;
  state.workStarted = null;
  queueSync();
  render();
  toast("Setup aktualisiert");
}

function clamp(v, min, max, fb) {
  v = Number(v);
  return Number.isNaN(v) ? fb : Math.min(max, Math.max(min, Math.round(v)));
}

function resetToday() {
  state.session = create(state.settings);
  state.restUntil = null;
  state.workStarted = null;
  delete state.history[key()];
  queueSync();
  render();
  toast("Heute zurückgesetzt");
}

function resetAll() {
  if (!confirm("Alles löschen?")) return;
  state = fresh();
  queueSync();
  render();
  toast("Alles zurückgesetzt");
}

function backup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `daily-core-backup-${activeUser}-${key()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importFile(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      state = norm(JSON.parse(r.result));
      queueSync();
      render();
      toast("Backup importiert");
    } catch {
      toast("Import fehlgeschlagen");
    }
  };
  r.readAsText(file);
}

function setSettingsOpen(on) {
  if (!el.settingsPanel) return;
  el.settingsPanel.classList.toggle("open", on);
  el.settingsPanel.setAttribute("aria-hidden", on ? "false" : "true");
  syncBodyScrollLock();
}

function toast(t) {
  el.toast.textContent = t;
  el.toast.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.toast.classList.remove("show"), 1600);
}

function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;
  el.mainBtn.onclick = () => {
    if (!state.session.started) return start();
    if (isRest()) {
      state.restUntil = null;
      startWork();
      queueSync();
      return render();
    }
    completeStep();
  };
  el.skipBtn.onclick = () => {
    if (state.session.completed) return resetToday();
    if (isRest()) {
      state.restUntil = null;
      startWork();
      queueSync();
      return render();
    }
    completeStep();
  };
  el.settingsBtn.onclick = () => setSettingsOpen(!el.settingsPanel.classList.contains("open"));
  el.settingsBackdrop.onclick = () => setSettingsOpen(false);
  el.settingsCloseBtn.onclick = () => setSettingsOpen(false);
  el.themeBtn.onclick = () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    queueSync();
    render();
  };
  ["pushGoal", "pushSets", "pushSeconds", "plankMinutes", "plankSets", "sessionMinutes", "splitMode"].forEach((id) => {
    el[id].onchange = apply;
  });
  el.newDayBtn.onclick = resetToday;
  el.resetBtn.onclick = resetAll;
  el.exportBtn.onclick = backup;
  el.importBtn.onclick = () => el.importFile.click();
  el.importFile.onchange = (e) => importFile(e.target.files[0]);
  el.userSwitchBtn.onclick = () => {
    if (!confirm("Anderes Profil wählen? Der aktuelle Stand ist lokal (und bei Cloud aktiv) bereits gesichert.")) return;
    $("userGate").classList.add("open");
    mountProfileGateIcons();
    syncUserGateAria();
    syncBodyScrollLock();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.settingsPanel.classList.contains("open")) setSettingsOpen(false);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick();
  });
  window.addEventListener("beforeunload", persistLocal);
}

async function chooseUser(u) {
  if (!USER_NAMES.includes(u)) return;
  activeUser = u;
  localStorage.setItem(ACTIVE_USER_KEY, u);
  $("userGate").classList.remove("open");
  syncUserGateAria();
  syncBodyScrollLock();
  el.userEyebrow.textContent = u;
  updatePersonaHeaderIcon();
  bindEvents();
  await loadInitialState();
  render();
  if (!timer) timer = setInterval(tick, 1000);
}

function wireUserGate() {
  document.querySelectorAll("#userGate [data-user]").forEach((b) => {
    b.addEventListener("click", () => chooseUser(b.getAttribute("data-user")));
  });
}

function boot() {
  ids.forEach((id) => {
    el[id] = $(id);
  });
  mountProfileGateIcons();
  const earlyTheme = readStoredUserTheme();
  if (earlyTheme) applyThemeChrome(earlyTheme);
  wireUserGate();
  const stored = localStorage.getItem(ACTIVE_USER_KEY);
  if (stored && USER_NAMES.includes(stored)) {
    $("userGate").classList.remove("open");
    activeUser = stored;
    el.userEyebrow.textContent = activeUser;
    updatePersonaHeaderIcon();
    syncUserGateAria();
    syncBodyScrollLock();
    bindEvents();
    loadInitialState().then(() => {
      render();
      if (!timer) timer = setInterval(tick, 1000);
    });
  } else {
    syncUserGateAria();
    syncBodyScrollLock();
  }
}

boot();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js", { updateViaCache: "none" })
      .then((reg) => {
        reg.update().catch(() => {});
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) reg.update().catch(() => {});
        });
      })
      .catch(() => {});
  });
}
