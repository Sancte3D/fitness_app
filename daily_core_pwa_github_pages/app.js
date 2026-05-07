"use strict";

/**
 * Static PWA (no React/Vite). Profile icons: PNG files in ./assets/personas/
 * (persona-*.png). Matching .svg files stay in repo as editable sources.
 * Paths are defined ONLY in PERSONA_ICON_SRC — not scraped from the DOM.
 */
const USER_NAMES = ["David", "Michalis", "Nico"];
const ACTIVE_USER_KEY = "daily-core-active-user";
const PERSONA_FALLBACK_USER = "David";

/** Relative to index.html (GitHub Pages artifact root = this folder). */
const PERSONA_ICON_SRC = {
  David: "./assets/personas/persona-david.png",
  Michalis: "./assets/personas/persona-michalis.png",
  Nico: "./assets/personas/persona-nico.png",
};

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
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
