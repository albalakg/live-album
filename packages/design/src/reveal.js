const SELECTOR = ".reveal";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReduced() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function mark(el) {
  el.classList.add("in");
}

function markAll(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll(SELECTOR).forEach(mark);
  if (scope.matches && scope.matches(SELECTOR)) mark(scope);
}

let observer = null;
let mutations = null;
let fallback = 0;
let started = false;

function scan(root) {
  if (!root) return;
  if (prefersReduced() || !observer) {
    markAll(root.nodeType === 1 && root.matches && root.matches(SELECTOR) ? root.parentElement || document : root);
    return;
  }

  const nodes = [];
  if (root.nodeType === 1 && root.matches && root.matches(SELECTOR)) nodes.push(root);
  if (root.querySelectorAll) {
    root.querySelectorAll(SELECTOR).forEach((node) => nodes.push(node));
  }

  const height = window.innerHeight || document.documentElement.clientHeight;
  nodes.forEach((el) => {
    if (el.classList.contains("in")) return;
    const rect = el.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < height * 0.92;
    if (visible) mark(el);
    else observer.observe(el);
  });
}

function arm() {
  if (started) return;
  started = true;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      mark(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  mutations = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) scan(node);
      });
    });
  });
  mutations.observe(document.documentElement, { childList: true, subtree: true });
}

/**
 * Reveal `.reveal` elements as they enter the viewport, including nodes added
 * later (Vue islands, route changes). Safe to call more than once.
 * Content stays visible when JS never runs, or when the user prefers reduced motion.
 */
export function installReveal() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (prefersReduced() || !("IntersectionObserver" in window)) {
    root.classList.remove("js-reveal");
    markAll(document);
    return;
  }

  root.classList.add("js-reveal");
  arm();
  scan(document);

  window.clearTimeout(fallback);
  fallback = window.setTimeout(() => markAll(document), 1500);
}
