/**
 * S3/CloudFront static hosting returns 404 for deep links unless each path
 * has an index.html or the CDN maps 404 -> /index.html.
 * Copy the built index.html to known Vue Router paths.
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");

const spaPaths = [
  "auth/google/callback",
  "login",
  "signup",
  "profile",
  "event",
  "order",
  "forgot-password",
  "reset-password",
  "email-confirmation",
  "contact-us",
  "terms-and-conditions",
];

if (!fs.existsSync(indexPath)) {
  console.error("spa-fallbacks: dist/index.html not found. Run build first.");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath);

for (const routePath of spaPaths) {
  const dir = path.join(distDir, routePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), indexHtml);
}

console.log(`spa-fallbacks: wrote index.html for ${spaPaths.length} routes`);
