import { BUSINESS_EMAIL_DEFAULT, CONTACT_PROVIDER_DEFAULT } from "./site.js";

/**
 * Send a contact message without embedding secrets.
 * Returns { ok, via } where via is "laravel" | "formspree" | "web3forms" | "mailto".
 */
export async function sendContactMessage(fields, options = {}) {
  const provider = options.provider || CONTACT_PROVIDER_DEFAULT;
  const email = String(fields.email || "").trim();
  const fullName = String(fields.full_name || fields.fullName || "").trim();
  const text = String(fields.text || "").trim();
  const payload = { email, full_name: fullName, text };

  if (provider === "formspree" && options.formspreeId) {
    const response = await fetch(`https://formspree.io/f/${options.formspreeId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, via: "formspree" };
  }

  if (provider === "web3forms" && options.web3formsKey) {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: options.web3formsKey,
        email,
        name: fullName,
        message: text,
        subject: "SnapShare — פנייה מהאתר",
      }),
    });
    return { ok: response.ok, via: "web3forms" };
  }

  if (options.endpoint) {
    const response = await fetch(options.endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, via: "laravel" };
  }

  const inbox = options.businessEmail || BUSINESS_EMAIL_DEFAULT;
  const href = `mailto:${inbox}?subject=${encodeURIComponent("SnapShare — פנייה מהאתר")}&body=${encodeURIComponent(`${fullName}\n${email}\n\n${text}`)}`;
  if (typeof window !== "undefined") window.location.href = href;
  return { ok: true, via: "mailto" };
}
