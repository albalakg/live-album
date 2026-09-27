/**
 * Render public marketing routes in a headless browser and write real HTML
 * into dist/. App and auth routes stay a client-side shell (see spa-fallbacks.js).
 *
 * Also copies the pre-render shell to dist/spa.html (noindex) for CloudFront
 * deep links, and refreshes dist/sitemap.xml lastmod.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const PORT = 4173;
const ORIGIN = "https://snapshare-live.com";

const ROUTES = [
  {
    path: "/",
    out: "index.html",
    expect: "אלבום תמונות חי לחתונה ולאירועים",
    title: "אלבום דיגיטלי שיתופי לאירועים עם QR | SnapShare",
    canonical: `${ORIGIN}/`,
    index: true,
    schema: ["Organization", "WebSite", "Service", "FAQPage"],
  },
  {
    path: "/contact-us",
    out: "contact-us/index.html",
    expect: "צרו איתנו קשר",
    title: "צור קשר | SnapShare",
    canonical: `${ORIGIN}/contact-us`,
    index: true,
    schema: ["Organization", "WebSite"],
  },
  {
    path: "/order",
    out: "order/index.html",
    expect: "הזמנת אלבום לאירוע",
    title: "מחירים לאלבום דיגיטלי לאירוע | SnapShare",
    canonical: `${ORIGIN}/order`,
    index: true,
    schema: ["Organization", "WebSite", "Service"],
  },
  {
    path: "/terms-and-conditions",
    out: "terms-and-conditions/index.html",
    expect: "תנאי שימוש",
    title: "תנאי שימוש | SnapShare",
    canonical: `${ORIGIN}/terms-and-conditions`,
    index: true,
    schema: ["Organization", "WebSite"],
  },
  {
    path: "/__seo_not_found__",
    out: "404.html",
    expect: "העמוד לא נמצא",
    title: "העמוד לא נמצא | SnapShare",
    canonical: null,
    index: false,
    schema: [],
  },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

function injectNoindex(html) {
  const tag = '<meta name="robots" content="noindex, nofollow">';
  if (/<meta\s+name=["']robots["']/i.test(html)) {
    return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, tag);
  }
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  let rel = decoded.replace(/^\/+/, "");
  if (rel.endsWith("/")) rel += "index.html";
  if (rel === "") rel = "index.html";
  const abs = path.normalize(path.join(distDir, rel));
  if (!abs.startsWith(distDir)) return path.join(distDir, "spa.html");
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  const nested = path.join(abs, "index.html");
  if (fs.existsSync(nested)) return nested;
  return path.join(distDir, "spa.html");
}

function startServer() {
  const server = http.createServer((req, res) => {
    const file = resolveFile(req.url || "/");
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end("missing");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function writeSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const locs = ["/", "/contact-us", "/order", "/terms-and-conditions"];
  const urls = locs
    .map(
      (loc) =>
        `  <url>\n    <loc>${ORIGIN}${loc === "/" ? "/" : loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml);
}

function assertRoute(route, html) {
  const errors = [];
  if (!html.includes(route.expect)) {
    errors.push(`missing expected text: ${route.expect}`);
  }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  if (title !== route.title) {
    errors.push(`title "${title}" !== "${route.title}"`);
  }
  if (/name=["']keywords["']/i.test(html)) {
    errors.push("meta keywords still present");
  }
  const gtag = html.match(/googletagmanager\.com\/gtag\/js/g) || [];
  if (gtag.length !== 1) {
    errors.push(`expected 1 GA4 snippet, found ${gtag.length}`);
  }
  if (!html.includes('lang="he"') || !html.includes('dir="rtl"')) {
    errors.push("missing lang=he or dir=rtl");
  }
  const robots = (html.match(/<meta[^>]*name=["']robots["'][^>]*>/i) || [])[0] || "";
  if (route.index) {
    if (!/index,\s*follow/i.test(robots)) errors.push(`robots not indexable: ${robots}`);
    if (!html.includes(`rel="canonical" href="${route.canonical}"`) &&
        !html.includes(`href="${route.canonical}" rel="canonical"`)) {
      const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i) || [])[0] || "";
      if (!canonical.includes(route.canonical)) {
        errors.push(`canonical missing ${route.canonical} (${canonical})`);
      }
    }
    for (const token of [
      "og:image",
      "og:image:width",
      "og:image:height",
      "og:locale",
      "he_IL",
      "/assets/og-image.jpg",
      'content="1200"',
      'content="630"',
    ]) {
      if (!html.includes(token)) errors.push(`missing ${token}`);
    }
    const ldMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (!ldMatch) {
      errors.push("missing JSON-LD");
    } else {
      const ld = ldMatch[1];
      if (/AggregateRating/i.test(ld)) errors.push("JSON-LD includes AggregateRating");
      for (const typeName of route.schema) {
        if (!ld.includes(`"${typeName}"`) && !ld.includes(typeName)) {
          errors.push(`JSON-LD missing ${typeName}`);
        }
      }
      if (route.schema.includes("Service")) {
        for (const price of ['"0"', '"200"', '"300"']) {
          if (!ld.includes(price)) errors.push(`JSON-LD missing price ${price}`);
        }
        if (!ld.includes("קלאסי") || !ld.includes("פרימיום")) {
          errors.push("JSON-LD missing plan names");
        }
      }
      if (route.schema.includes("FAQPage") && !ld.includes("איך האורחים מעלים")) {
        errors.push("FAQPage missing FAQ content");
      }
    }
  } else if (!/noindex/i.test(robots)) {
    errors.push("not-found page is missing noindex");
  }

  if (errors.length) {
    throw new Error(`${route.path}:\n- ${errors.join("\n- ")}`);
  }
}

async function main() {
  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("prerender: dist/index.html not found. Run the Vue build first.");
    process.exit(1);
  }

  const shell = fs.readFileSync(indexPath, "utf8");
  fs.writeFileSync(path.join(distDir, "spa.html"), injectNoindex(shell));

  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (error) {
    console.error("prerender: playwright is not installed.", error.message);
    process.exit(1);
  }

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      locale: "he-IL",
      viewport: { width: 1280, height: 900 },
    });

    for (const route of ROUTES) {
      const url = `http://127.0.0.1:${PORT}${route.path}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForFunction(
        (snippet) => {
          const h1 = document.querySelector("h1");
          return Boolean(h1 && h1.textContent && h1.textContent.includes(snippet));
        },
        route.expect,
        { timeout: 30000 }
      );
      await page.waitForFunction(
        (shouldIndex) => {
          const robots = document.querySelector('meta[name="robots"]');
          if (!robots) return false;
          if (shouldIndex) {
            return /index/i.test(robots.content) &&
              Boolean(document.querySelector('link[rel="canonical"]')) &&
              Boolean(document.querySelector('script[type="application/ld+json"]'));
          }
          return /noindex/i.test(robots.content);
        },
        route.index,
        { timeout: 15000 }
      );

      await page.evaluate(() => {
        const nodes = [
          ...document.head.querySelectorAll("title"),
          ...document.head.querySelectorAll("meta[name], meta[property]"),
          ...document.head.querySelectorAll('link[rel="canonical"]'),
          ...document.head.querySelectorAll('script[type="application/ld+json"]'),
        ];
        const groups = new Map();
        const keyOf = (el) => {
          if (el.tagName === "TITLE") return "title";
          if (el.tagName === "LINK") return "canonical";
          if (el.tagName === "SCRIPT") return "ldjson";
          return (
            el.getAttribute("name") ||
            el.getAttribute("property") ||
            ""
          ).toLowerCase();
        };
        nodes.forEach((el) => {
          const key = keyOf(el);
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(el);
        });
        groups.forEach((list) => {
          while (list.length > 1) {
            const extra = list.shift();
            extra.parentNode && extra.parentNode.removeChild(extra);
          }
        });
      });

      const html = await page.content();
      assertRoute(route, html);
      const dest = path.join(distDir, route.out);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, html);
      console.log(`prerender: wrote ${route.out}`);
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  writeSitemap();
  console.log("prerender: updated dist/sitemap.xml");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
