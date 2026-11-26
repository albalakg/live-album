export function isWhatsAppEnabled(): boolean {
  return process.env.VUE_APP_WHATSAPP_ENABLED === "true";
}

/**
 * Seating builder + smart arrange (paid add-on candidate).
 * TODO(pricing): replace with the real per-event entitlement once Gal confirms packaging/price.
 * ON for local/dev builds unless VUE_APP_SEATING_ENABLED=false; other builds need VUE_APP_SEATING_ENABLED=true.
 * The server enforces its own flag (config/seating.php) regardless of this.
 */
export function isSeatingEnabled(): boolean {
  const flag = process.env.VUE_APP_SEATING_ENABLED;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development" || process.env.VUE_APP_ENV === "local";
}

/**
 * WhatsApp guest messaging workspace (templates, editable queue, automations, RSVP bot, inbox).
 * TODO(pricing): Pro add-on / top-up checkout not wired yet.
 * ON for local/dev builds unless VUE_APP_WHATSAPP_MESSAGING_ENABLED=false; other builds need =true.
 * The server enforces WHATSAPP_MESSAGING_ENABLED regardless of this.
 */
export function isWhatsAppMessagingEnabled(): boolean {
  const flag = process.env.VUE_APP_WHATSAPP_MESSAGING_ENABLED;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development" || process.env.VUE_APP_ENV === "local";
}
