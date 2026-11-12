import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const webDist = path.join(root, "apps/web/dist");
const marketingDist = path.join(root, "apps/marketing/dist");
const out = path.join(root, "dist-site");

if (!existsSync(webDist) || !existsSync(marketingDist)) {
  console.error("Build apps/web and apps/marketing before assemble-site.");
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(webDist, out, { recursive: true });
const spa = path.join(out, "index.html");
if (!existsSync(spa)) {
  console.error("Vue build did not emit index.html");
  process.exit(1);
}
renameSync(spa, path.join(out, "spa.html"));
cpSync(marketingDist, out, { recursive: true });
console.log("Wrote", out);
