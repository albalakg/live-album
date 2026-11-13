import { notify as rawNotify } from "@kyvg/vue3-notification";

type NotifyPayload = {
  title?: string;
  text?: string;
  type?: string;
  duration?: number;
  speed?: number;
  data?: unknown;
  [key: string]: unknown;
};

function hasContent(options: NotifyPayload | string | undefined): boolean {
  if (options == null) return false;
  if (typeof options === "string") return options.trim().length > 0;
  const text = typeof options.text === "string" ? options.text.trim() : "";
  const title = typeof options.title === "string" ? options.title.trim() : "";
  return Boolean(text || title);
}

/** App-wide toast helper — never queues empty pink/blank bars. */
export function notify(options: NotifyPayload | string): void {
  if (!hasContent(options)) return;
  rawNotify(options as never);
}

export default notify;
