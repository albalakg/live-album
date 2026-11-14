/**
 * One-shot M2 generator: stock placeholders, art copy, CSS theme split,
 * fixtures JSON, and registry stock maps from mock sources.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import vm from "vm";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, "..");
const ROOT = path.resolve(WEB, "../..");
const MOCK = "C:/Users/Gal/snapshare-prompts/event-landing/mock";
const PUBLIC = path.join(WEB, "public/landing");
const AI = path.join(PUBLIC, "ai");
const ART = path.join(PUBLIC, "art");
const THEMES = path.join(WEB, "src/components/landing/themes");
const FIXTURES = path.join(WEB, "src/components/landing/fixtures");

const TEMPLATE_TYPE = {
  "wedding-1": "wedding",
  "wedding-2": "wedding",
  "barmitzvah-1": "barmitzvah",
  "barmitzvah-2": "barmitzvah",
  "birthday-1": "birthday",
  "birthday-2": "birthday",
  "brit-1": "brit",
  "brit-2": "brit",
  "corporate-1": "corporate",
  "corporate-2": "corporate",
  "party-1": "party",
  "party-2": "party",
  "festival-1": "festival",
  "festival-2": "festival",
};

const TYPE_COLORS = {
  wedding: { bg: "#F4EDE3", a: "#B8894A", b: "#B76E79" },
  barmitzvah: { bg: "#F3F6F0", a: "#1F7A72", b: "#C9A36A" },
  birthday: { bg: "#FFF6F3", a: "#E15A6A", b: "#7B4BAA" },
  brit: { bg: "#F3F0E8", a: "#6B7F5A", b: "#C4A882" },
  corporate: { bg: "#EEF1F3", a: "#3D6A80", b: "#8AA0AC" },
  party: { bg: "#1A1028", a: "#FF2E9A", b: "#41F3FF" },
  festival: { bg: "#2A1810", a: "#FF8A3A", b: "#FFD080" },
};

const TYPE_ALTS = {
  wedding: {
    hero: "רקע חתונה דקורטיבי",
    albums: [
      "עיטור פרחוני לחתונה",
      "מרקם זהב רך",
      "פרחים לדוגמה",
      "רקע שנהב",
      "עיטור בוקה",
      "פרחים וזהב",
    ],
  },
  barmitzvah: {
    hero: "רקע בר/בת מצווה דקורטיבי",
    albums: [
      "עיטור טורקיז",
      "זהב חגיגי",
      "דפוס נייר גזור",
      "רקע טקסי",
      "עיטור כוכבים",
      "מרקם חגיגי",
    ],
  },
  birthday: {
    hero: "רקע יום הולדת דקורטיבי",
    albums: [
      "בלונים לדוגמה",
      "קונפטי דקורטיבי",
      "עיטור חגיגי",
      "רקע צבעוני",
      "סרטים וקישוט",
      "אווירת מסיבה",
    ],
  },
  brit: {
    hero: "רקע ברית דקורטיבי",
    albums: [
      "עלי זית",
      "עיטור רך",
      "חבל כביסה דקורטיבי",
      "דובי איור",
      "סוס נדנדה איור",
      "רקע חמים",
    ],
  },
  corporate: {
    hero: "רקע אירוע חברה דקורטיבי",
    albums: [
      "זכוכית ופלדה",
      "דפוס גיאומטרי",
      "רקע מקצועי",
      "זהב ערב",
      "קווים נקיים",
      "אווירת כנס",
    ],
  },
  party: {
    hero: "רקע מסיבה דקורטיבי",
    albums: [
      "ניאון דקורטיבי",
      "אורות מסיבה",
      "רטרו שמשות",
      "קונפטי צבעוני",
      "רקע לילה",
      "אווירת רחבה",
    ],
  },
  festival: {
    hero: "רקע פסטיבל דקורטיבי",
    albums: [
      "שקיעה דקורטיבית",
      "אופק שטח",
      "מקרמה",
      "אורות חמים",
      "בוהו דקורטיבי",
      "שטח פתוח",
    ],
  },
};

const HERO_ART = {
  "wedding-1": "blush",
  "wedding-2": "espresso",
  "barmitzvah-1": "teal",
  "barmitzvah-2": "navy",
  "birthday-1": "balloons",
  "birthday-2": "adult",
  "brit-1": "olive",
  "brit-2": "clothes",
  "corporate-1": "glass",
  "corporate-2": "gala",
  "party-1": "neon",
  "party-2": "retro",
  "festival-1": "sunset",
  "festival-2": "boho",
};

const M1 = {
  "wedding-1": {
    type: "wedding",
    name_he: "חתונה קלאסית",
    dark: false,
    heroStyle: "card",
    default_font: "Frank Ruhl Libre",
    gallery_style: "masonry",
    palettes: {
      default: {
        background_type: "LIGHT",
        primary: "#B8894A",
        secondary: "#B76E79",
        accent: "#B76E79",
        background: "#F4EDE3",
        text: "#3A2A22",
      },
      blush: {
        background_type: "LIGHT",
        primary: "#A67B45",
        secondary: "#C47A84",
        accent: "#C47A84",
        background: "#F7EDE8",
        text: "#3A2A22",
      },
      ivory: {
        background_type: "LIGHT",
        primary: "#A8925C",
        secondary: "#9A7A72",
        accent: "#A8925C",
        background: "#F7F2EA",
        text: "#2E241E",
      },
    },
    allowed_sections: [
      "STORY",
      "PEOPLE",
      "EVENT_TIMELINE",
      "CARDS",
      "GALLERY",
      "STEPS",
      "MAP",
      "WISHING_WELL",
      "RSVP",
      "FAQ",
      "HERO_COUNTDOWN",
      "FOOTER",
      "SNAPSHARE_CTA",
      "RICH_TEXT",
      "TRIVIA_CTA",
    ],
    default_enabled: {
      STORY: true,
      PEOPLE: true,
      EVENT_TIMELINE: true,
      CARDS: true,
      GALLERY: true,
      STEPS: true,
      MAP: true,
      FAQ: true,
      WISHING_WELL: false,
      RSVP: false,
      HERO_COUNTDOWN: true,
      FOOTER: true,
      SNAPSHARE_CTA: true,
      RICH_TEXT: false,
      TRIVIA_CTA: false,
    },
  },
};

function loadMockTemplates() {
  const src = fs.readFileSync(path.join(MOCK, "templates.js"), "utf8");
  const sandbox = { window: {}, console };
  vm.runInNewContext(src, sandbox);
  return sandbox.window.SNAP_TEMPLATES;
}

function svgGradient(w, h, c) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg}"/>
      <stop offset="55%" stop-color="${c.a}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${c.b}" stop-opacity="0.45"/>
    </linearGradient>
    <pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="1.5" fill="${c.a}" opacity="0.25"/>
      <circle cx="32" cy="28" r="1.2" fill="${c.b}" opacity="0.2"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#p)"/>
</svg>`;
  return Buffer.from(svg);
}

async function writePlaceholderJpg(outPath, colors, w = 1200, h = 900) {
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(svgGradient(w, h, colors)).jpeg({ quality: 78 }).toFile(outPath);
}

async function generatePlaceholdersAndManifest() {
  const types = [...new Set(Object.values(TEMPLATE_TYPE))];
  const pools = {};
  for (const type of types) {
    const colors = TYPE_COLORS[type];
    const alts = TYPE_ALTS[type];
    const dir = path.join(AI, type);
    await fs.promises.mkdir(dir, { recursive: true });
    await writePlaceholderJpg(path.join(dir, "hero.jpg"), colors, 1600, 2000);
    const files = { hero: { file: "hero.jpg", alt: alts.hero } };
    for (let i = 1; i <= 6; i++) {
      const name = `album-${i}.jpg`;
      const tint = {
        bg: colors.bg,
        a: i % 2 ? colors.a : colors.b,
        b: i % 2 ? colors.b : colors.a,
      };
      await writePlaceholderJpg(path.join(dir, name), tint, 1000, 1250);
      files[`album-${i}`] = { file: name, alt: alts.albums[i - 1] };
    }
    pools[type] = files;
  }

  const templates = {};
  for (const [id, type] of Object.entries(TEMPLATE_TYPE)) {
    templates[id] = type;
  }

  const manifest = {
    version: 1,
    note: "Placeholder stock until real AI/landing assets land. Paths are relative to /landing/ai/{type}/.",
    templates,
    pools,
  };
  await fs.promises.writeFile(
    path.join(AI, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );
  return manifest;
}

async function copyArt() {
  await fs.promises.mkdir(ART, { recursive: true });
  const heroes = path.join(MOCK, "assets/heroes");
  const gallery = path.join(MOCK, "assets/gallery");
  for (const file of fs.readdirSync(heroes)) {
    if (!/\.(webp|png|jpg|jpeg|svg)$/i.test(file)) continue;
    await fs.promises.copyFile(path.join(heroes, file), path.join(ART, file));
  }
  for (const file of fs.readdirSync(gallery)) {
    if (/^album-\d+/i.test(file)) continue; // never copy Amit & Gal album photos
    if (!/\.(webp|png|jpg|jpeg|svg)$/i.test(file)) continue;
    await fs.promises.copyFile(path.join(gallery, file), path.join(ART, file));
  }
}

function splitThemes() {
  const css = fs.readFileSync(path.join(MOCK, "styles.css"), "utf8");
  const themeStart = css.indexOf("/* ========== Themes ========== */");
  const expanded = css.indexOf("/* ========== Expanded sections ========== */");
  const sharedEnd = themeStart === -1 ? css.length : themeStart;
  let base = css.slice(0, sharedEnd);
  // Remap asset URLs used in shared CSS if any
  base = base.replace(/url\("assets\/heroes\//g, 'url("/landing/art/');
  base = base.replace(/url\('assets\/heroes\//g, "url('/landing/art/");
  base = base.replace(/url\("assets\/gallery\//g, 'url("/landing/art/');
  base = base.replace(/url\('assets\/gallery\//g, "url('/landing/art/");

  // Scale vars + landing root helpers
  const extras = `
/* M2 scale + landing shell */
.landing-root {
  --scale: 1;
  font-size: calc(17px * var(--scale));
}
.landing-root[data-scale="S"] { --scale: 0.92; }
.landing-root[data-scale="M"] { --scale: 1; }
.landing-root[data-scale="L"] { --scale: 1.08; }
.landing-root .page {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body, var(--font));
  min-height: 100dvh;
}
.preview-note {
  display: inline-block;
  margin-inline-start: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--muted);
  opacity: 0.9;
}
.landing-root a[aria-disabled="true"],
.landing-root button[aria-disabled="true"] {
  opacity: 0.55;
  pointer-events: none;
}
`;

  fs.mkdirSync(THEMES, { recursive: true });
  fs.writeFileSync(path.join(THEMES, "base.css"), base + extras, "utf8");

  const themeBlock =
    themeStart === -1
      ? ""
      : css.slice(themeStart, expanded === -1 ? css.length : expanded);
  const rest =
    expanded === -1 ? "" : css.slice(expanded).replace(/^\/\* ========== Expanded sections ========== \*\/\s*/, "");

  // Append expanded section styles into base
  fs.appendFileSync(
    path.join(THEMES, "base.css"),
    "\n/* Expanded sections from mock */\n" +
      rest
        .replace(/url\("assets\/heroes\//g, 'url("/landing/art/')
        .replace(/url\('assets\/heroes\//g, "url('/landing/art/")
        .replace(/url\("assets\/gallery\//g, 'url("/landing/art/')
        .replace(/url\('assets\/gallery\//g, "url('/landing/art/"),
    "utf8"
  );

  const ids = Object.keys(TEMPLATE_TYPE);
  for (const id of ids) {
    const re = new RegExp(`\\/\\*\\s*\\d+\\.[^*]*\\*\\/\\s*\\.t-${id}\\s*\\{[\\s\\S]*?(?=\\/\\*\\s*\\d+\\.|\\/\\* Dark page|\\/\\* Decor|\\/\\* Shot|@media|$)`);
    let chunk = "";
    const m = themeBlock.match(
      new RegExp(
        `(\\/\\*[^*]*\\*\\/\\s*)?\\.t-${id}\\s*\\{[\\s\\S]*?(?=\\.t-(?:wedding|barmitzvah|birthday|brit|corporate|party|festival)-|\\/\\* Dark page|\\/\\* Decor|\\/\\* Shot|$)`
      )
    );
    if (m) chunk = m[0];
    // Also capture related rules like .t-wedding-1 .block.alt
    const related = [];
    const relRe = new RegExp(`\\.t-${id}[^{]*\\{[^}]*\\}`, "g");
    let rm;
    while ((rm = relRe.exec(themeBlock))) {
      if (!chunk.includes(rm[0])) related.push(rm[0]);
    }
    // Prefer collecting all .t-id rules until next template comment
    const startIdx = themeBlock.indexOf(`.t-${id}`);
    let endIdx = themeBlock.length;
    for (const other of ids) {
      if (other === id) continue;
      const oi = themeBlock.indexOf(`.t-${other} {`);
      if (oi !== -1 && oi > startIdx && oi < endIdx) endIdx = oi;
    }
    const darkIdx = themeBlock.indexOf("/* Dark page helpers */");
    if (darkIdx !== -1 && darkIdx > startIdx && darkIdx < endIdx) endIdx = darkIdx;
    chunk = startIdx === -1 ? "" : themeBlock.slice(startIdx, endIdx).trim() + "\n";

    chunk = chunk
      .replace(/url\("assets\/heroes\//g, 'url("/landing/art/')
      .replace(/url\('assets\/heroes\//g, "url('/landing/art/")
      .replace(/url\("assets\/gallery\//g, 'url("/landing/art/')
      .replace(/url\('assets\/gallery\//g, "url('/landing/art/");

    fs.writeFileSync(path.join(THEMES, `${id}.css`), chunk, "utf8");
  }
}

function artKeyFromSrc(src) {
  if (!src) return null;
  const base = path.basename(src);
  if (/^album-\d+/i.test(base)) return null;
  const stem = base.replace(/\.(webp|jpg|jpeg|png|svg)$/i, "");
  return `art/${stem}`;
}

function stockImageRef(key) {
  return { stock: key };
}

function convertBlockImages(templateId, block) {
  const data = { ...block };
  delete data.type;
  delete data.id;

  // Rename imageCaption → image_caption
  if (data.imageCaption) {
    data.image_caption = data.imageCaption;
    delete data.imageCaption;
  }

  if (typeof data.image === "string") {
    const key = artKeyFromSrc(data.image);
    data.image = key ? stockImageRef(key) : null;
  }

  if (Array.isArray(data.images)) {
    let albumN = 1;
    data.images = data.images.map((im) => {
      const src = im.src || "";
      const base = path.basename(src);
      if (/^album-\d+/i.test(base) || im.real) {
        const n = Math.min(albumN++, 6);
        return {
          image: stockImageRef(`${templateId}/album-${n}`),
          caption: im.caption || TYPE_ALTS[TEMPLATE_TYPE[templateId]].albums[n - 1],
        };
      }
      const key = artKeyFromSrc(src);
      return {
        image: key ? stockImageRef(key) : stockImageRef(`${templateId}/album-${Math.min(albumN, 6)}`),
        caption: im.caption || "",
      };
    });
  }

  if (Array.isArray(data.photos)) {
    let albumN = 1;
    data.photos = data.photos.map((ph) => {
      const src = ph.src || "";
      if (/album-\d+/i.test(src) || ph.real) {
        const n = Math.min(albumN++, 6);
        return {
          image: stockImageRef(`${templateId}/album-${n}`),
          caption: ph.caption || "",
        };
      }
      const key = artKeyFromSrc(src);
      return {
        image: key ? stockImageRef(key) : null,
        caption: ph.caption || "",
      };
    });
  }

  if (Array.isArray(data.items) && data.items[0] && data.items[0].src) {
    // BABY_ELEMENTS style
    data.items = data.items.map((it) => {
      if (!it.src) return it;
      const key = artKeyFromSrc(it.src);
      return { ...it, image: key ? stockImageRef(key) : null, src: undefined };
    });
  }

  return data;
}

function buildHubConfig(t, { allEnabled = false } = {}) {
  const meta = requireM1Meta(t.id);
  const blocks = [];
  let order = 1;

  blocks.push({
    id: "hero",
    type: "HERO_COUNTDOWN",
    enabled: true,
    order: order++,
    data: {
      title: t.event.title,
      event_date: t.event.dateISO,
      kicker: t.event.kicker,
      venue: t.event.venue,
      city: t.event.city,
      welcome_heading: t.event.welcomeHeading,
      welcome: t.event.welcome,
      date_he: t.event.dateHe,
      time_he: t.event.timeHe,
      cover: stockImageRef(`${t.id}/hero`),
    },
  });

  for (const b of t.blocks) {
    const type = b.type;
    const enabled = allEnabled
      ? true
      : meta.default_enabled[type] !== undefined
        ? meta.default_enabled[type]
        : true;
    blocks.push({
      id: b.id,
      type,
      enabled,
      order: order++,
      data: convertBlockImages(t.id, b),
    });
  }

  // Ensure SNAPSHARE_CTA exists for defaults where listed
  if (!blocks.some((x) => x.type === "SNAPSHARE_CTA")) {
    blocks.push({
      id: "snapshare_cta",
      type: "SNAPSHARE_CTA",
      enabled: allEnabled ? true : meta.default_enabled.SNAPSHARE_CTA !== false,
      order: order++,
      data: {
        button_text: "העלו תמונות",
        subtitle: "בלי אפליקציה",
      },
    });
  }

  blocks.push({
    id: "footer",
    type: "FOOTER",
    enabled: true,
    order: order++,
    data: {
      note: "העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי.",
    },
  });

  // Re-number orders
  blocks.forEach((b, i) => {
    b.order = i + 1;
  });

  return {
    template_id: t.id,
    theme: {
      palette_id: "default",
      background_type: t.dark ? "DARK" : "LIGHT",
      font_family: meta.default_font,
      scale: "M",
      cover: stockImageRef(`${t.id}/hero`),
      colors: {
        primary: meta.palettes.default.primary,
        secondary: meta.palettes.default.secondary,
        accent: meta.palettes.default.accent,
        background: meta.palettes.default.background,
        text: meta.palettes.default.text,
      },
    },
    blocks,
  };
}

function requireM1Meta(id) {
  // Inline full M1 metadata from event_landing.php (already known)
  return FULL_M1[id];
}

const FULL_M1 = JSON.parse(
  fs.readFileSync(
    // We'll write this next; for bootstrap use embedded from PHP extract
    path.join(__dirname, "m1-templates.json"),
    "utf8"
  )
);

function writeFixtures(templates) {
  fs.mkdirSync(FIXTURES, { recursive: true });
  const index = [];
  for (const t of templates) {
    const hub = buildHubConfig(t, { allEnabled: true });
    // Force WISHING_WELL / RSVP / BEEN_THERE enabled in fixtures
    for (const b of hub.blocks) {
      if (["WISHING_WELL", "RSVP", "BEEN_THERE"].includes(b.type)) {
        b.enabled = true;
      } else {
        b.enabled = true;
      }
    }
    const file = `${t.id}.ts`;
    const body = `import type { HubConfig } from "../types";\n\nconst hubConfig: HubConfig = ${JSON.stringify(hub, null, 2)};\n\nexport default hubConfig;\n`;
    fs.writeFileSync(path.join(FIXTURES, file), body, "utf8");
    index.push(t.id);
  }
  const indexBody = `import type { HubConfig } from "../types";\n\n${index
    .map((id) => `import ${id.replace(/-/g, "_")} from "./${id}";`)
    .join("\n")}\n\nexport const landingFixtures: Record<string, HubConfig> = {\n${index
    .map((id) => `  "${id}": ${id.replace(/-/g, "_")},`)
    .join("\n")}\n};\n\nexport const landingFixtureIds = Object.keys(landingFixtures);\n`;
  fs.writeFileSync(path.join(FIXTURES, "index.ts"), indexBody, "utf8");
}

function writeDefaults(templates) {
  const out = {};
  for (const t of templates) {
    out[t.id] = buildHubConfig(t, { allEnabled: false });
  }
  fs.writeFileSync(
    path.join(WEB, "src/components/landing/templates/defaultHubConfigs.json"),
    JSON.stringify(out, null, 2) + "\n",
    "utf8"
  );
  return out;
}

function writeNavAndMeta(templates) {
  const meta = {};
  for (const t of templates) {
    const m = FULL_M1[t.id];
    meta[t.id] = {
      id: t.id,
      type: t.type,
      name_he: t.nameHe,
      type_he: t.typeHe,
      direction: t.direction,
      dark: t.dark,
      heroStyle: t.heroStyle,
      slug: t.slug,
      gallery_style: m.gallery_style,
      default_font: m.default_font,
      palettes: m.palettes,
      allowed_sections: m.allowed_sections,
      default_enabled: m.default_enabled,
      nav: t.nav,
      hero_art: HERO_ART[t.id],
      stock_keys: [
        `${t.id}/hero`,
        ...[1, 2, 3, 4, 5, 6].map((n) => `${t.id}/album-${n}`),
      ],
    };
  }
  fs.writeFileSync(
    path.join(WEB, "src/components/landing/templates/templateMeta.json"),
    JSON.stringify(meta, null, 2) + "\n",
    "utf8"
  );
}

async function main() {
  console.log("Generating placeholders + manifest…");
  await generatePlaceholdersAndManifest();
  console.log("Copying decorative art…");
  await copyArt();
  console.log("Splitting theme CSS…");
  splitThemes();
  console.log("Loading mock templates…");
  const templates = loadMockTemplates();
  console.log("Writing fixtures + defaults…");
  writeFixtures(templates);
  writeDefaults(templates);
  writeNavAndMeta(templates);
  console.log("Done.", {
    templates: templates.length,
    art: fs.readdirSync(ART).length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
