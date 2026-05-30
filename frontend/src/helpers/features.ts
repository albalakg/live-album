export function isWhatsAppEnabled(): boolean {
  return process.env.VUE_APP_WHATSAPP_ENABLED === "true";
}
