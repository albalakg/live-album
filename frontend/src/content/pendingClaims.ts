/**
 * Claims the SEO proposal marks as awaiting the owner's confirmation.
 * They stay in landing-pages.json (the source copy) but are not rendered
 * while this flag is false. Set it to true to publish them as written.
 */
export const ENABLE_PENDING_CLAIMS = false;

const COMPUTER_BROWSER = ["מחשב עם דפדפן", "מחשב שמחובר", "גם המחשב"];

/**
 * Returns the text to show, or null when the whole block should be omitted.
 * Mixed paragraphs keep the sentences that are not flagged.
 */
export function applyPendingClaims(text: string): string | null {
  if (ENABLE_PENDING_CLAIMS) return text;

  if (text.includes("אזור ניהול")) {
    const verified =
      "בהגדרות האירוע אפשר גם להחליט אם לאפשר העלאת סרטונים או רק תמונות.";
    return text.includes(verified) ? verified : null;
  }

  if (COMPUTER_BROWSER.some((snippet) => text.includes(snippet))) {
    const kept = text
      .split(". ")
      .filter((sentence) => !COMPUTER_BROWSER.some((snippet) => sentence.includes(snippet)))
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    const joined = kept
      .map((sentence) => (sentence.endsWith(".") ? sentence : `${sentence}.`))
      .join(" ")
      .trim();
    return joined.length ? joined : null;
  }

  return text;
}
