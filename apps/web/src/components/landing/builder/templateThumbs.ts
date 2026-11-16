/* eslint-disable @typescript-eslint/no-var-requires */
/** Real renders of each template's hero (800x500). Key = template id. */
function asUrl(mod: unknown): string {
  if (typeof mod === "string") return mod;
  const d = (mod as { default?: unknown } | null)?.default;
  return typeof d === "string" ? d : "";
}

export const TEMPLATE_THUMBS: Record<string, string> = {
  "wedding-1": asUrl(require("@/assets/landing-thumbs/wedding-1.jpg")),
  "wedding-2": asUrl(require("@/assets/landing-thumbs/wedding-2.jpg")),
  "barmitzvah-1": asUrl(require("@/assets/landing-thumbs/barmitzvah-1.jpg")),
  "barmitzvah-2": asUrl(require("@/assets/landing-thumbs/barmitzvah-2.jpg")),
  "birthday-1": asUrl(require("@/assets/landing-thumbs/birthday-1.jpg")),
  "birthday-2": asUrl(require("@/assets/landing-thumbs/birthday-2.jpg")),
  "brit-1": asUrl(require("@/assets/landing-thumbs/brit-1.jpg")),
  "brit-2": asUrl(require("@/assets/landing-thumbs/brit-2.jpg")),
  "corporate-1": asUrl(require("@/assets/landing-thumbs/corporate-1.jpg")),
  "corporate-2": asUrl(require("@/assets/landing-thumbs/corporate-2.jpg")),
  "party-1": asUrl(require("@/assets/landing-thumbs/party-1.jpg")),
  "party-2": asUrl(require("@/assets/landing-thumbs/party-2.jpg")),
  "festival-1": asUrl(require("@/assets/landing-thumbs/festival-1.jpg")),
  "festival-2": asUrl(require("@/assets/landing-thumbs/festival-2.jpg")),
};

export function thumbFor(templateId: string): string {
  return TEMPLATE_THUMBS[templateId] || "";
}
