export type InlinePart = {
  type: "text" | "strong" | "link";
  text: string;
  href?: string;
};

export function parseInline(input: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input))) {
    if (match.index > cursor) {
      parts.push({ type: "text", text: input.slice(cursor, match.index) });
    }
    if (match[1] != null) {
      parts.push({ type: "strong", text: match[1] });
    } else {
      parts.push({ type: "link", text: match[2], href: match[3] });
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < input.length) {
    parts.push({ type: "text", text: input.slice(cursor) });
  }
  return parts;
}
