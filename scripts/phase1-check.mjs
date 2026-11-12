import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { analyticsBootstrapSource } from "../packages/design/src/analytics.js";
import {
  GA4_MEASUREMENT_ID,
  PRICES,
  SHOW_LAUNCH_SALE_STRIKETHROUGH,
  GUEST_CTA,
  WHATSAPP_E164,
  BUSINESS_EMAIL_DEFAULT,
} from "../packages/design/src/site.js";

assert.equal(PRICES.trial, 0);
assert.equal(PRICES.classic, 200);
assert.equal(PRICES.premium, 300);
assert.equal(SHOW_LAUNCH_SALE_STRIKETHROUGH, false);
assert.equal(GUEST_CTA.query.utm_source, "album");
assert.equal(GUEST_CTA.query.utm_medium, "guest_cta");
assert.equal(GUEST_CTA.query.utm_campaign, "viral");
assert.equal(WHATSAPP_E164, "972528458600");
assert.equal(BUSINESS_EMAIL_DEFAULT, "hello@snapshare-live.com");
assert.equal(GA4_MEASUREMENT_ID, "G-XW53Y5YC3B");

const source = analyticsBootstrapSource({ ga4Id: "G-TEST", metaPixelId: "" });
assert.equal(source.split("gtag('config'").length - 1, 1);
assert.equal(source.split("gtag/js").length - 1, 1);
assert.ok(source.includes("__snapshareAnalytics"));

const pixel = analyticsBootstrapSource({ ga4Id: "G-TEST", metaPixelId: "PIXEL123" });
assert.equal(pixel.split("fbq('init'").length - 1, 1);
assert.ok(pixel.includes("PIXEL123"));
assert.equal(pixel.includes("PIXEL_ID"), false);

function runTwice(js) {
  const sandbox = {
    encodeURIComponent,
    document: {
      createElement() {
        return {};
      },
      head: { appendChild() {} },
      getElementsByTagName() {
        return [{ parentNode: { insertBefore() {} } }];
      },
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox);
  vm.runInContext(js, sandbox);
  return sandbox;
}

const once = runTwice(source);
const configs = once.dataLayer.filter((entry) => entry[0] === "config");
assert.equal(configs.length, 1);
assert.equal(configs[0][1], "G-TEST");
assert.equal(once.fbq, undefined);

const home = fs.readFileSync("apps/marketing/src/pages/index.astro", "utf8");
const cards = fs.readFileSync("apps/marketing/src/components/PricingCards.astro", "utf8");
assert.equal(home.includes("399"), false);
assert.equal(cards.includes("399"), false);
assert.equal(cards.includes("מבצע השקה"), false);
assert.ok(cards.includes("PRICES.classic"));
assert.ok(cards.includes("PRICES.premium"));

const webIndex = fs.readFileSync("apps/web/public/index.html", "utf8");
assert.equal(webIndex.includes("googletagmanager"), false);
assert.equal(webIndex.includes("gtag("), false);

const catalog = fs.readFileSync("apps/web/src/helpers/qrCardCatalog.ts", "utf8");
const files = [...catalog.matchAll(/file: "([^"]+)"/g)].map((match) => match[1]);
assert.equal(files.length, 11);
assert.equal(new Set(files).size, 11);

const landings = fs.readdirSync("apps/marketing/src/content/landing").filter((name) => name.endsWith(".json"));
assert.equal(landings.length, 8);

console.log("phase1 checks ok");
