if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch { } }

document.getElementById("yr").textContent = new Date().getFullYear();

// Sticky nav background once the page scrolls
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true }); onScroll();

// Safe-to-spend calculator
(function () {
  const $ = id => document.getElementById(id);
  const budget = $("c-budget"), spent = $("c-spent");
  if (!budget) return;
  let money;
  try { money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }
  catch { money = { format: n => "$" + Math.round(n) }; }
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  $("r-month").textContent = now.toLocaleDateString(undefined, { month: "long" }) + " · day " + now.getDate() + " of " + daysInMonth;
  function update() {
    const b = +budget.value, s = +spent.value, left = b - s;
    $("o-budget").textContent = money.format(b);
    $("o-spent").textContent = money.format(s);
    if (left >= 0) {
      $("r-day").textContent = money.format(left / daysLeft);
      $("r-note").innerHTML = "<b>" + money.format(left) + "</b> left for the next " + daysLeft + " day" + (daysLeft === 1 ? "" : "s");
    } else {
      $("r-day").textContent = money.format(0);
      $("r-note").innerHTML = "<b>" + money.format(-left) + "</b> over budget this month";
    }
    const pct = Math.min(100, Math.round((s / b) * 100));
    $("r-bar").style.width = pct + "%";
    $("r-used").textContent = pct + "% used";
  }
  budget.addEventListener("input", update); spent.addEventListener("input", update); update();
})();

// Product tour tabs
(function () {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const img = document.getElementById("tour-img"), dark = document.getElementById("tour-dark"), panel = document.getElementById("tour-panel");
  if (!tabs.length || !img) return;
  function select(tab, focus) {
    tabs.forEach(t => { const on = t === tab; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    const name = tab.dataset.shot;
    img.style.opacity = 0;
    setTimeout(() => {
      dark.srcset = "screen-" + name + "-dark.webp";
      img.src = "screen-" + name + ".webp";
      img.alt = "My Money " + tab.querySelector(".t").textContent.trim() + " screen";
      img.style.opacity = 1;
    }, 120);
    panel.setAttribute("aria-labelledby", tab.id);
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", e => {
      const k = e.key; let n = null;
      if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === "Home") n = tabs[0];
      if (k === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });
  // Preload the other screens so switching is instant
  addEventListener("load", () => tabs.forEach(t => { const i = new Image(); i.src = "screen-" + t.dataset.shot + (matchMedia("(prefers-color-scheme: dark)").matches ? "-dark" : "") + ".webp"; }));
})();
