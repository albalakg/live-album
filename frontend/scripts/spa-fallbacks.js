/**
 * Copy the client-side shell (dist/spa.html) onto app and auth routes so
 * CloudFront/S3 can return 200 for those paths. Marketing routes are
 * prerendered separately and must not be overwritten.
 *
 * Auth and other non-indexable shells get a noindex robots meta so crawlers
 * that do not run JavaScript still see the directive.
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const shellPath = path.join(distDir, "spa.html");

const spaPaths = [
  "auth/google/callback",
  "login",
  "signup",
  "profile",
  "event",
  "forgot-password",
  "reset-password",
  "email-confirmation",
  "logout",
  "order/pay",
  "order/success",
  "order/failure",
  "design",
];

if (!fs.existsSync(shellPath)) {
  console.error("spa-fallbacks: dist/spa.html not found. Prerender should create it.");
  process.exit(1);
}

const shellHtml = fs.readFileSync(shellPath);

for (const routePath of spaPaths) {
  const dir = path.join(distDir, routePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), shellHtml);
}

const loginHtml = fs.readFileSync(path.join(distDir, "login", "index.html"), "utf8");
if (!/noindex/i.test(loginHtml)) {
  console.error("spa-fallbacks: /login shell is missing noindex");
  process.exit(1);
}
if (loginHtml.includes("אלבום תמונות חי לחתונה")) {
  console.error("spa-fallbacks: /login shell contains prerendered homepage content");
  process.exit(1);
}

console.log(`spa-fallbacks: wrote noindex shell for ${spaPaths.length} app/auth routes`);
