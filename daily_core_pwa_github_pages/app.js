"use strict";

/**
 * One-time coach onboarding: display name → deterministic persona (David/Michalis/Nico PNG).
 * Training data in DATA_STORAGE_KEY; Supabase username = slug(displayName).
 */
const PERSONA_IDS = ["David", "Michalis", "Nico"];
const PERSONA_FALLBACK = "David";
const PROFILE_KEY = "daily-core-profile-v1";
const LEGACY_ACTIVE_KEY = "daily-core-active-user";
const DATA_STORAGE_KEY = "daily-core-v3-data";

const PERSONA_ASSET_QS = "?v=64";

const PERSONA_ICON_SRC = {
  David: `./assets/personas/persona-david.png${PERSONA_ASSET_QS}`,
  Michalis: `./assets/personas/persona-michalis.png${PERSONA_ASSET_QS}`,
  Nico: `./assets/personas/persona-nico.png${PERSONA_ASSET_QS}`,
};

let activeUser = null;
/** @type {string|null} */
let userDisplayName = null;
/** @type {string|null} */
let userPersona = null;

function getProfileIconUrl(personaId) {
  const key = PERSONA_IDS.includes(personaId) ? personaId : PERSONA_FALLBACK;
  const rel = PERSONA_ICON_SRC[key] ?? PERSONA_ICON_SRC[PERSONA_FALLBACK];
  try {
    return new URL(rel, document.baseURI || window.location.href).href;
  } catch {
    return rel;
  }
}

function slugForCloud(name) {
  const s = String(name || "user")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return s || "user";
}

function personaFromDisplayName(name) {
  const s = name.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return PERSONA_IDS[Math.abs(h) % 3];
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.displayName && p.persona && PERSONA_IDS.includes(p.persona)) return p;
    }
    const legacy = localStorage.getItem(LEGACY_ACTIVE_KEY);
    if (legacy && PERSONA_IDS.includes(legacy)) {
      const p = { displayName: legacy, persona: legacy, v: 1 };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      localStorage.removeItem(LEGACY_ACTIVE_KEY);
      return p;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

function applyProfileToRuntime(p) {
  userDisplayName = p.displayName;
  userPersona = p.persona;
  activeUser = slugForCloud(userDisplayName);
}

function migrateLegacyTrainingBlob() {
  if (localStorage.getItem(DATA_STORAGE_KEY)) return;
  const legacySingle = localStorage.getItem("daily-core-v3");
  if (legacySingle) {
    localStorage.setItem(DATA_STORAGE_KEY, legacySingle);
    localStorage.removeItem("daily-core-v3");
    return;
  }
  for (const id of PERSONA_IDS) {
    const raw = localStorage.getItem(`daily-core-v3-${id}`);
    if (raw) {
      localStorage.setItem(DATA_STORAGE_KEY, raw);
      return;
    }
  }
}

/** Full local wipe: profile, training blob, legacy keys — then reload (onboarding if no cloud re-hydrate). */
function wipeAllLocalAppDataAndReload() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(DATA_STORAGE_KEY);
    localStorage.removeItem(LEGACY_ACTIVE_KEY);
    PERSONA_IDS.forEach((id) => localStorage.removeItem(`daily-core-v3-${id}`));
    localStorage.removeItem("daily-core-v3");
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  location.reload();
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
  "coachOnboard",
  "onboardNameInput",
  "onboardContinueBtn",
  "onboardStepReveal",
  "onboardingPersonaImg",
  "onboardRevealMsg",
  "onboardStartBtn",
  "userEyebrow",
  "settingsStorageNote",
  "resetProfileBtn",
];
const el = {};

function updatePersonaHeaderIcon() {
  const img = $("personaHeaderIcon");
  if (!img || !userPersona) return;
  img.src = getProfileIconUrl(userPersona);
  img.alt = `${userDisplayName || "You"} · coach icon`;
  img.draggable = false;
}

function applyDisplayModeClass() {
  try {
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) ||
      window.navigator.standalone === true;
    document.documentElement.classList.toggle("pwa-standalone", !!standalone);
  } catch {
    /* ignore */
  }
}

function storageKey() {
  return DATA_STORAGE_KEY;
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
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw)?.settings?.theme;
    return t === "dark" || t === "light" ? t : null;
  } catch {
    return null;
  }
}

function syncCoachOnboardAria() {
  const g = el.coachOnboard;
  if (!g) return;
  g.setAttribute("aria-hidden", g.classList.contains("open") ? "false" : "true");
}

function syncBodyScrollLock() {
  const onboard = el.coachOnboard?.classList.contains("open");
  const settings = el.settingsPanel?.classList.contains("open");
  document.body.style.overflow = onboard || settings ? "hidden" : "";
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
    let raw = localStorage.getItem(DATA_STORAGE_KEY);
    if (!raw) {
      migrateLegacyTrainingBlob();
      raw = localStorage.getItem(DATA_STORAGE_KEY);
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
  localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(state));
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
  el.settingsStorageNote.textContent = getSyncCfg()
    ? `${userDisplayName || ""} · Supabase`
    : `${userDisplayName || ""} · nur lokal`;
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
  if (
    !confirm(
      "Alle lokalen Daten löschen? Profil, Training und Einstellungen auf diesem Gerät werden entfernt und die App lädt neu (Onboarding erneut).",
    )
  )
    return;
  wipeAllLocalAppDataAndReload();
}

function backup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `daily-core-backup-${activeUser || "user"}-${key()}.json`;
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
  el.resetProfileBtn.onclick = () => {
    if (!confirm("Profil neu starten? Dein Name, Avatar und alle Trainingsdaten auf diesem Gerät werden gelöscht.")) return;
    wipeAllLocalAppDataAndReload();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.settingsPanel.classList.contains("open")) setSettingsOpen(false);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick();
  });
  window.addEventListener("beforeunload", persistLocal);
}

function wireCoachOnboard() {
  const input = el.onboardNameInput;
  const cont = $("onboardStepName");
  const btn = el.onboardContinueBtn;
  const startBtn = el.onboardStartBtn;
  const img = el.onboardingPersonaImg;
  if (!input || !btn || !startBtn || !img || !el.onboardStepReveal) return;

  function submitName() {
    const name = String(input.value || "")
      .trim()
      .replace(/\s+/g, " ");
    if (name.length < 1) {
      toast("Please enter your name");
      input.focus();
      return;
    }
    if (name.length > 40) {
      toast("Name is too long");
      return;
    }
    const persona = personaFromDisplayName(name);
    const p = { displayName: name, persona, v: 1 };
    saveProfile(p);
    applyProfileToRuntime(p);
    migrateLegacyTrainingBlob();

    if (cont) cont.hidden = true;
    el.onboardStepReveal.hidden = false;

    img.src = getProfileIconUrl(persona);
    img.classList.remove("onboard-animate");
    void img.offsetWidth;
    img.classList.add("onboard-animate");
    el.onboardRevealMsg.textContent = `Nice to meet you, ${name}. Here's your coach.`;
    startBtn.focus();
  }

  btn.onclick = submitName;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitName();
    }
  });
  startBtn.onclick = () => finishOnboardingFirstRun();
}

function finishOnboardingFirstRun() {
  el.coachOnboard.classList.remove("open");
  syncCoachOnboardAria();
  syncBodyScrollLock();
  if (userDisplayName) el.userEyebrow.textContent = `Hi, ${userDisplayName}!`;
  updatePersonaHeaderIcon();
  bindEvents();
  loadInitialState().then(() => {
    render();
    if (!timer) timer = setInterval(tick, 1000);
  });
}

function removeLegacyProfileGateDom() {
  document.getElementById("userGate")?.remove();
  document.querySelectorAll(".user-gate").forEach((n) => n.remove());
}

function boot() {
  removeLegacyProfileGateDom();
  ids.forEach((id) => {
    el[id] = $(id);
  });
  applyDisplayModeClass();
  migrateLegacyTrainingBlob();
  wireCoachOnboard();

  const earlyTheme = readStoredUserTheme();
  if (earlyTheme) applyThemeChrome(earlyTheme);

  const profile = loadProfile();
  if (profile) {
    applyProfileToRuntime(profile);
    el.coachOnboard.classList.remove("open");
    el.userEyebrow.textContent = `Welcome back, ${userDisplayName}!`;
    updatePersonaHeaderIcon();
    syncCoachOnboardAria();
    syncBodyScrollLock();
    bindEvents();
    loadInitialState().then(() => {
      render();
      if (!timer) timer = setInterval(tick, 1000);
    });
  } else {
    el.coachOnboard.classList.add("open");
    syncCoachOnboardAria();
    syncBodyScrollLock();
    setTimeout(() => el.onboardNameInput?.focus(), 150);
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
