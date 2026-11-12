/**
 * One GA4 loader for the whole page.
 *
 * The live homepage (checked 2026-11-12) contains two full snippets: one in
 * <head> and a second between </head> and <body>. Each snippet requests
 * gtag/js?id=… and calls gtag('config'), so the tag starts twice. Two loads
 * × (library hit + config page_view) is the four hits reported in GA4.
 * The stray copy was removed from apps/web. This installer sets a flag and
 * refuses to run a second time.
 */

export function analyticsBootstrapSource(options) {
  const ga4Id = (options && options.ga4Id ? String(options.ga4Id) : "").trim();
  const metaPixelId = (
    options && options.metaPixelId ? String(options.metaPixelId) : ""
  ).trim();

  return `(function () {
if (window.__snapshareAnalytics) return;
window.__snapshareAnalytics = true;
var ga4Id = ${JSON.stringify(ga4Id)};
var metaPixelId = ${JSON.stringify(metaPixelId)};
if (ga4Id) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ga4Id);
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4Id);
  document.head.appendChild(ga);
}
if (metaPixelId) {
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', metaPixelId);
  window.fbq('track', 'PageView');
}
})();`;
}

export function installAnalytics(options) {
  if (typeof window === "undefined") return;
  if (window.__snapshareAnalytics) return;
  const run = new Function(analyticsBootstrapSource(options || {}));
  run();
}
