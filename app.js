if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch { document.documentElement.hidden = true; } }
"use strict";
/* ---------- utilities ---------- */
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parseD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const today = () => iso(new Date());
const ymOf = s => s.slice(0, 7);
const dim = (y, m) => new Date(y, m + 1, 0).getDate();
const addMonthsYM = (ym, k) => { const [y, m] = ym.split("-").map(Number); const d = new Date(y, m - 1 + k, 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
const monthName = (ym, short) => { const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString(undefined, short ? { month: "short" } : { month: "long", year: "numeric" }); };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => { const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
const sum = a => a.reduce((x, y) => x + y, 0);
let _fmt = {};
function fmt(n, whole) {
  const cur = (S.settings && S.settings.currency) || "USD", k = cur + (whole ? 1 : 0);
  if (!_fmt[k]) { try { _fmt[k] = new Intl.NumberFormat(undefined, { style: "currency", currency: cur, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }); } catch { _fmt[k] = { format: x => x.toFixed(whole ? 0 : 2) }; } }
  return _fmt[k].format(Math.abs(n) < 0.005 ? 0 : n);
}
const fmtDate = (s, opt) => parseD(s).toLocaleDateString(undefined, opt || { month: "short", day: "numeric" });

const I = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.4A9 9 0 0 1 20.6 9H15z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  back: '<path d="M15 18l-6-6 6-6"/>', chev: '<path d="M9 18l6-6-6-6"/>', left: '<path d="M15 18l-6-6 6-6"/>', right: '<path d="M9 18l6-6-6-6"/>',
  camera: '<path d="M22 18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3.6"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19.5 11 3.5 3.5 0 0 1 18 18z"/>',
};
const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

const PALETTE = ["#2F8F6B", "#3B73C4", "#C2662D", "#8A5CC2", "#C2417A", "#2C9AA8", "#B38A1E", "#5E7D2F", "#7A6A58", "#D0503C", "#4C5FD0", "#2E7D9A"];
const ACCT = {
  checking: { label: "Checking", liab: false, g: "Cash" }, savings: { label: "Savings", liab: false, g: "Cash" }, cash: { label: "Cash", liab: false, g: "Cash" },
  investment: { label: "Investment", liab: false, g: "Investments" }, retirement: { label: "Retirement", liab: false, g: "Investments" }, property: { label: "Property / vehicle", liab: false, g: "Property" },
  credit: { label: "Credit card", liab: true, g: "Credit cards" }, loan: { label: "Loan", liab: true, g: "Loans" },
};
const CURRENCIES = ["USD", "CAD", "EUR", "GBP", "AUD", "NZD", "INR", "NPR", "JPY", "CNY", "SGD", "AED", "ZAR", "MXN", "BRL", "PHP"];
const FREQ = { weekly: "Weekly", biweekly: "Every 2 weeks", semimonthly: "Twice a month (15th & last day)", monthly: "Monthly" };
const PER_MONTH = { weekly: 52 / 12, biweekly: 26 / 12, semimonthly: 2, monthly: 1 };

function defaultCategories() {
  const mk = (name, group, budget, i) => ({ id: uid(), name, group, budget, color: PALETTE[i % PALETTE.length] });
  return [
    mk("Rent / Mortgage", "bills", 0, 1), mk("Utilities", "bills", 0, 5), mk("Phone & Internet", "bills", 0, 4), mk("Insurance", "bills", 0, 3), mk("Subscriptions", "bills", 0, 11),
    mk("Groceries", "everyday", 0, 0), mk("Dining out", "everyday", 0, 2), mk("Transport & Gas", "everyday", 0, 10), mk("Shopping", "everyday", 0, 7), mk("Health", "everyday", 0, 9),
    mk("Entertainment", "everyday", 0, 6), mk("Personal care", "everyday", 0, 8), mk("Gifts & Giving", "everyday", 0, 4), mk("Other", "everyday", 0, 8),
    mk("Paycheck", "income", 0, 0), mk("Other income", "income", 0, 1),
  ];
}

/* ---------- state ---------- */
const S = {
  phase: "loading", settings: null, months: {}, tab: "home", view: null, viewMonth: ymOf(today()), sheet: null,
  search: "", confirm: null, ob: null, plan: "goals",
  ai: null, aiImages: false, insights: null, insightsBusy: false, qa: { q: "", a: "", busy: false }, dl: null,
};


/* ---------- data validation (protects against tampered backups or storage) ---------- */
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/, COLOR_RE = /^#[0-9A-Fa-f]{6}$/, DATE_RE = /^\d{4}-\d{2}-\d{2}$/, YM_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const str = (v, max) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);
const fin = (v, min = -1e12, max = 1e12) => { const n = Number(v); return isFinite(n) ? Math.min(max, Math.max(min, n)) : 0; };
const okId = v => (typeof v === "string" && ID_RE.test(v) ? v : null);
function cleanSettings(x) {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const arr = v => (Array.isArray(v) ? v.slice(0, 500) : []);
  const pay = x.pay && typeof x.pay === "object" ? x.pay : {};
  const debt = x.debt && typeof x.debt === "object" ? x.debt : {};
  return {
    v: 1, sample: !!x.sample, name: str(x.name, 60),
    currency: CURRENCIES.includes(x.currency) ? x.currency : "USD",
    pay: { freq: FREQ[pay.freq] ? pay.freq : "biweekly", next: DATE_RE.test(pay.next) ? pay.next : "", amount: fin(pay.amount, 0, 1e9) },
    accounts: arr(x.accounts).map(a => a && okId(a.id) ? { id: a.id, name: str(a.name, 60) || "Account", type: ACCT[a.type] ? a.type : "checking", opening: fin(a.opening), apr: fin(a.apr, 0, 100), minPay: fin(a.minPay, 0, 1e9) } : null).filter(Boolean),
    categories: arr(x.categories).map(c => c && okId(c.id) ? { id: c.id, name: str(c.name, 40) || "Category", group: ["bills", "everyday", "income"].includes(c.group) ? c.group : "everyday", budget: fin(c.budget, 0, 1e9), color: COLOR_RE.test(c.color) ? c.color : PALETTE[0] } : null).filter(Boolean),
    goals: arr(x.goals).map(g => g && okId(g.id) ? { id: g.id, name: str(g.name, 60) || "Goal", target: fin(g.target, 0, 1e12), saved: fin(g.saved, 0, 1e12), date: DATE_RE.test(g.date) ? g.date : "" } : null).filter(Boolean),
    debt: { extra: fin(debt.extra, 0, 1e7), strategy: debt.strategy === "snowball" ? "snowball" : "avalanche" },
    createdAt: fin(x.createdAt, 0, 1e14), updatedAt: fin(x.updatedAt, 0, 1e14),
  };
}
function cleanMonths(m) {
  const out = {}; if (!m || typeof m !== "object" || Array.isArray(m)) return out;
  for (const [ym, list] of Object.entries(m).slice(0, 2400)) {
    if (!YM_RE.test(ym) || !Array.isArray(list)) continue;
    const txs = list.slice(0, 5000).map(t => t && okId(t.id) && DATE_RE.test(t.date) && ymOf(t.date) === ym && ["expense", "income", "transfer"].includes(t.type) ? {
      id: t.id, date: t.date, type: t.type, amount: Math.abs(fin(t.amount, -1e10, 1e10)), desc: str(t.desc, 80),
      cat: okId(t.cat), acct: okId(t.acct) || "", to: okId(t.to), ts: fin(t.ts, 0, 1e14),
    } : null).filter(Boolean);
    if (txs.length) out[ym] = txs;
  }
  return out;
}

/* ---------- storage ---------- */
const LKEY = "mymoney.v1";
const NATIVE = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() ? window.Capacitor.Plugins : null;
const Store = {
  mode: "local", sb: null, user: null, dirty: { settings: false, months: new Set() }, syncing: false,
  key() { return this.mode === "cloud" && this.user ? LKEY + ":" + this.user.id : LKEY; },
  saveLocal() { S.rev = (S.rev || 0) + 1; try { localStorage.setItem(this.key(), JSON.stringify({ settings: S.settings, months: S.months })); } catch { } },
  async loadLocal() { S.settings = null; S.months = {}; try { const d = JSON.parse(localStorage.getItem(this.key()) || "null"); if (d) { S.settings = cleanSettings(d.settings); S.months = cleanMonths(d.months); } } catch { } },
  saveDirty() { try { localStorage.setItem(this.key() + ":dirty", JSON.stringify({ s: this.dirty.settings, m: [...this.dirty.months] })); } catch { } },
  loadDirty() { this.dirty = { settings: false, months: new Set() }; try { const d = JSON.parse(localStorage.getItem(this.key() + ":dirty") || "null"); if (d) { this.dirty.settings = !!d.s; this.dirty.months = new Set(d.m || []); } } catch { } },
  hasDirty() { return this.dirty.settings || this.dirty.months.size > 0; },
  async pull() {
    const uid = this.user.id;
    const [a, b] = await Promise.all([
      this.sb.from("user_data").select("settings").eq("user_id", uid).maybeSingle(),
      this.sb.from("month_data").select("ym,txs").eq("user_id", uid),
    ]);
    if (a.error) throw a.error; if (b.error) throw b.error;
    const months = {}; for (const r of b.data || []) if (r.txs && r.txs.length) months[r.ym] = r.txs;
    return { settings: a.data ? cleanSettings(a.data.settings) : null, months: cleanMonths(months) };
  },
  async flush() {
    if (this.mode !== "cloud" || !this.user) return;
    if (navigator.onLine === false) throw new Error("offline");
    const uid = this.user.id, now = new Date().toISOString();
    if (this.dirty.settings) {
      if (S.settings) { const { error } = await this.sb.from("user_data").upsert({ user_id: uid, settings: S.settings, updated_at: now }); if (error) throw error; }
      this.dirty.settings = false; this.saveDirty();
    }
    for (const ym of [...this.dirty.months]) {
      const txs = S.months[ym] || [];
      const { error } = txs.length
        ? await this.sb.from("month_data").upsert({ user_id: uid, ym, txs, updated_at: now })
        : await this.sb.from("month_data").delete().eq("user_id", uid).eq("ym", ym);
      if (error) throw error;
      this.dirty.months.delete(ym); this.saveDirty();
    }
  },
  async push() {
    try { await this.flush(); if (S.syncErr) { S.syncErr = false; render(); } }
    catch { if (!S.syncErr) { S.syncErr = true; render(); toast("Saved on this device. It will sync when you're back online."); } }
  },
  async sync() {
    if (this.mode !== "cloud" || !this.user || this.syncing) return;
    this.syncing = true;
    try {
      await this.flush(); const rev = S.rev; const d = await this.pull();
      if (S.rev === rev && !this.hasDirty() && d.settings) { S.settings = d.settings; S.months = d.months; _fmt = {}; this.saveLocal(); if (!S.sheet) render(); }
      if (S.syncErr) { S.syncErr = false; render(); }
    } catch { if (!S.syncErr) { S.syncErr = true; render(); } }
    this.syncing = false;
  },
  async saveSettings() { S.settings.updatedAt = Date.now(); this.saveLocal(); if (this.mode === "cloud") { this.dirty.settings = true; this.saveDirty(); await this.push(); } },
  async saveMonth(ym) { if (!(S.months[ym] || []).length) delete S.months[ym]; this.saveLocal(); if (this.mode === "cloud") { this.dirty.months.add(ym); this.saveDirty(); await this.push(); } },
  async saveAll() {
    this.saveLocal();
    if (this.mode === "cloud") { this.dirty.settings = true; Object.keys(S.months).forEach(ym => this.dirty.months.add(ym)); this.saveDirty(); await this.push(); }
  },
  async wipe() {
    if (this.mode === "cloud" && this.user) {
      const uid = this.user.id;
      const a = await this.sb.from("month_data").delete().eq("user_id", uid);
      const b = await this.sb.from("user_data").delete().eq("user_id", uid);
      if (a.error || b.error) { toast("Couldn't delete your data. Check your connection and try again."); return false; }
      this.dirty = { settings: false, months: new Set() }; this.saveDirty();
    }
    try { localStorage.removeItem(this.key()); } catch { }
    S.settings = null; S.months = {}; return true;
  },
};


/* ---------- derived data ---------- */
const accounts = () => (S.settings && S.settings.accounts) || [];
const cats = () => (S.settings && S.settings.categories) || [];
const catById = id => cats().find(c => c.id === id);
const acctById = id => accounts().find(a => a.id === id);
const isLiab = a => a && ACCT[a.type] && ACCT[a.type].liab;
const allTx = () => Object.values(S.months).flat();
const monthTx = ym => (S.months[ym] || []).slice().sort((a, b) => b.date.localeCompare(a.date) || (b.ts || 0) - (a.ts || 0));

function balances(upTo) {
  const b = {}; for (const a of accounts()) b[a.id] = a.opening || 0;
  const eff = (id, amt, inflow) => { const a = acctById(id); if (!a) return; b[id] += isLiab(a) ? (inflow ? -amt : amt) : (inflow ? amt : -amt); };
  for (const t of allTx()) {
    if (upTo && t.date > upTo) continue;
    if (t.type === "expense") eff(t.acct, t.amount, false);
    else if (t.type === "income") eff(t.acct, t.amount, true);
    else if (t.type === "transfer") { eff(t.acct, t.amount, false); eff(t.to, t.amount, true); }
  }
  return b;
}
function worth(upTo) {
  const b = balances(upTo); let assets = 0, debts = 0;
  for (const a of accounts()) { if (isLiab(a)) debts += b[a.id]; else assets += b[a.id]; }
  return { assets, debts, net: assets - debts, b };
}
function monthStats(ym) {
  const tx = S.months[ym] || []; const byCat = {};
  let income = 0, spent = 0;
  for (const t of tx) {
    if (t.type === "expense") { spent += t.amount; byCat[t.cat] = (byCat[t.cat] || 0) + t.amount; }
    else if (t.type === "income") income += t.amount;
  }
  return { income, spent, net: income - spent, byCat };
}
function payInfo() {
  const p = S.settings && S.settings.pay; if (!p || !p.next) return null;
  const t = parseD(today()); let d = parseD(p.next);
  if (p.freq === "weekly" || p.freq === "biweekly") { const step = p.freq === "weekly" ? 7 : 14; while (d < t) d.setDate(d.getDate() + step); }
  else if (p.freq === "monthly") { const day = d.getDate(); let y = d.getFullYear(), m = d.getMonth(); while (d < t) { m++; d = new Date(y, m, Math.min(day, dim(y, m))); } }
  else { const y = t.getFullYear(), m = t.getMonth(); const c = [new Date(y, m, 15), new Date(y, m, dim(y, m)), new Date(y, m + 1, 15)]; d = c.find(x => x >= t); }
  const days = Math.round((d - t) / 864e5);
  return { date: iso(d), days, amount: p.amount || 0, perMonth: (p.amount || 0) * (PER_MONTH[p.freq] || 1) };
}
function budgetTotals(ym) {
  const st = monthStats(ym); const g = { bills: { b: 0, s: 0 }, everyday: { b: 0, s: 0 } };
  for (const c of cats()) { if (!g[c.group]) continue; g[c.group].b += c.budget || 0; g[c.group].s += st.byCat[c.id] || 0; }
  const uncategorized = sum(Object.entries(st.byCat).filter(([k]) => !catById(k) || catById(k).group === "income").map(([, v]) => v));
  g.everyday.s += uncategorized;
  return { st, g, budget: g.bills.b + g.everyday.b, spent: st.spent };
}
function safeToSpend() {
  const ym = ymOf(today()); const t = budgetTotals(ym);
  const n = new Date(); const daysLeft = dim(n.getFullYear(), n.getMonth()) - n.getDate() + 1;
  const left = t.g.everyday.b - t.g.everyday.s;
  return { has: t.g.everyday.b > 0, left, daysLeft, perDay: Math.max(0, left) / daysLeft };
}
function simulate(debts, extra, strategy) {
  const ds = debts.map(d => ({ ...d })); let month = 0, totalInt = 0; const paidOff = {};
  const budget = sum(ds.map(d => d.min)) + extra;
  while (ds.some(d => d.bal > 0.005) && month < 600) {
    month++;
    for (const d of ds) if (d.bal > 0.005) { const i = d.bal * (d.apr / 100) / 12; d.bal += i; totalInt += i; }
    let avail = budget;
    for (const d of ds) if (d.bal > 0.005) { const p = Math.min(d.min, d.bal, avail); d.bal -= p; avail -= p; }
    const order = ds.filter(d => d.bal > 0.005).sort(strategy === "avalanche" ? (a, b) => b.apr - a.apr || a.bal - b.bal : (a, b) => a.bal - b.bal || b.apr - a.apr);
    for (const d of order) { if (avail <= 0.005) break; const p = Math.min(d.bal, avail); d.bal -= p; avail -= p; }
    for (const d of ds) if (d.bal <= 0.005 && !paidOff[d.id]) paidOff[d.id] = month;
  }
  return { months: month, totalInt, paidOff, stuck: month >= 600 };
}
const monthsLater = k => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + k); return d.toLocaleDateString(undefined, { month: "short", year: "numeric" }); };

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  let el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2800);
}

/* ---------- render: shell ---------- */
function render() {
  const app = $("#app");
  if (S.phase === "auth") { app.innerHTML = renderAuth(); const f = app.querySelector("[autofocus]"); if (f) f.focus(); return; }
  if (S.phase === "offline") { app.innerHTML = `<div class="wrap ob"><a class="brand" href="./"><img src="logo.svg" alt="" width="30" height="30">My Money</a><h2>You're offline</h2><p>Connect to the internet to load your account for the first time on this device.</p><button class="btn block" data-act="retry">Try again</button><button class="btn ghost block" data-act="sign-out">Sign out</button></div>`; return; }
  if (S.phase === "loading") { app.innerHTML = `<div class="wrap ob"><a class="brand" href="./"><img src="logo.svg" alt="" width="30" height="30">My Money</a><p>Opening your money…</p></div>`; return; }
  if (!S.settings) { app.innerHTML = renderOnboarding(); return; }
  const v = S.view || S.tab;
  const titles = { home: greeting(), activity: "Activity", budget: "Budget", plan: "Plan", accounts: "Accounts" };
  const sub = { home: new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) + (Store.mode === "cloud" && S.syncErr ? `<span class="sync-dot"></span>Not synced yet` : "") };
  const left = S.view ? `<button class="icon-btn" data-act="back" aria-label="Back">${icon("back")}</button>` : "";
  const right = v === "home" ? `<button class="icon-btn" data-act="settings" aria-label="Settings">${icon("gear")}</button>`
    : v === "accounts" ? `<button class="icon-btn" data-act="new-acct" aria-label="Add account">${icon("plus")}</button>` : "";
  const body = { home: viewHome, activity: viewActivity, budget: viewBudget, plan: viewPlan, accounts: viewAccounts }[v]();
  const tab = (k, ic, label) => `<button class="tab ${S.tab === k && !S.view ? "on" : ""}" data-act="tab" data-v="${k}">${icon(ic)}<span>${label}</span></button>`;
  app.innerHTML = `
  <header class="top"><div class="wrap">${left}<div style="flex:1;min-width:0"><h1>${esc(titles[v])}</h1>${sub[v] ? `<div class="sub">${sub[v]}</div>` : ""}</div>${right}</div></header>
  <main class="wrap">${body}</main>
  <nav class="tabs" aria-label="Main"><div class="wrap">
    ${tab("home", "home", "Home")}${tab("activity", "list", "Activity")}
    <button class="tab add" data-act="add-tx" aria-label="Add transaction"><span class="fab">${icon("plus")}</span></button>
    ${tab("budget", "pie", "Budget")}${tab("plan", "target", "Plan")}
  </div></nav>`;
}
function greeting() {
  const h = new Date().getHours(); const n = S.settings.name ? ", " + S.settings.name.split(" ")[0] : "";
  return (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + n;
}

/* ---------- views ---------- */
function txRow(t) {
  const c = catById(t.cat), a = acctById(t.acct), to = acctById(t.to);
  const color = t.type === "transfer" ? "#6B7C76" : (c ? c.color : "#7A6A58");
  const letter = t.type === "transfer" ? "⇄" : esc((c ? c.name : t.type === "income" ? "Income" : "?").charAt(0));
  const title = t.desc || (t.type === "transfer" ? "Transfer" : c ? c.name : "Uncategorized");
  const sub = t.type === "transfer" ? `${esc(a ? a.name : "?")} → ${esc(to ? to.name : "?")}` : `${esc(c ? c.name : "Uncategorized")} · ${esc(a ? a.name : "No account")}`;
  const amt = t.type === "income" ? `<span class="amt pos">+${fmt(t.amount)}</span>` : t.type === "transfer" ? `<span class="amt muted">${fmt(t.amount)}</span>` : `<span class="amt">−${fmt(t.amount)}</span>`;
  return `<button class="li" data-act="edit-tx" data-id="${t.id}"><span class="dot" style="background:${color}">${letter}</span><span class="grow"><div class="t">${esc(title)}</div><div class="d">${sub}</div></span>${amt}</button>`;
}
function statusFor(spent, budget) {
  if (budget <= 0) return spent > 0 ? ["neutral", "No budget"] : ["neutral", "—"];
  const r = spent / budget; return r > 1.005 ? ["bad", "Over"] : r >= 0.995 ? ["good", "At budget"] : r > 0.85 ? ["warn", "Near limit"] : ["good", "On track"];
}

function viewHome() {
  const s = safeToSpend(), p = payInfo(), ym = ymOf(today()), st = monthStats(ym), lm = monthStats(addMonthsYM(ym, -1)), w = worth();
  const cashIds = accounts().filter(a => ACCT[a.type] && ACCT[a.type].g === "Cash").map(a => a.id);
  const cash = sum(cashIds.map(id => w.b[id] || 0));
  const mName = monthName(ym, true);
  let out = "";
  if (S.settings.sample) out += `<div class="banner"><span>You're exploring sample data.</span><button class="link" data-act="start-fresh">Start fresh</button></div>`;
  out += `<section class="hero">
    <div class="label">Safe to spend today</div>
    <div class="big num">${s.has ? fmt(s.perDay, true) : "—"}</div>
    <div class="meta">${s.has ? (s.left >= 0 ? `<b class="num">${fmt(s.left, true)}</b> left in everyday budgets · ${s.daysLeft} day${s.daysLeft === 1 ? "" : "s"} left in ${mName}` : `Everyday spending is <b class="num">${fmt(-s.left, true)}</b> over budget this month`) : `Set everyday budgets to see a daily spending number.`}</div>
    <div class="hero-strip">
      ${p ? `<span class="chip-h">Payday ${p.days === 0 ? "<b>today</b>" : `in <b>${p.days} day${p.days === 1 ? "" : "s"}</b>`} · ${fmtDate(p.date)}</span>` : ""}
      <span class="chip-h">Cash <b class="num">${fmt(cash, true)}</b></span>
    </div>
  </section>`;
  out += `<div class="grid2">
    <div class="card stat"><div class="label">Spent in ${mName}</div><div class="v num">${fmt(st.spent, true)}</div><div class="s">${lm.spent ? (st.spent <= lm.spent ? `${fmt(lm.spent - st.spent, true)} less than last month so far` : `${fmt(st.spent - lm.spent, true)} more than all of last month`) : "This month so far"}</div></div>
    <div class="card stat"><div class="label">Income in ${mName}</div><div class="v num">${fmt(st.income, true)}</div><div class="s">Net ${st.net >= 0 ? "+" : "−"}${fmt(Math.abs(st.net), true)}</div></div>
  </div>`;
  out += `<section class="card"><div class="between"><h2>Spending pace</h2><div class="legend"><span><i style="background:var(--accent)"></i>${mName}</span><span><i style="background:var(--muted);opacity:.5"></i>${monthName(addMonthsYM(ym, -1), true)}</span></div></div>${paceChart(ym)}</section>`;
  out += aiCard();
  // budget watch
  const watch = cats().filter(c => c.group !== "income").map(c => ({ c, s: st.byCat[c.id] || 0 })).filter(x => x.s > 0 || x.c.budget > 0)
    .sort((a, b) => (b.c.budget ? b.s / b.c.budget : b.s / 1e9) - (a.c.budget ? a.s / a.c.budget : a.s / 1e9)).slice(0, 4);
  out += `<section class="card"><div class="between"><h2>Budget watch</h2><button class="link" data-act="tab" data-v="budget">See all</button></div>
    ${watch.length ? `<div class="list" style="margin-top:6px">${watch.map(({ c, s }) => budgetRow(c, s)).join("")}</div>` : `<div class="empty"><b>No budgets yet</b>Set monthly amounts on the Budget tab.</div>`}</section>`;
  out += `<button class="card" data-act="open-accounts" style="text-align:left;width:100%">
    <div class="between"><h2>Net worth</h2><span class="muted">${icon("chev").replace('class="i"', 'class="i" style="width:18px;height:18px"')}</span></div>
    <div class="stat"><div class="v num" style="font-size:28px">${w.net < 0 ? "−" : ""}${fmt(Math.abs(w.net), true)}</div></div>
    <div class="row small muted" style="gap:16px;margin-top:2px"><span>Assets <b class="num" style="color:var(--ink)">${fmt(w.assets, true)}</b></span><span>Debts <b class="num" style="color:var(--ink)">${fmt(w.debts, true)}</b></span></div>
  </button>`;
  const recent = allTx().sort((a, b) => b.date.localeCompare(a.date) || (b.ts || 0) - (a.ts || 0)).slice(0, 5);
  out += `<section class="card"><div class="between"><h2>Recent</h2><button class="link" data-act="tab" data-v="activity">See all</button></div>
    ${recent.length ? `<div class="list" style="margin-top:4px">${recent.map(txRow).join("")}</div>` : `<div class="empty"><b>No transactions yet</b>Tap + to add your first one, or scan a receipt.</div>`}</section>`;
  return out;
}

function paceChart(ym) {
  const W = 340, H = 130, L = 8, R = 8, T = 14, B = 20;
  const [y, m] = ym.split("-").map(Number); const days = dim(y, m - 1);
  const pm = addMonthsYM(ym, -1); const [py, pmm] = pm.split("-").map(Number); const pdays = dim(py, pmm - 1);
  const cum = (key, n, lim) => { const d = new Array(n + 1).fill(0); for (const t of S.months[key] || []) if (t.type === "expense") { const dd = +t.date.slice(8); if (dd <= n) d[dd] += t.amount; } const out = []; let c = 0; for (let i = 1; i <= Math.min(n, lim); i++) { c += d[i]; out.push(c); } return out; };
  const isCur = ym === ymOf(today()); const tday = isCur ? new Date().getDate() : days;
  const cur = cum(ym, days, tday), prev = cum(pm, pdays, pdays);
  const max = Math.max(1, ...cur, ...prev);
  const X = i => L + (i / (Math.max(days, pdays) - 1)) * (W - L - R), Y = v => T + (1 - v / max) * (H - T - B);
  const path = a => a.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  if (!cur.length && !prev.length) return "";
  const last = cur.length - 1;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative spending this month compared with last month">
    <line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--line)"/>
    <line x1="${L}" x2="${W - R}" y1="${Y(max / 2)}" y2="${Y(max / 2)}" stroke="var(--line)" stroke-dasharray="3 4"/>
    <text x="${W - R}" y="${Y(max) - 3}" text-anchor="end">${fmt(max, true)}</text>
    ${prev.length ? `<path d="${path(prev)}" fill="none" stroke="var(--muted)" stroke-opacity=".5" stroke-width="2"/>` : ""}
    ${cur.length ? `<path d="${path(cur)} L${X(last)} ${Y(0)} L${X(0)} ${Y(0)}Z" fill="var(--accent)" fill-opacity=".12"/><path d="${path(cur)}" fill="none" stroke="var(--accent)" stroke-width="2.5"/><circle cx="${X(last)}" cy="${Y(cur[last])}" r="4" fill="var(--accent)"/>` : ""}
    <text x="${L}" y="${H - 5}">Day 1</text><text x="${W - R}" y="${H - 5}" text-anchor="end">Day ${Math.max(days, pdays)}</text>
  </svg>`;
}

function budgetRow(c, s) {
  const b = c.budget || 0, [cls, lab] = statusFor(s, b), pct = b ? Math.min(100, s / b * 100) : 0;
  return `<button class="li" data-act="edit-cat" data-id="${c.id}" style="flex-direction:column;align-items:stretch;gap:7px">
    <div class="row"><span class="chip" style="border:0;padding:0;background:none"><i style="background:${c.color}"></i></span><span class="grow t">${esc(c.name)}</span><span class="pill ${cls}">${lab}</span></div>
    <div class="bar"><i class="${cls === "bad" ? "bad" : cls === "warn" ? "warn" : ""}" style="width:${pct}%"></i></div>
    <div class="between small muted num"><span>${fmt(s)} spent</span><span>${b ? (b - s >= 0 ? fmt(b - s) + " left of " + fmt(b, true) : fmt(s - b) + " over " + fmt(b, true)) : "Tap to set a budget"}</span></div>
  </button>`;
}

function monthSwitcher() {
  return `<div class="month-sw"><button class="icon-btn" data-act="month" data-d="-1" aria-label="Previous month">${icon("left")}</button><span class="m">${monthName(S.viewMonth)}</span><button class="icon-btn" data-act="month" data-d="1" aria-label="Next month">${icon("right")}</button></div>`;
}

function viewActivity() {
  const ym = S.viewMonth; const st = monthStats(ym);
  const q = S.search.trim().toLowerCase();
  let tx = monthTx(ym);
  if (q) tx = tx.filter(t => [t.desc, (catById(t.cat) || {}).name, (acctById(t.acct) || {}).name, String(t.amount)].join(" ").toLowerCase().includes(q));
  let out = monthSwitcher();
  out += `<div class="grid2"><div class="card stat"><div class="label">Spent</div><div class="v num">${fmt(st.spent, true)}</div></div><div class="card stat"><div class="label">Income</div><div class="v num">${fmt(st.income, true)}</div></div></div>`;
  out += `<label class="row card" style="padding:4px 12px;gap:8px"><span class="muted" style="width:18px">${icon("search")}</span><input id="search" class="inp" style="border:0;padding:10px 0;background:none" placeholder="Search transactions" value="${esc(S.search)}" autocomplete="off"></label>`;
  if (!tx.length) return out + `<div class="card empty"><b>${q ? "No matches" : "Nothing logged for " + monthName(ym, true)}</b>${q ? "Try another word." : "Tap + to add a transaction."}</div>`;
  const groups = {}; for (const t of tx) (groups[t.date] = groups[t.date] || []).push(t);
  out += `<section class="card" style="padding-top:2px">${Object.entries(groups).map(([d, ts]) => {
    const dayNet = sum(ts.map(t => t.type === "expense" ? -t.amount : t.type === "income" ? t.amount : 0));
    return `<div class="day-h"><span>${fmtDate(d, { weekday: "short", month: "short", day: "numeric" })}</span><span class="num">${dayNet ? (dayNet > 0 ? "+" : "−") + fmt(Math.abs(dayNet)) : ""}</span></div><div class="list">${ts.map(txRow).join("")}</div>`;
  }).join("")}</section>`;
  return out;
}

function viewBudget() {
  const ym = S.viewMonth, t = budgetTotals(ym), p = payInfo();
  const plannedIncome = p ? p.perMonth : 0;
  const pct = t.budget ? Math.min(100, t.spent / t.budget * 100) : 0;
  const [cls] = statusFor(t.spent, t.budget);
  let out = monthSwitcher();
  out += `<section class="card"><div class="label">Spent of budget</div>
    <div class="row" style="align-items:baseline;gap:8px;margin:4px 0 10px"><span class="num" style="font-family:var(--f-display);font-size:28px;font-weight:700">${fmt(t.spent, true)}</span><span class="muted num">of ${fmt(t.budget, true)}</span></div>
    <div class="bar"><i class="${cls === "bad" ? "bad" : cls === "warn" ? "warn" : ""}" style="width:${pct}%"></i></div>
    ${plannedIncome ? `<div class="between small" style="margin-top:12px"><span class="muted">Expected monthly income</span><b class="num">${fmt(plannedIncome, true)}</b></div>
    <div class="between small"><span class="muted">${plannedIncome - t.budget >= 0 ? "Left to assign (savings, debt, goals)" : "Budgets exceed income by"}</span><b class="num" style="color:${plannedIncome - t.budget >= 0 ? "var(--good)" : "var(--bad)"}">${fmt(Math.abs(plannedIncome - t.budget), true)}</b></div>` : ""}
  </section>`;
  for (const [g, title] of [["bills", "Bills"], ["everyday", "Everyday spending"]]) {
    const list = cats().filter(c => c.group === g);
    out += `<section class="card"><div class="between"><h2>${title}</h2><span class="small muted num">${fmt(t.g[g].s, true)} / ${fmt(t.g[g].b, true)}</span></div>
      <div class="list" style="margin-top:6px">${list.map(c => budgetRow(c, t.st.byCat[c.id] || 0)).join("") || `<div class="empty">No categories</div>`}</div></section>`;
  }
  const inc = cats().filter(c => c.group === "income");
  out += `<section class="card"><div class="between"><h2>Income</h2><span class="small muted num">${fmt(t.st.income, true)} received</span></div>
    <div class="list" style="margin-top:4px">${inc.map(c => { const v = sum((S.months[ym] || []).filter(x => x.type === "income" && x.cat === c.id).map(x => x.amount)); return `<button class="li" data-act="edit-cat" data-id="${c.id}"><span class="chip" style="border:0;padding:0;background:none"><i style="background:${c.color}"></i></span><span class="grow t">${esc(c.name)}</span><span class="amt pos num">${fmt(v)}</span></button>`; }).join("")}</div></section>`;
  out += `<button class="btn ghost block" data-act="new-cat">Add a category</button>`;
  return out;
}

function viewPlan() {
  let out = `<div class="seg" role="tablist"><button class="${S.plan === "goals" ? "on" : ""}" data-act="plan" data-v="goals">Goals</button><button class="${S.plan === "debt" ? "on" : ""}" data-act="plan" data-v="debt">Debt payoff</button></div>`;
  return out + (S.plan === "goals" ? viewGoals() : viewDebt());
}
function viewGoals() {
  const goals = S.settings.goals || [];
  if (!goals.length) return `<div class="card empty"><b>Save for what matters</b>Create a goal like an emergency fund, a trip or a down payment, and track progress toward it.<div style="margin-top:14px"><button class="btn" data-act="new-goal">Create a goal</button></div></div>`;
  const nowYM = ymOf(today());
  let out = goals.map(g => {
    const pct = g.target ? Math.min(100, g.saved / g.target * 100) : 0; const left = Math.max(0, g.target - g.saved);
    let need = "";
    if (g.date && left > 0) { const [y, m] = g.date.split("-").map(Number); const [cy, cm] = nowYM.split("-").map(Number); const months = Math.max(1, (y - cy) * 12 + (m - cm)); need = `${fmt(left / months, true)}/month to reach it by ${fmtDate(g.date, { month: "short", year: "numeric" })}`; }
    return `<button class="card" data-act="edit-goal" data-id="${g.id}" style="text-align:left;width:100%;display:flex;flex-direction:column;gap:8px">
      <div class="between"><h2>${esc(g.name)}</h2><span class="pill ${left <= 0 ? "good" : "neutral"}">${left <= 0 ? "Reached" : Math.round(pct) + "%"}</span></div>
      <div class="row" style="align-items:baseline;gap:6px"><span class="num" style="font-family:var(--f-display);font-size:24px;font-weight:700">${fmt(g.saved, true)}</span><span class="muted num">of ${fmt(g.target, true)}</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="small muted">${left <= 0 ? "Goal reached." : need || fmt(left, true) + " to go"}</div></button>`;
  }).join("");
  return out + `<button class="btn ghost block" data-act="new-goal">Add a goal</button>`;
}
function viewDebt() {
  const w = worth();
  const debts = accounts().filter(isLiab).map(a => ({ id: a.id, name: a.name, bal: Math.max(0, w.b[a.id] || 0), apr: a.apr || 0, min: a.minPay || 0 })).filter(d => d.bal > 0.005);
  if (!debts.length) return `<div class="card empty"><b>No debts to pay off</b>Add credit cards or loans under Accounts to build a payoff plan.<div style="margin-top:14px"><button class="btn" data-act="open-accounts">Open accounts</button></div></div>`;
  const d = S.settings.debt || { extra: 100, strategy: "avalanche" };
  const plan = simulate(debts, d.extra, d.strategy), base = simulate(debts, 0, d.strategy);
  const total = sum(debts.map(x => x.bal)), minTotal = sum(debts.map(x => x.min));
  let out = `<section class="hero"><div class="label">Debt-free by</div><div class="big">${plan.stuck ? "Not on track" : monthsLater(plan.months)}</div>
    <div class="meta">${plan.stuck ? "Payments don't cover interest. Raise minimums or add extra." : `<b class="num">${fmt(total, true)}</b> across ${debts.length} debt${debts.length > 1 ? "s" : ""} · ${plan.months} months · <b class="num">${fmt(plan.totalInt, true)}</b> interest`}</div>
    ${!plan.stuck && !base.stuck && d.extra > 0 ? `<div class="hero-strip"><span class="chip-h">Extra payments save <b class="num">${fmt(base.totalInt - plan.totalInt, true)}</b> and ${base.months - plan.months} months</span></div>` : ""}</section>`;
  out += `<section class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="seg"><button class="${d.strategy === "avalanche" ? "on" : ""}" data-act="strategy" data-v="avalanche">Highest interest first</button><button class="${d.strategy === "snowball" ? "on" : ""}" data-act="strategy" data-v="snowball">Smallest balance first</button></div>
    <label class="field"><span>Extra paid toward debt each month, on top of ${fmt(minTotal, true)} in minimums</span>
      <div class="row"><input type="range" id="extra-range" min="0" max="${Math.max(2000, Math.ceil(d.extra / 500) * 500)}" step="25" value="${d.extra}" style="flex:1;accent-color:var(--accent)"><input id="extra-num" class="inp num" inputmode="decimal" style="width:110px" value="${d.extra}"></div></label>
  </section>`;
  const order = debts.slice().sort((a, b) => (plan.paidOff[a.id] || 999) - (plan.paidOff[b.id] || 999));
  out += `<section class="card"><h2>Payoff order</h2><div class="list" style="margin-top:4px">${order.map((x, i) => `<button class="li" data-act="edit-acct" data-id="${x.id}"><span class="dot" style="background:var(--accent);color:var(--accent-ink)">${i + 1}</span><span class="grow"><div class="t">${esc(x.name)}</div><div class="d num">${x.apr}% APR · ${fmt(x.min, true)} min</div></span><span style="text-align:right"><div class="amt num">${fmt(x.bal, true)}</div><div class="d">${plan.paidOff[x.id] ? "Paid off " + monthsLater(plan.paidOff[x.id]) : "Not paid off"}</div></span></button>`).join("")}</div>
  <p class="small muted" style="margin:10px 0 0">Estimates assume fixed APRs and no new charges. Edit a debt to update its APR or minimum payment.</p></section>`;
  return out;
}

function viewAccounts() {
  const w = worth();
  let out = `<section class="card"><div class="label">Net worth</div><div class="num" style="font-family:var(--f-display);font-size:32px;font-weight:700;margin:2px 0 6px">${w.net < 0 ? "−" : ""}${fmt(Math.abs(w.net), true)}</div>${worthChart()}</section>`;
  const groups = {};
  for (const a of accounts()) { const g = (ACCT[a.type] || ACCT.checking).g; (groups[g] = groups[g] || []).push(a); }
  for (const g of ["Cash", "Investments", "Property", "Credit cards", "Loans"]) {
    if (!groups[g]) continue;
    const tot = sum(groups[g].map(a => w.b[a.id]));
    out += `<section class="card"><div class="between"><h2>${g}</h2><span class="num small muted">${fmt(tot, true)}</span></div><div class="list" style="margin-top:4px">
      ${groups[g].map(a => `<button class="li" data-act="edit-acct" data-id="${a.id}"><span class="grow"><div class="t">${esc(a.name)}</div><div class="d">${ACCT[a.type].label}${isLiab(a) && a.apr ? " · " + a.apr + "% APR" : ""}</div></span><span class="amt num">${fmt(w.b[a.id])}</span></button>`).join("")}</div></section>`;
  }
  if (!accounts().length) out += `<div class="card empty"><b>No accounts yet</b>Add your bank accounts, cards and loans.</div>`;
  return out + `<button class="btn ghost block" data-act="new-acct">Add an account</button>`;
}
function worthChart() {
  const ym = ymOf(today()); const pts = [];
  for (let k = -5; k <= 0; k++) { const m = addMonthsYM(ym, k); const [y, mm] = m.split("-").map(Number); const end = k === 0 ? today() : m + "-" + pad(dim(y, mm - 1)); pts.push({ m, v: worth(end).net }); }
  const W = 340, H = 120, L = 10, R = 10, T = 16, B = 20;
  const vals = pts.map(p => p.v); let mn = Math.min(...vals), mx = Math.max(...vals); if (mx - mn < 1) { mx += 1; mn -= 1; }
  const pad2 = (mx - mn) * .15; mn -= pad2; mx += pad2;
  const X = i => L + i * (W - L - R) / (pts.length - 1), Y = v => T + (1 - (v - mn) / (mx - mn)) * (H - T - B);
  const line = pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Net worth over the last six months">
    <path d="${line} L${X(pts.length - 1)} ${H - B} L${X(0)} ${H - B}Z" fill="var(--accent)" fill-opacity=".1"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
    ${pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.v)}" r="${i === pts.length - 1 ? 4.5 : 2.5}" fill="var(--accent)"/><text x="${X(i)}" y="${H - 5}" text-anchor="middle">${monthName(p.m, true)}</text>`).join("")}
  </svg><p class="small muted" style="margin:6px 0 0">Built from the transactions you log. Update balances on an account to correct drift.</p>`;
}

/* ---------- AI card ---------- */
function aiCard() {
  if (!S.ai) return "";
  const ins = S.insights;
  return `<section class="card ai-card" style="display:flex;flex-direction:column;gap:10px">
    <div class="between"><span class="ai-tag">${icon("spark")} Insights by Claude</span>${ins ? `<button class="link" data-act="insights">Refresh</button>` : ""}</div>
    ${ins ? `<div>${ins.map(x => `<div class="insight"><b>${esc(x.title)}</b><span class="small">${esc(x.detail)}</span></div>`).join("")}</div>`
      : `<p style="margin:0" class="small muted">Get a quick read on your spending, budgets, debts and goals, with specific ideas for this month.</p>
         <button class="btn" data-act="insights" ${S.insightsBusy ? "disabled" : ""}>${S.insightsBusy ? "Reading your numbers…" : "Get insights"}</button>`}
    <form id="qa-form" class="row" style="gap:8px"><input id="qa-q" class="inp" placeholder="Ask about your money" value="${esc(S.qa.q)}" autocomplete="off"><button class="btn" ${S.qa.busy ? "disabled" : ""}>Ask</button></form>
    ${S.qa.a ? `<div class="answer" id="qa-a"></div>` : ""}
  </section>`;
}
function moneySummary() {
  const ym = ymOf(today()), t = budgetTotals(ym), lm = monthStats(addMonthsYM(ym, -1)), w = worth(), p = payInfo(), s = safeToSpend();
  const lines = [];
  lines.push(`Currency: ${S.settings.currency}. Today: ${today()}. ${s.daysLeft} days left in month.`);
  if (p) lines.push(`Pay: ${FREQ[S.settings.pay.freq]}, ${fmt(p.amount)} per paycheck (~${fmt(p.perMonth, true)}/month). Next payday ${p.date}.`);
  lines.push(`This month so far: income ${fmt(t.st.income)}, spent ${fmt(t.st.spent)}. Last month: income ${fmt(lm.income)}, spent ${fmt(lm.spent)}.`);
  lines.push(`Budgets this month (category: spent / budget / last month spent):`);
  for (const c of cats().filter(c => c.group !== "income")) { const sp = t.st.byCat[c.id] || 0, l = lm.byCat[c.id] || 0; if (sp || c.budget || l) lines.push(`- ${c.name} [${c.group}]: ${fmt(sp)} / ${fmt(c.budget || 0)} / ${fmt(l)}`); }
  lines.push(`Accounts:`);
  for (const a of accounts()) lines.push(`- ${a.name} (${ACCT[a.type].label}${isLiab(a) ? `, owed, ${a.apr || 0}% APR, min ${fmt(a.minPay || 0)}` : ""}): ${fmt(w.b[a.id])}`);
  lines.push(`Net worth ${fmt(w.net)} (assets ${fmt(w.assets)}, debts ${fmt(w.debts)}).`);
  for (const g of S.settings.goals || []) lines.push(`Goal: ${g.name} ${fmt(g.saved)} of ${fmt(g.target)}${g.date ? " by " + g.date : ""}.`);
  const big = (S.months[ym] || []).filter(x => x.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 8);
  if (big.length) lines.push(`Largest expenses this month: ` + big.map(x => `${x.desc || (catById(x.cat) || {}).name || "?"} ${fmt(x.amount)}`).join("; "));
  return lines.join("\n");
}
function aiError(e) {
  const c = e && e.code;
  if (c === "not_granted") return "Claude features are turned off for this page. You can allow them from the page's Permissions menu.";
  if (c === "rate_limited") return "Too many requests. Try again in a minute.";
  return "Couldn't reach Claude just now. Try again.";
}
async function getInsights() {
  if (!S.ai || S.insightsBusy) return;
  S.insightsBusy = true; render();
  try {
    const res = await S.ai.json(`You are a friendly, practical money coach inside a personal budgeting app. Read this person's numbers and give 3 or 4 specific insights for this month: spending trends against budget and last month, a realistic daily spending pace, debt or savings moves, and anything that needs attention before payday. Refer to their actual categories and amounts. No generic advice, no disclaimers.\n\nDATA:\n${moneySummary()}\n\nReply with only a JSON array: [{"title": "short headline, max 7 words", "detail": "one or two sentences, max 40 words"}]`, { modelTier: "default" });
    S.insights = Array.isArray(res) ? res.filter(x => x && x.title).slice(0, 4).map(x => ({ title: String(x.title), detail: String(x.detail || "") })) : null;
    if (!S.insights || !S.insights.length) { S.insights = null; toast("Claude didn't return insights. Try again."); }
  } catch (e) { toast(aiError(e)); }
  S.insightsBusy = false; render();
}
async function askQuestion(q) {
  if (!S.ai || S.qa.busy || !q.trim()) return;
  S.qa = { q, a: "Thinking…", busy: true }; render(); paintAnswer();
  try {
    const r = await S.ai(`You are a concise, practical money coach inside a personal budgeting app. Answer the question using this person's numbers below. Plain text, no markdown headers, under 150 words.\n\nDATA:\n${moneySummary()}\n\nQUESTION: ${q}`, { onText: ({ text }) => { S.qa.a = text; paintAnswer(); }, cache: false });
    S.qa.a = r.text;
  } catch (e) { S.qa.a = aiError(e); }
  S.qa.busy = false; render(); paintAnswer();
}
function paintAnswer() { const el = $("#qa-a"); if (el) el.textContent = S.qa.a; }

async function scanReceipt(file) {
  if (!S.ai || !S.aiImages) return;
  const sh = S.sheet; if (!sh || sh.kind !== "tx") return;
  readTxForm(); sh.scanning = true; renderSheet();
  try {
    const names = cats().filter(c => c.group !== "income").map(c => c.name);
    const r = await S.ai.json(`The image is a photo of a purchase receipt. Extract the merchant name, the final total paid (after tax and tip), and the purchase date. Choose the best category from this list: ${JSON.stringify(names)}. Today is ${today()}.\nReply with only JSON: {"merchant": string, "total": number, "date": "YYYY-MM-DD" or null, "category": one of the list}`, { images: [file], modelTier: "quick" });
    const d = sh.data;
    if (r && typeof r === "object") {
      if (r.merchant) d.desc = String(r.merchant).slice(0, 60);
      if (num(r.total) > 0) d.amount = String(num(r.total).toFixed(2));
      if (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) d.date = r.date;
      const c = cats().find(c => c.name.toLowerCase() === String(r.category || "").toLowerCase()); if (c) d.cat = c.id;
      d.type = "expense"; toast("Receipt read. Check the details, then save.");
    } else toast("Couldn't read that receipt. Enter it by hand.");
  } catch (e) { toast(e && e.code === "invalid_json" ? "Couldn't read that receipt. Enter it by hand." : aiError(e)); }
  sh.scanning = false; renderSheet();
}

/* ---------- sheets ---------- */
function openSheet(kind, data) { S.sheet = { kind, data }; S.confirm = null; renderSheet(); }
function closeSheet() { S.sheet = null; S.confirm = null; renderSheet(); }
function renderSheet() {
  const el = $("#sheet");
  if (!S.sheet) { el.innerHTML = ""; return; }
  const f = { tx: sheetTx, cat: sheetCat, acct: sheetAcct, goal: sheetGoal, settings: sheetSettings }[S.sheet.kind];
  el.innerHTML = `<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${f(S.sheet.data)}</div></div>`;
  const a = el.querySelector("[autofocus]"); if (a && !S.sheet.noFocus) { a.focus(); S.sheet.noFocus = true; }
}
const opt = (v, label, sel) => `<option value="${esc(v)}" ${v === sel ? "selected" : ""}>${esc(label)}</option>`;
const delBtn = key => `<button class="btn danger" data-act="del" data-k="${key}">${S.confirm === key ? "Tap again to delete" : "Delete"}</button>`;

function sheetTx(d) {
  const type = d.type;
  const catList = cats().filter(c => type === "income" ? c.group === "income" : c.group !== "income");
  const acctOpts = accounts().map(a => opt(a.id, a.name, d.acct)).join("");
  const scan = S.ai && S.aiImages && !d.id ? `<button class="btn ghost block" data-act="scan" ${d.scanning ? "disabled" : ""}><span class="row" style="justify-content:center">${icon("camera").replace('class="i"', 'class="i" style="width:18px;height:18px"')}${d.scanning ? "Reading receipt…" : "Scan a receipt"}</span></button>` : "";
  return `<div class="between"><h3>${d.id ? "Edit transaction" : "New transaction"}</h3><button class="icon-btn" data-act="close" aria-label="Close">${icon("x")}</button></div>
    <div class="seg">${["expense", "income", "transfer"].map(t => `<button class="${type === t ? "on" : ""}" data-act="txtype" data-v="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div>
    ${scan}
    <input id="tx-amt" class="inp amount num" inputmode="decimal" placeholder="0.00" value="${esc(d.amount)}" aria-label="Amount" ${d.id ? "" : "autofocus"}>
    <label class="field"><span>${type === "transfer" ? "Note" : type === "income" ? "From" : "Merchant or note"}</span><input id="tx-desc" class="inp" value="${esc(d.desc)}" placeholder="${type === "transfer" ? "e.g. Card payment" : type === "income" ? "e.g. Employer" : "e.g. Trader Joe's"}" autocomplete="off"></label>
    ${type !== "transfer" ? `<div class="field"><span>Category</span><div class="chips">${catList.map(c => `<button class="chip ${d.cat === c.id ? "on" : ""}" data-act="pickcat" data-id="${c.id}"><i style="background:${c.color}"></i>${esc(c.name)}</button>`).join("")}</div></div>` : ""}
    <div class="grid2">
      <label class="field"><span>${type === "transfer" ? "From account" : type === "income" ? "Into account" : "Paid with"}</span><select id="tx-acct" class="inp">${accounts().length ? "" : opt("", "No accounts")}${acctOpts}</select></label>
      ${type === "transfer" ? `<label class="field"><span>To account</span><select id="tx-to" class="inp">${accounts().map(a => opt(a.id, a.name, d.to)).join("")}</select></label>` : `<label class="field"><span>Date</span><input id="tx-date" type="date" class="inp" value="${esc(d.date)}"></label>`}
    </div>
    ${type === "transfer" ? `<label class="field"><span>Date</span><input id="tx-date" type="date" class="inp" value="${esc(d.date)}"></label><p class="small muted" style="margin:-6px 0 0">Use transfers for card payments, loan payments and moving money to savings. They don't count as spending.</p>` : ""}
    <div class="btn-row">${d.id ? delBtn("tx") : ""}<button class="btn" data-act="save-tx">${d.id ? "Save" : "Add"}</button></div>`;
}
function readTxForm() {
  const d = S.sheet.data; const g = id => { const e = $("#" + id); return e ? e.value : undefined; };
  ["amt", "desc", "acct", "to", "date"].forEach(k => { const v = g("tx-" + k); if (v !== undefined) d[k === "amt" ? "amount" : k] = v; });
}
function sheetCat(d) {
  return `<div class="between"><h3>${d.id ? "Edit category" : "New category"}</h3><button class="icon-btn" data-act="close" aria-label="Close">${icon("x")}</button></div>
    <label class="field"><span>Name</span><input id="c-name" class="inp" value="${esc(d.name)}" autocomplete="off"></label>
    <label class="field"><span>Type</span><select id="c-group" class="inp">${opt("bills", "Bill (fixed each month)", d.group)}${opt("everyday", "Everyday spending", d.group)}${opt("income", "Income", d.group)}</select></label>
    <label class="field"><span>Monthly budget (leave 0 for income)</span><input id="c-budget" class="inp num" inputmode="decimal" value="${esc(d.budget)}"></label>
    <div class="field"><span>Color</span><div class="chips">${PALETTE.map(c => `<button class="chip ${d.color === c ? "on" : ""}" data-act="pickcolor" data-v="${c}" aria-label="Color ${c}"><i style="background:${c};width:16px;height:16px"></i></button>`).join("")}</div></div>
    <div class="btn-row">${d.id ? delBtn("cat") : ""}<button class="btn" data-act="save-cat">Save</button></div>`;
}
function sheetAcct(d) {
  const liab = ACCT[d.type] && ACCT[d.type].liab;
  return `<div class="between"><h3>${d.id ? "Edit account" : "New account"}</h3><button class="icon-btn" data-act="close" aria-label="Close">${icon("x")}</button></div>
    <label class="field"><span>Name</span><input id="a-name" class="inp" value="${esc(d.name)}" placeholder="e.g. Chase Checking" autocomplete="off"></label>
    <label class="field"><span>Type</span><select id="a-type" class="inp">${Object.entries(ACCT).map(([k, v]) => opt(k, v.label, d.type)).join("")}</select></label>
    <label class="field"><span>${liab ? "Amount owed today" : "Current balance"}</span><input id="a-bal" class="inp num" inputmode="decimal" value="${esc(d.bal)}"></label>
    ${liab ? `<div class="grid2"><label class="field"><span>APR %</span><input id="a-apr" class="inp num" inputmode="decimal" value="${esc(d.apr)}"></label><label class="field"><span>Minimum payment / month</span><input id="a-min" class="inp num" inputmode="decimal" value="${esc(d.minPay)}"></label></div>` : ""}
    ${d.id ? `<p class="small muted" style="margin:0">Changing the balance adds an adjustment so it matches your bank. Logged transactions stay as they are.</p>` : ""}
    <div class="btn-row">${d.id ? delBtn("acct") : ""}<button class="btn" data-act="save-acct">Save</button></div>`;
}
function sheetGoal(d) {
  return `<div class="between"><h3>${d.id ? "Edit goal" : "New goal"}</h3><button class="icon-btn" data-act="close" aria-label="Close">${icon("x")}</button></div>
    <label class="field"><span>Goal</span><input id="g-name" class="inp" value="${esc(d.name)}" placeholder="e.g. Emergency fund" autocomplete="off"></label>
    <div class="grid2"><label class="field"><span>Target amount</span><input id="g-target" class="inp num" inputmode="decimal" value="${esc(d.target)}"></label>
    <label class="field"><span>Saved so far</span><input id="g-saved" class="inp num" inputmode="decimal" value="${esc(d.saved)}"></label></div>
    <label class="field"><span>Target date (optional)</span><input id="g-date" type="date" class="inp" value="${esc(d.date || "")}"></label>
    ${d.id ? `<label class="field"><span>Add to this goal</span><div class="row"><input id="g-add" class="inp num" inputmode="decimal" placeholder="Amount"><button class="btn ghost" data-act="goal-add">Add</button></div></label>` : ""}
    <div class="btn-row">${d.id ? delBtn("goal") : ""}<button class="btn" data-act="save-goal">Save</button></div>`;
}
function sheetSettings(d) {
  const cloud = Store.mode === "cloud";
  const ic = n => icon(n).replace('class="i"', 'class="i" style="width:20px;height:20px;flex:none;color:var(--accent)"');
  const acct = cloud
    ? `<div class="card" style="padding:12px;display:flex;flex-direction:column;gap:10px"><div class="row small">${ic("cloud")}<span>Signed in as <b>${esc(Store.user.email)}</b>. ${S.syncErr ? "Some changes are waiting to sync." : "Your data is synced and only you can see it."}</span></div><div class="btn-row"><button class="btn ghost" data-act="sync-now">Sync now</button><button class="btn ghost" data-act="sign-out">Sign out</button></div></div>`
    : `<div class="card" style="padding:12px;display:flex;flex-direction:column;gap:10px"><div class="row small">${ic("wallet")}<span>Saved in this browser only. Export a backup now and then so you don't lose it.</span></div>${Store.sb ? `<button class="btn ghost" data-act="go-auth">Create an account to sync</button>` : ""}</div>`;
  return `<div class="between"><h3>Settings</h3><button class="icon-btn" data-act="close" aria-label="Close">${icon("x")}</button></div>
    ${acct}
    <label class="field"><span>Your name</span><input id="st-name" class="inp" value="${esc(d.name)}" autocomplete="off"></label>
    <label class="field"><span>Currency</span><select id="st-cur" class="inp">${CURRENCIES.map(c => opt(c, c, d.currency)).join("")}</select></label>
    <label class="field"><span>How often you're paid</span><select id="st-freq" class="inp">${Object.entries(FREQ).map(([k, v]) => opt(k, v, d.freq)).join("")}</select></label>
    <div class="grid2"><label class="field"><span>Next payday</span><input id="st-next" type="date" class="inp" value="${esc(d.next)}"></label>
    <label class="field"><span>Take-home per paycheck</span><input id="st-amt" class="inp num" inputmode="decimal" value="${esc(d.amount)}"></label></div>
    <button class="btn" data-act="save-settings">Save settings</button>
    <div class="label" style="margin-top:6px">Your data</div>
    <div class="btn-row"><button class="btn ghost" data-act="export-csv" >Export CSV</button><button class="btn ghost" data-act="export-json" >Backup</button></div>
    <button class="btn ghost block" data-act="import">Restore from backup</button>
    ${delBtn("all").replace("Delete", "Delete all my data").replace("Tap again to delete", "Tap again to delete everything")}
    ${cloud ? delBtn("account").replace(">Delete<", ">Delete my account<").replace("Tap again to delete", "Tap again to delete your account") : ""}`;
}

/* ---------- actions ---------- */
function newTx(type = "expense") {
  const first = accounts().find(a => ["checking", "credit", "cash"].includes(a.type)) || accounts()[0];
  return { type, amount: "", desc: "", cat: null, acct: first ? first.id : "", to: (accounts().find(a => a !== first) || {}).id || "", date: today() };
}
async function saveTx() {
  readTxForm(); const d = S.sheet.data; const amount = Math.round(num(d.amount) * 100) / 100;
  if (!(amount > 0)) return toast("Enter an amount above zero.");
  if (!d.date) return toast("Choose a date.");
  if (!accounts().length) return toast("Add an account first, under Home → Net worth.");
  if (d.type === "transfer" && d.acct === d.to) return toast("Pick two different accounts for a transfer.");
  if (d.type !== "transfer" && !d.cat) return toast("Pick a category.");
  const t = { id: d.id || uid(), date: d.date, type: d.type, amount, desc: (d.desc || "").trim(), cat: d.type === "transfer" ? null : d.cat, acct: d.acct, to: d.type === "transfer" ? d.to : null, ts: d.ts || Date.now() };
  const touched = new Set([ymOf(t.date)]);
  if (d.id) for (const [ym, list] of Object.entries(S.months)) { const i = list.findIndex(x => x.id === d.id); if (i >= 0) { list.splice(i, 1); touched.add(ym); } }
  (S.months[ymOf(t.date)] = S.months[ymOf(t.date)] || []).push(t);
  S.insights = null; closeSheet(); render(); toast(d.id ? "Saved" : "Added");
  for (const ym of touched) await Store.saveMonth(ym);
}
async function deleteTx() {
  const id = S.sheet.data.id;
  for (const [ym, list] of Object.entries(S.months)) { const i = list.findIndex(x => x.id === id); if (i >= 0) { list.splice(i, 1); closeSheet(); render(); toast("Deleted"); await Store.saveMonth(ym); return; } }
}
async function saveCat() {
  const d = S.sheet.data; const name = $("#c-name").value.trim(); if (!name) return toast("Give the category a name.");
  const c = { id: d.id || uid(), name, group: $("#c-group").value, budget: Math.max(0, num($("#c-budget").value)), color: d.color || PALETTE[0] };
  const list = S.settings.categories; const i = list.findIndex(x => x.id === c.id); if (i >= 0) list[i] = c; else list.push(c);
  closeSheet(); render(); toast("Saved"); await Store.saveSettings();
}
async function saveAcct() {
  const d = S.sheet.data; const name = $("#a-name").value.trim(); if (!name) return toast("Give the account a name.");
  const type = $("#a-type").value; const bal = num($("#a-bal").value);
  const a = d.id ? acctById(d.id) : { id: uid(), opening: 0 };
  a.name = name; a.type = type;
  if (ACCT[type].liab) { const apr = $("#a-apr"), mn = $("#a-min"); a.apr = apr ? num(apr.value) : (a.apr || 0); a.minPay = mn ? num(mn.value) : (a.minPay || 0); }
  if (d.id) { const cur = balances()[a.id] || 0; a.opening = (a.opening || 0) + (bal - cur); }
  else { a.opening = bal; S.settings.accounts.push(a); }
  closeSheet(); render(); toast("Saved"); await Store.saveSettings();
}
async function saveGoal(extra = 0) {
  const d = S.sheet.data; const name = $("#g-name").value.trim(); if (!name) return toast("Name your goal.");
  const target = num($("#g-target").value); if (!(target > 0)) return toast("Enter a target amount.");
  const g = { id: d.id || uid(), name, target, saved: Math.max(0, num($("#g-saved").value) + extra), date: $("#g-date").value || "" };
  S.settings.goals = S.settings.goals || []; const i = S.settings.goals.findIndex(x => x.id === g.id); if (i >= 0) S.settings.goals[i] = g; else S.settings.goals.push(g);
  closeSheet(); render(); toast(extra ? `Added ${fmt(extra, true)}` : "Saved"); await Store.saveSettings();
}
async function saveSettingsSheet() {
  const s = S.settings; s.name = $("#st-name").value.trim(); s.currency = $("#st-cur").value; _fmt = {};
  s.pay = { freq: $("#st-freq").value, next: $("#st-next").value, amount: num($("#st-amt").value) };
  closeSheet(); render(); toast("Settings saved"); await Store.saveSettings();
}
async function del(k) {
  if (S.confirm !== k) { S.confirm = k; renderSheet(); return; }
  S.confirm = null; const d = S.sheet && S.sheet.data;
  if (k === "tx") return deleteTx();
  if (k === "cat") { S.settings.categories = cats().filter(c => c.id !== d.id); }
  if (k === "acct") { S.settings.accounts = accounts().filter(a => a.id !== d.id); }
  if (k === "goal") { S.settings.goals = (S.settings.goals || []).filter(g => g.id !== d.id); }
  if (k === "account") { closeSheet(); await deleteAccount(); return; }
  if (k === "all") { closeSheet(); if (!(await Store.wipe())) return; S.ob = null; S.view = null; S.tab = "home"; S.insights = null; render(); toast("All data deleted"); return; }
  closeSheet(); render(); toast("Deleted"); await Store.saveSettings();
}
function csvCell(v) { v = String(v ?? ""); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
async function exportFile(kind) {
  let data, filename;
  if (kind === "csv") {
    const rows = [["Date", "Type", "Description", "Category", "Account", "To account", "Amount"]];
    for (const t of allTx().sort((a, b) => a.date.localeCompare(b.date))) rows.push([t.date, t.type, t.desc, (catById(t.cat) || {}).name || "", (acctById(t.acct) || {}).name || "", (acctById(t.to) || {}).name || "", t.amount.toFixed(2)]);
    data = rows.map(r => r.map(csvCell).join(",")).join("\n"); filename = `my-money-transactions-${today()}.csv`;
  } else { data = JSON.stringify({ app: "my-money", version: 1, exported: today(), settings: S.settings, months: S.months }, null, 1); filename = `my-money-backup-${today()}.json`; }
  if (NATIVE && NATIVE.Filesystem && NATIVE.Share) { try { const w = await NATIVE.Filesystem.writeFile({ path: filename, data, directory: "CACHE", encoding: "utf8" }); await NATIVE.Share.share({ title: filename, files: [w.uri] }); } catch (e) { if (!/cancel/i.test(String(e && e.message))) toast("Couldn't share the file."); } return; }
  if (!S.dl) { try { const blob = new Blob([data], { type: kind === "csv" ? "text/csv" : "application/json" }); const f = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: filename }); return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast("File saved"); } catch (e) { if (!e || e.name !== "AbortError") toast("Couldn't save the file."); } return; }
  try { const r = await S.dl.save({ filename, data }); if (r.status === "saved") toast("File saved"); } catch (e) { if (e && e.code !== "declined" && e.code !== "cancelled") toast("Couldn't save the file."); }
}
async function importFile(file) {
  try {
    const d = JSON.parse(await file.text());
    if (file.size > 20e6 || !d || d.app !== "my-money" || !d.settings || typeof d.months !== "object") throw 0;
    const st = cleanSettings(d.settings); if (!st) throw 0;
    S.settings = st; S.months = cleanMonths(d.months); S.ob = null; _fmt = {}; closeSheet(); render();
    await Store.saveAll(); toast("Backup restored");
  } catch { toast("That file isn't a My Money backup."); }
}

/* ---------- onboarding ---------- */
function startOnboarding() {
  const p = new Date(); p.setDate(p.getDate() + ((5 - p.getDay() + 7) % 7 || 7));
  S.ob = { step: 1, name: "", currency: guessCurrency(), freq: "biweekly", next: iso(p), amount: "",
    accounts: [{ id: uid(), name: "Checking", type: "checking", bal: "" }, { id: uid(), name: "Savings", type: "savings", bal: "" }, { id: uid(), name: "Credit card", type: "credit", bal: "" }],
    cats: defaultCategories() };
}
function guessCurrency() { try { const c = new Intl.NumberFormat().resolvedOptions().locale; const m = { "en-US": "USD", "en-GB": "GBP", "en-CA": "CAD", "en-AU": "AUD", "en-IN": "INR", "ne-NP": "NPR", "ja-JP": "JPY" }; return m[c] || "USD"; } catch { return "USD"; } }
function renderOnboarding() {
  const o = S.ob;
  if (!o) return `<div class="wrap ob">
    <a class="brand" href="./"><img src="logo.svg" alt="" width="30" height="30">My Money</a>
    <h2>Every dollar, one calm place.</h2>
    <p>Track spending, set budgets, plan your debt payoff and save toward goals. Your data stays private to you.</p>
    <div class="card" style="display:flex;flex-direction:column;gap:14px">
      ${[["home", "Know what's safe to spend", "A daily number based on your budgets and days left in the month."], ["pie", "Budgets that keep up", "See every category against its limit as you log spending."], ["target", "Goals and debt payoff", "Find your debt-free date and how much extra speeds it up."], ["cloud", "On every device", "Sign in on your phone and computer and see the same numbers. No bank logins needed."]].map(([ic, t, d]) => `<div class="feature"><span class="fi">${icon(ic)}</span><div><b>${t}</b><div class="small muted">${d}</div></div></div>`).join("")}
    </div>
    <button class="btn block" data-act="ob-start">Set up my money</button>
    <button class="btn ghost block" data-act="ob-sample">Explore with sample data</button>
    <p class="small" style="text-align:center;margin:0 auto">${Store.mode === "cloud" ? "Signed in as " + esc(Store.user.email) + ". Your data syncs to your account." : "Saved in this browser only."}</p>
  </div>`;
  const steps = `<div class="steps">${[1, 2, 3, 4].map(i => `<i class="${i <= o.step ? "on" : ""}"></i>`).join("")}</div>`;
  const nav = (next, label = "Continue") => `<div class="btn-row"><button class="btn ghost" data-act="ob-back">Back</button><button class="btn" data-act="${next}">${label}</button></div>`;
  if (o.step === 1) return `<div class="wrap ob">${steps}<h2>About you</h2><p>Just the basics so numbers show the right way.</p>
    <label class="field"><span>First name (optional)</span><input class="inp" data-ob="name" value="${esc(o.name)}" autocomplete="given-name"></label>
    <label class="field"><span>Currency</span><select class="inp" data-ob="currency">${CURRENCIES.map(c => opt(c, c, o.currency)).join("")}</select></label>${nav("ob-next")}</div>`;
  if (o.step === 2) return `<div class="wrap ob">${steps}<h2>Your paycheck</h2><p>Used for your payday countdown and to check your budgets fit your income.</p>
    <label class="field"><span>How often are you paid?</span><select class="inp" data-ob="freq">${Object.entries(FREQ).map(([k, v]) => opt(k, v, o.freq)).join("")}</select></label>
    <div class="grid2"><label class="field"><span>Next payday</span><input type="date" class="inp" data-ob="next" value="${esc(o.next)}"></label>
    <label class="field"><span>Take-home per paycheck</span><input class="inp num" inputmode="decimal" data-ob="amount" value="${esc(o.amount)}" placeholder="0"></label></div>${nav("ob-next")}</div>`;
  if (o.step === 3) return `<div class="wrap ob">${steps}<h2>Your accounts</h2><p>Add what you have today. For cards and loans, enter what you owe. You can add APRs later.</p>
    <div class="card" style="display:flex;flex-direction:column;gap:10px">${o.accounts.map((a, i) => `<div class="acct-row">
      <input class="inp" data-oba="${i}:name" value="${esc(a.name)}" aria-label="Account name">
      <select class="inp typ" data-oba="${i}:type" aria-label="Account type">${Object.entries(ACCT).map(([k, v]) => opt(k, v.label, a.type)).join("")}</select>
      <input class="inp num" inputmode="decimal" data-oba="${i}:bal" value="${esc(a.bal)}" placeholder="${ACCT[a.type].liab ? "Owed" : "Balance"}" aria-label="Balance">
      <button class="x-btn" data-act="ob-rm-acct" data-i="${i}" aria-label="Remove">${icon("x")}</button></div>`).join("")}
      <button class="btn ghost" data-act="ob-add-acct">Add another account</button></div>${nav("ob-next")}</div>`;
  const inc = num(o.amount) * (PER_MONTH[o.freq] || 1); const tot = sum(o.cats.filter(c => c.group !== "income").map(c => num(c.budget)));
  return `<div class="wrap ob">${steps}<h2>Monthly budgets</h2><p>Set a rough amount for each category. Leave anything at 0 to skip it. You can change these any time.</p>
    <div class="card between" style="position:sticky;top:env(safe-area-inset-top,0px);z-index:5"><div><div class="label">Budgeted</div><b class="num" id="ob-tot">${fmtCur(tot, o.currency)}</b></div><div style="text-align:right"><div class="label">Income / month</div><b class="num">${fmtCur(inc, o.currency)}</b></div></div>
    ${[["bills", "Bills"], ["everyday", "Everyday spending"]].map(([g, t]) => `<div class="card"><h2>${t}</h2><div class="list" style="margin-top:6px">${o.cats.map((c, i) => c.group !== g ? "" : `<div class="li" style="cursor:default"><span class="chip" style="border:0;padding:0;background:none"><i style="background:${c.color}"></i></span><span class="grow t">${esc(c.name)}</span><input class="inp num" style="width:110px;text-align:right" inputmode="decimal" data-obc="${i}" value="${c.budget || ""}" placeholder="0" aria-label="${esc(c.name)} budget"></div>`).join("")}</div></div>`).join("")}
    ${nav("ob-finish", "Finish setup")}</div>`;
}
function fmtCur(n, cur) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n); } catch { return Math.round(n); } }
async function finishOnboarding() {
  const o = S.ob;
  S.settings = {
    v: 1, name: o.name.trim(), currency: o.currency, pay: { freq: o.freq, next: o.next, amount: num(o.amount) },
    accounts: o.accounts.filter(a => a.name.trim()).map(a => ({ id: a.id, name: a.name.trim(), type: a.type, opening: num(a.bal), apr: 0, minPay: 0 })),
    categories: o.cats.map(c => ({ ...c, budget: num(c.budget) })), goals: [], debt: { extra: 100, strategy: "avalanche" }, createdAt: Date.now(),
  };
  S.months = {}; S.ob = null; _fmt = {}; render(); toast("You're all set. Tap + to log your first transaction.");
  await Store.saveSettings();
}
async function loadSample() {
  const c = defaultCategories(); const C = n => c.find(x => x.name === n).id;
  const budgets = { "Rent / Mortgage": 1500, "Utilities": 120, "Phone & Internet": 95, "Insurance": 160, "Subscriptions": 40, "Groceries": 450, "Dining out": 220, "Transport & Gas": 180, "Shopping": 150, "Health": 60, "Entertainment": 90, "Personal care": 50, "Gifts & Giving": 40, "Other": 60 };
  c.forEach(x => { if (budgets[x.name] != null) x.budget = budgets[x.name]; });
  const A = (name, type, opening, apr = 0, minPay = 0) => ({ id: uid(), name, type, opening, apr, minPay });
  const chk = A("Everyday Checking", "checking", 1800), sav = A("High-Yield Savings", "savings", 6400), card = A("Rewards Visa", "credit", 900, 22.9, 35),
    car = A("Auto Loan", "loan", 15600, 6.4, 385), stu = A("Student Loan", "loan", 9800, 5.5, 125), brk = A("Brokerage", "investment", 12600), ret = A("401(k)", "retirement", 31000);
  const t0 = new Date(); const pay = new Date(t0); pay.setDate(pay.getDate() - ((pay.getDay() + 2) % 7)); // last Friday
  S.settings = { v: 1, sample: true, name: "Alex", currency: S.ob ? S.ob.currency : guessCurrency(), pay: { freq: "biweekly", next: iso(new Date(pay.getTime() + 14 * 864e5)), amount: 2650 },
    accounts: [chk, sav, card, car, stu, brk, ret], categories: c, goals: [{ id: uid(), name: "Emergency fund", target: 15000, saved: 6400, date: iso(new Date(t0.getFullYear() + 1, 11, 1)) }, { id: uid(), name: "Summer trip", target: 3000, saved: 750, date: iso(new Date(t0.getFullYear() + 1, 5, 1)) }],
    debt: { extra: 150, strategy: "avalanche" }, createdAt: Date.now() };
  // generate ~2.5 months of example transactions
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const months = {}; const push = t => { const ym = ymOf(t.date); (months[ym] = months[ym] || []).push({ id: uid(), ts: 0, desc: "", to: null, ...t }); };
  const start = new Date(t0.getFullYear(), t0.getMonth() - 2, 1);
  for (let d = new Date(start); d <= t0; d.setDate(d.getDate() + 1)) {
    const ds = iso(d), dd = d.getDate();
    if (Math.round((pay - d) / 864e5) % 14 === 0) push({ date: ds, type: "income", amount: 2650, cat: C("Paycheck"), acct: chk.id, desc: "Payroll deposit" });
    if (dd === 1) { push({ date: ds, type: "expense", amount: 1500, cat: C("Rent / Mortgage"), acct: chk.id, desc: "Rent" }); push({ date: ds, type: "transfer", amount: 300, acct: chk.id, to: sav.id, desc: "Monthly savings" }); }
    if (dd === 3) push({ date: ds, type: "expense", amount: 15.49, cat: C("Subscriptions"), acct: card.id, desc: "Streaming" });
    if (dd === 5) { push({ date: ds, type: "transfer", amount: 385, acct: chk.id, to: car.id, desc: "Auto loan payment" }); push({ date: ds, type: "transfer", amount: 125, acct: chk.id, to: stu.id, desc: "Student loan payment" }); }
    if (dd === 8) push({ date: ds, type: "expense", amount: 92 + Math.round(rnd() * 40), cat: C("Utilities"), acct: chk.id, desc: "Electric & water" });
    if (dd === 12) push({ date: ds, type: "expense", amount: 85, cat: C("Phone & Internet"), acct: card.id, desc: "Mobile + internet" });
    if (dd === 15) push({ date: ds, type: "expense", amount: 158, cat: C("Insurance"), acct: chk.id, desc: "Car insurance" });
    if (dd === 20) push({ date: ds, type: "transfer", amount: 420, acct: chk.id, to: card.id, desc: "Visa payment" });
    if (d.getDay() === 6 || d.getDay() === 2) push({ date: ds, type: "expense", amount: +(48 + rnd() * 70).toFixed(2), cat: C("Groceries"), acct: card.id, desc: ["Fresh Market", "Corner Grocer", "Whole Pantry"][Math.floor(rnd() * 3)] });
    if (rnd() < 0.22) push({ date: ds, type: "expense", amount: +(12 + rnd() * 45).toFixed(2), cat: C("Dining out"), acct: card.id, desc: ["Taco spot", "Noodle bar", "Coffee & bagel", "Pizza night"][Math.floor(rnd() * 4)] });
    if (rnd() < 0.12) push({ date: ds, type: "expense", amount: +(35 + rnd() * 20).toFixed(2), cat: C("Transport & Gas"), acct: card.id, desc: "Gas" });
    if (rnd() < 0.07) push({ date: ds, type: "expense", amount: +(20 + rnd() * 90).toFixed(2), cat: C("Shopping"), acct: card.id, desc: ["Online order", "Home goods", "Clothing"][Math.floor(rnd() * 3)] });
    if (rnd() < 0.05) push({ date: ds, type: "expense", amount: +(15 + rnd() * 40).toFixed(2), cat: C("Entertainment"), acct: card.id, desc: "Movies" });
  }
  S.months = months; S.ob = null; _fmt = {};
  // set openings so today's balances look sensible
  const target = { [chk.id]: 2140, [sav.id]: 6400, [card.id]: 1120, [car.id]: 15600, [stu.id]: 9800 };
  const b = balances(); for (const a of S.settings.accounts) if (target[a.id] != null) a.opening += target[a.id] - b[a.id];
  render(); await Store.saveAll();
}

/* ---------- events ---------- */
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act;
  if (act === "scrim") { if (e.target === el) closeSheet(); return; }
  if (el.tagName === "BUTTON") e.preventDefault();
  const id = el.dataset.id, v = el.dataset.v;
  switch (act) {
    case "tab": S.tab = v; S.view = null; render(); window.scrollTo(0, 0); break;
    case "back": S.view = null; render(); break;
    case "open-accounts": S.view = "accounts"; render(); window.scrollTo(0, 0); break;
    case "month": S.viewMonth = addMonthsYM(S.viewMonth, +el.dataset.d); render(); break;
    case "plan": S.plan = v; render(); break;
    case "strategy": S.settings.debt = { ...(S.settings.debt || { extra: 100 }), strategy: v }; render(); Store.saveSettings(); break;
    case "add-tx": openSheet("tx", newTx()); break;
    case "edit-tx": { const t = allTx().find(x => x.id === id); if (t) openSheet("tx", { ...t, amount: t.amount.toFixed(2), noFocus: true }); break; }
    case "txtype": readTxForm(); S.sheet.data.type = v; S.sheet.data.cat = null; renderSheet(); break;
    case "pickcat": S.sheet.data.cat = id; document.querySelectorAll('[data-act="pickcat"]').forEach(b => b.classList.toggle("on", b.dataset.id === id)); break;
    case "pickcolor": S.sheet.data.color = v; document.querySelectorAll('[data-act="pickcolor"]').forEach(b => b.classList.toggle("on", b.dataset.v === v)); break;
    case "scan": $("#receipt-file").click(); break;
    case "save-tx": saveTx(); break;
    case "close": closeSheet(); break;
    case "del": del(el.dataset.k); break;
    case "edit-cat": { const c = catById(id); if (c) openSheet("cat", { ...c }); break; }
    case "new-cat": openSheet("cat", { name: "", group: "everyday", budget: 0, color: PALETTE[cats().length % PALETTE.length] }); break;
    case "save-cat": saveCat(); break;
    case "edit-acct": { const a = acctById(id); if (a) openSheet("acct", { ...a, bal: (balances()[a.id] || 0).toFixed(2) }); break; }
    case "new-acct": openSheet("acct", { name: "", type: "checking", bal: "", apr: "", minPay: "" }); break;
    case "save-acct": saveAcct(); break;
    case "new-goal": openSheet("goal", { name: "", target: "", saved: "", date: "" }); break;
    case "edit-goal": { const g = (S.settings.goals || []).find(x => x.id === id); if (g) openSheet("goal", { ...g }); break; }
    case "save-goal": saveGoal(); break;
    case "goal-add": { const n = num($("#g-add").value); if (n > 0) saveGoal(n); else toast("Enter an amount to add."); break; }
    case "settings": { const s = S.settings; openSheet("settings", { name: s.name || "", currency: s.currency, freq: (s.pay || {}).freq || "biweekly", next: (s.pay || {}).next || today(), amount: (s.pay || {}).amount || "" }); break; }
    case "save-settings": saveSettingsSheet(); break;
    case "export-csv": exportFile("csv"); break;
    case "export-json": exportFile("json"); break;
    case "import": $("#import-file").click(); break;
    case "insights": getInsights(); break;
    case "start-fresh": if (!(await Store.wipe())) break; S.ob = null; S.insights = null; S.tab = "home"; S.view = null; startOnboarding(); render(); break;
    case "ob-start": startOnboarding(); render(); break;
    case "ob-sample": loadSample(); break;
    case "ob-next": S.ob.step++; render(); window.scrollTo(0, 0); break;
    case "ob-back": if (S.ob.step <= 1) S.ob = null; else S.ob.step--; render(); break;
    case "ob-add-acct": S.ob.accounts.push({ id: uid(), name: "", type: "checking", bal: "" }); render(); break;
    case "ob-rm-acct": S.ob.accounts.splice(+el.dataset.i, 1); render(); break;
    case "ob-finish": finishOnboarding(); break;
    case "auth-tab": S.auth = { ...S.auth, tab: v, err: "", msg: "" }; render(); break;
    case "use-local": useLocal(); break;
    case "go-auth": closeSheet(); try { localStorage.removeItem("mymoney.mode"); } catch { } S.auth = { tab: "signup", email: "", err: "", msg: "" }; S.phase = "auth"; render(); break;
    case "sign-out": closeSheet(); signOut(); break;
    case "sync-now": closeSheet(); await Store.sync(); toast(S.syncErr ? "Couldn't sync. Check your connection." : "Synced"); break;
    case "retry": startCloud(Store.user); break;
  }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "search") { S.search = t.value; const pos = t.selectionStart; render(); const n = $("#search"); n.focus(); n.setSelectionRange(pos, pos); return; }
  if (t.id === "qa-q") { S.qa.q = t.value; return; }
  if (t.id === "au-email") { S.auth.email = t.value; return; }
  if (t.id === "extra-range" || t.id === "extra-num") {
    const v = Math.max(0, num(t.value)); S.settings.debt = { ...(S.settings.debt || { strategy: "avalanche" }), extra: v };
    const keep = t.id; render(); const n = $("#" + keep); if (n) { n.focus(); if (keep === "extra-num") { n.value = t.value; } }
    clearTimeout(window._dsave); window._dsave = setTimeout(() => Store.saveSettings(), 800); return;
  }
  if (!S.ob) return;
  if (t.dataset.ob) S.ob[t.dataset.ob] = t.value;
  else if (t.dataset.oba) { const [i, k] = t.dataset.oba.split(":"); S.ob.accounts[+i][k] = t.value; if (k === "type") render(); }
  else if (t.dataset.obc != null) { S.ob.cats[+t.dataset.obc].budget = t.value; const el = $("#ob-tot"); if (el) el.textContent = fmtCur(sum(S.ob.cats.filter(c => c.group !== "income").map(c => num(c.budget))), S.ob.currency); }
});
document.addEventListener("change", e => { const t = e.target; if (S.ob && t.dataset && t.dataset.oba && t.dataset.oba.endsWith(":type")) { const [i] = t.dataset.oba.split(":"); S.ob.accounts[+i].type = t.value; render(); } });
document.addEventListener("submit", e => {
  if (e.target.id === "qa-form") { e.preventDefault(); askQuestion($("#qa-q").value); }
  if (e.target.id === "auth-form") { e.preventDefault(); submitAuth(); }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && S.sheet) closeSheet(); });
$("#receipt-file").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if (f) scanReceipt(f); });
$("#import-file").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if (f) importFile(f); });

/* ---------- accounts (Supabase) ---------- */
S.auth = { tab: "signin", email: "", err: "", msg: "", busy: false };
const APP_URL = location.origin + location.pathname;
function renderAuth() {
  const a = S.auth, t = a.tab;
  const head = { signin: ["Welcome back", "Sign in to see your money on any device."], signup: ["Create your free account", "Your budgets, goals and transactions, synced across your phone and computer."], reset: ["Reset your password", "We'll email you a link to choose a new password."], newpass: ["Choose a new password", "Use at least 8 characters."] }[t];
  const btn = { signin: "Sign in", signup: "Create account", reset: "Send reset link", newpass: "Save new password" }[t];
  return `<div class="wrap ob" style="max-width:460px">
    <a class="brand" href="./"><img src="logo.svg" alt="" width="30" height="30">My Money</a>
    <h2>${head[0]}</h2><p>${head[1]}</p>
    ${t === "signin" || t === "signup" ? `<div class="seg"><button class="${t === "signin" ? "on" : ""}" data-act="auth-tab" data-v="signin">Sign in</button><button class="${t === "signup" ? "on" : ""}" data-act="auth-tab" data-v="signup">Create account</button></div>` : ""}
    <form id="auth-form" class="card" style="display:flex;flex-direction:column;gap:12px" novalidate>
      ${t !== "newpass" ? `<label class="field"><span>Email</span><input id="au-email" class="inp" type="email" autocomplete="email" inputmode="email" value="${esc(a.email)}" ${a.email ? "" : "autofocus"} required></label>` : ""}
      ${t !== "reset" ? `<label class="field"><span>${t === "newpass" ? "New password" : "Password"}</span><input id="au-pass" class="inp" type="password" autocomplete="${t === "signin" ? "current-password" : "new-password"}" minlength="8" ${a.email || t === "newpass" ? "autofocus" : ""} required></label>` : ""}
      ${a.err ? `<div class="msg err" role="alert">${esc(a.err)}</div>` : ""}${a.msg ? `<div class="msg ok" role="status">${esc(a.msg)}</div>` : ""}
      <button class="btn block" ${a.busy ? "disabled" : ""}>${a.busy ? "Please wait…" : btn}</button>
      ${t === "signin" ? `<button type="button" class="link" data-act="auth-tab" data-v="reset" style="align-self:center">Forgot password?</button>` : ""}
      ${t === "reset" ? `<button type="button" class="link" data-act="auth-tab" data-v="signin" style="align-self:center">Back to sign in</button>` : ""}
    </form>
    ${t !== "newpass" ? `<button class="btn ghost block" data-act="use-local">Use without an account</button><p class="small muted" style="margin:0;text-align:center">Without an account, your data stays in this browser only. <a href="privacy.html" style="color:var(--accent)">Privacy</a></p>` : ""}
  </div>`;
}
function authError(e) {
  const m = String((e && (e.code || e.message)) || "");
  if (/invalid_credentials|Invalid login/i.test(m)) return "Email or password is incorrect.";
  if (/email_not_confirmed|not confirmed/i.test(m)) return "Confirm your email first. Check your inbox for the link we sent.";
  if (/user_already_exists|already registered/i.test(m)) return "An account with this email already exists. Sign in instead.";
  if (/weak_password|Password should/i.test(m)) return "Choose a stronger password: at least 8 characters.";
  if (/rate|over_email_send_rate_limit|too many/i.test(m)) return "Too many attempts. Wait a minute and try again.";
  if (/Failed to fetch|network/i.test(m)) return "Can't reach the server. Check your internet connection.";
  return (e && e.message) || "Something went wrong. Try again.";
}
async function submitAuth() {
  const a = S.auth; if (a.busy) return;
  const email = ($("#au-email") || {}).value, pass = ($("#au-pass") || {}).value;
  if (email !== undefined) { a.email = email.trim(); if (!/^\S+@\S+\.\S+$/.test(a.email)) { a.err = "Enter a valid email address."; a.msg = ""; return render(); } }
  if (pass !== undefined && a.tab !== "signin" && pass.length < 8) { a.err = "Use at least 8 characters for your password."; a.msg = ""; return render(); }
  if (pass !== undefined && !pass) { a.err = "Enter your password."; a.msg = ""; return render(); }
  a.busy = true; a.err = ""; a.msg = ""; render();
  const auth = Store.sb.auth; let r;
  try {
    if (a.tab === "signin") r = await auth.signInWithPassword({ email: a.email, password: pass });
    else if (a.tab === "signup") { r = await auth.signUp({ email: a.email, password: pass, options: { emailRedirectTo: APP_URL } }); if (!r.error && !r.data.session) a.msg = "Check your email and tap the link to confirm your account. Then sign in."; if (!r.error && r.data.user && r.data.user.identities && r.data.user.identities.length === 0) { r = { error: { code: "user_already_exists" } }; a.msg = ""; } }
    else if (a.tab === "reset") { r = await auth.resetPasswordForEmail(a.email, { redirectTo: APP_URL }); if (!r.error) a.msg = "If an account exists for that email, a reset link is on its way."; }
    else if (a.tab === "newpass") { r = await auth.updateUser({ password: pass }); if (!r.error) { a.tab = "signin"; a.busy = false; toast("Password updated"); const { data } = await auth.getSession(); if (data.session) startCloud(data.session.user); return; } }
    if (r && r.error) a.err = authError(r.error);
  } catch (e) { a.err = authError(e); }
  a.busy = false; if (S.phase === "auth") render();
}
async function useLocal() {
  try { localStorage.setItem("mymoney.mode", "local"); } catch { }
  Store.mode = "local"; Store.user = null; await Store.loadLocal(); S.phase = "ready";
  if (S.wantSample && !S.settings) { S.wantSample = false; await loadSample(); }
  render();
}
async function startCloud(user) {
  if (!user) return;
  Store.mode = "cloud"; Store.user = user; S.syncErr = false;
  try { localStorage.removeItem("mymoney.mode"); } catch { }
  Store.loadDirty(); await Store.loadLocal();
  const cached = !!S.settings;
  S.phase = cached ? "ready" : "loading"; render();
  let deviceData = null; try { deviceData = JSON.parse(localStorage.getItem(LKEY) || "null"); } catch { }
  try {
    await Store.flush(); const rev = S.rev; const d = await Store.pull();
    if (!d.settings && deviceData && deviceData.settings && !deviceData.settings.sample) {
      S.settings = deviceData.settings; S.months = deviceData.months || {}; await Store.saveAll();
      try { localStorage.removeItem(LKEY); } catch { }
      toast("Moved the data from this browser into your account");
    } else if (S.rev === rev && !Store.hasDirty()) { S.settings = d.settings; S.months = d.months; Store.saveLocal(); }
    S.phase = "ready"; _fmt = {};
    if (S.wantSample && !S.settings) { S.wantSample = false; await loadSample(); }
  } catch {
    S.syncErr = true;
    if (!cached) { S.phase = "offline"; }
  }
  render();
}
async function signOut() {
  if (Store.mode === "cloud") { try { await Store.flush(); } catch { if (Store.hasDirty()) toast("Some changes hadn't synced yet and were left on this device."); } }
  if (Store.mode === "cloud" && !Store.hasDirty()) { try { localStorage.removeItem(Store.key()); localStorage.removeItem(Store.key() + ":dirty"); } catch { } }
  try { await Store.sb.auth.signOut(); } catch { }
  Store.user = null; Store.mode = "local"; S.settings = null; S.months = {}; S.tab = "home"; S.view = null;
  S.auth = { tab: "signin", email: "", err: "", msg: "" }; S.phase = "auth"; render();
}
async function deleteAccount() {
  const { error } = await Store.sb.rpc("delete_my_account");
  if (error) { toast("Couldn't delete your account. Try again."); return; }
  try { localStorage.removeItem(Store.key()); localStorage.removeItem(Store.key() + ":dirty"); } catch { }
  Store.dirty = { settings: false, months: new Set() };
  try { await Store.sb.auth.signOut({ scope: "local" }); } catch { }
  Store.user = null; Store.mode = "local"; S.settings = null; S.months = {};
  S.auth = { tab: "signup", email: "", err: "", msg: "Your account and all its data were deleted." }; S.phase = "auth"; render();
}

function isSecretKey(k) {
  if (/^sb_secret_/.test(k)) return true;
  try { const p = JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); return p.role === "service_role"; } catch { return false; }
}
/* ---------- boot ---------- */
async function boot() {
  render();
  if (location.hash === "#sample") { S.wantSample = true; history.replaceState(null, "", location.pathname); }
  else if (location.hash === "#signup") { S.auth.tab = "signup"; history.replaceState(null, "", location.pathname); }
  const cfg = window.MYMONEY_CONFIG || {};
  const ready = window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey && !/YOUR-/i.test(cfg.supabaseUrl + cfg.supabaseAnonKey);
  if (!ready) { S.noBackend = true; return useLocal(); }
  if (isSecretKey(cfg.supabaseAnonKey)) { document.getElementById("app").innerHTML = `<div class="wrap ob"><div class="brand"><img src="logo.svg" alt="" width="30" height="30">My Money</div><h2>Setup problem</h2><p>config.js contains a secret Supabase key. Replace it with the anon / publishable key, and rotate the secret key in Supabase right away.</p></div>`; return; }
  Store.sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  Store.sb.auth.onAuthStateChange((ev, session) => setTimeout(() => onAuth(ev, session), 0));
}
async function onAuth(ev, session) {
  if (ev === "PASSWORD_RECOVERY") { S.auth = { tab: "newpass", email: "", err: "", msg: "" }; S.phase = "auth"; render(); return; }
  if (S.phase === "auth" && S.auth.tab === "newpass") return;
  if (session && session.user) { if (!Store.user || Store.user.id !== session.user.id) startCloud(session.user); else Store.user = session.user; return; }
  if (ev === "INITIAL_SESSION" || ev === "SIGNED_OUT") {
    if (Store.mode === "local" && S.phase === "ready" && ev === "SIGNED_OUT") return;
    let pref = null; try { pref = localStorage.getItem("mymoney.mode"); } catch { }
    if (pref === "local" || S.wantSample) return useLocal();
    Store.user = null; Store.mode = "local"; S.settings = null; S.months = {}; S.phase = "auth"; render();
  }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") Store.sync(); });
window.addEventListener("online", () => Store.sync());
if (NATIVE && NATIVE.StatusBar) { const dark = () => matchMedia("(prefers-color-scheme: dark)").matches; const setBar = () => NATIVE.StatusBar.setStyle({ style: dark() ? "DARK" : "LIGHT" }).catch(() => { }); setBar(); matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setBar); }
boot();
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch { }
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => { });
