import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK = "C:/Users/Gal/snapshare-prompts/event-landing/mock/styles.css";
const THEMES = path.join(__dirname, "../src/components/landing/themes");
const css = fs.readFileSync(MOCK, "utf8");
const ids = [
  "wedding-1",
  "wedding-2",
  "barmitzvah-1",
  "barmitzvah-2",
  "birthday-1",
  "birthday-2",
  "brit-1",
  "brit-2",
  "corporate-1",
  "corporate-2",
  "party-1",
  "party-2",
  "festival-1",
  "festival-2",
];

const themeStart = css.indexOf("/* ========== Themes ========== */");
const darkIdx = css.indexOf("/* Dark page helpers */");
const expanded = css.indexOf("/* ========== Expanded sections ========== */");
const themeBlock = css.slice(themeStart, darkIdx);

function remap(s) {
  return s
    .replace(/url\("assets\/heroes\//g, 'url("/landing/art/')
    .replace(/url\('assets\/heroes\//g, "url('/landing/art/")
    .replace(/url\("assets\/gallery\//g, 'url("/landing/art/')
    .replace(/url\('assets\/gallery\//g, "url('/landing/art/");
}

for (let i = 0; i < ids.length; i++) {
  const id = ids[i];
  const start = themeBlock.indexOf(`.t-${id} {`);
  let end = themeBlock.length;
  for (let j = i + 1; j < ids.length; j++) {
    const oi = themeBlock.indexOf(`.t-${ids[j]} {`);
    if (oi !== -1 && oi > start && oi < end) end = oi;
  }
  let sliceStart = start;
  const before = themeBlock.lastIndexOf("/*", start);
  const prevStart = i ? themeBlock.indexOf(`.t-${ids[i - 1]} {`) : 0;
  if (before !== -1 && before > prevStart && start - before < 120) sliceStart = before;
  let chunk = themeBlock.slice(sliceStart, end).trim() + "\n";
  // Remove trailing next-template comment if present without rules
  chunk = chunk.replace(/\n\/\*\s*\d+\.[\s\S]*$/m, "\n");
  fs.writeFileSync(path.join(THEMES, `${id}.css`), remap(chunk));
}

const shared = css.slice(darkIdx, expanded);
const basePath = path.join(THEMES, "base.css");
let base = fs.readFileSync(basePath, "utf8");
if (!base.includes("Dark page helpers")) {
  base += "\n" + remap(shared);
  fs.writeFileSync(basePath, base);
}

console.log(
  "themes fixed",
  ids.map((id) => [id, fs.statSync(path.join(THEMES, `${id}.css`)).size])
);
