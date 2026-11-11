if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch { } }
document.getElementById("yr").textContent = new Date().getFullYear();
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
