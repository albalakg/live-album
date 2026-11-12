/**
 * Claims the SEO proposal marks as awaiting Gal's confirmation.
 * They stay in the landing source but are not rendered while this flag is false.
 */
export const ENABLE_PENDING_CLAIMS = false;

const COMPUTER_BROWSER = ["מחשב עם דפדפן", "מחשב שמחובר", "גם המחשב"];

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
