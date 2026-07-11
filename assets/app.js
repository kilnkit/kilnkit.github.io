// kilnkit.com — the hero is the product demonstrating itself.
//
// A raw grey sphere is fired into a finished marble asset (a 2D heat sweep, the "kiln"),
// then hands off to a live 3D model you can drag and that turns slowly on its own. The
// firing is what the add-on does to a texture folder; the turning is Kilnkit's own render
// output made interactive.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stage = document.querySelector(".stage");
const kiln = document.querySelector(".kiln");
const viewer = document.querySelector(".hero-3d");
const refire = document.querySelector(".refire");

/* ── The live 3D model, loaded lazily so it never blocks first paint ── */
let vendorLoaded = false;
function loadVendor() {
  if (vendorLoaded) return;
  vendorLoaded = true;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "assets/vendor/model-viewer.min.js";
  document.head.appendChild(s);
}

let revealed = false;
function reveal3D() {
  if (revealed) return;
  revealed = true;
  loadVendor();
  // Only hand off to 3D once the model has actually loaded. If it never does (e.g. a
  // sandbox that blocks the model), the finished 2D marble poster simply stays — never
  // an empty hero.
  const show = () => {
    if (viewer.dismissPoster) viewer.dismissPoster();
    viewer.classList.add("shown");
    stage.classList.add("live");
    kiln.classList.add("gone");
    if (reduced && viewer.autoRotate !== undefined) viewer.autoRotate = false;
  };
  if (viewer.loaded) show();
  else viewer.addEventListener("load", show, { once: true });
}

/* ── The firing ─────────────────────────────────────────────────────── */
function fire() {
  stage.classList.remove("live");
  kiln.classList.remove("gone");
  viewer.classList.remove("shown");
  if (reduced) { kiln.classList.add("done"); reveal3D(); return; }
  kiln.classList.remove("done", "firing");
  void kiln.offsetWidth;                       // restart the animation
  kiln.classList.add("firing");
}
kiln.addEventListener("animationend", (e) => {
  if (e.animationName === "fire") {
    kiln.classList.remove("firing");
    kiln.classList.add("done");
    reveal3D();
  }
});
refire.addEventListener("click", () => {
  // Re-run the firing intro, then hand back to 3D.
  revealed = false;
  fire();
});

// Fire once the hero is actually on screen.
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting) { fire(); obs.disconnect(); }
}, { threshold: 0.4 }).observe(stage);

// Warm the 3D up during idle so the handoff after firing is instant.
(window.requestIdleCallback || ((f) => setTimeout(f, 1800)))(loadVendor);

/* ── Material switcher ───────────────────────────────────────────────── */
const swatches = document.querySelectorAll(".swatch");
const shots = document.querySelectorAll(".swap-stage img");
swatches.forEach((btn) => {
  btn.addEventListener("click", () => {
    swatches.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    shots.forEach((img) => img.classList.toggle("on", img.dataset.mat === btn.dataset.mat));
  });
});
