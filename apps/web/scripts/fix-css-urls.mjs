import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const themes = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/landing/themes"
);

// From themes/*.css → public/landing/art/
const rel = "../../../../public/landing/art/";

for (const file of fs.readdirSync(themes)) {
  if (!file.endsWith(".css")) continue;
  const p = path.join(themes, file);
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/url\(["']?\/landing\/art\//g, `url("${rel}`);
  // normalize closing: url("...webp) may miss quote
  s = s.replace(/url\("(\.\.\/)+public\/landing\/art\/([^"')]+)["']?\)/g, `url("${rel}$2")`);
  fs.writeFileSync(p, s);
  console.log("fixed", file);
}
