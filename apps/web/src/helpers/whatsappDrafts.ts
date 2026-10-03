export interface IWhatsAppMessageDraft {
  message: string;
  sendMode: "now" | "schedule";
  scheduledAt: string | null;
}

const STORAGE_PREFIX = "whatsapp-drafts";

function storageKey(eventId: number): string {
  return `${STORAGE_PREFIX}-${eventId}`;
}

export function loadWhatsAppDrafts(eventId: number): Record<number, IWhatsAppMessageDraft> {
  try {
    const raw = localStorage.getItem(storageKey(eventId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, IWhatsAppMessageDraft>;
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [Number(key), value])
    );
  } catch {
    return {};
  }
}

export function saveWhatsAppDraft(
  eventId: number,
  slotIndex: number,
  draft: IWhatsAppMessageDraft
): void {
  const drafts = loadWhatsAppDrafts(eventId);
  if (!draft.message.trim()) {
    delete drafts[slotIndex];
  } else {
    drafts[slotIndex] = draft;
  }
  localStorage.setItem(storageKey(eventId), JSON.stringify(drafts));
}

export function clearWhatsAppDraft(eventId: number, slotIndex: number): void {
  const drafts = loadWhatsAppDrafts(eventId);
  delete drafts[slotIndex];
  localStorage.setItem(storageKey(eventId), JSON.stringify(drafts));
}
