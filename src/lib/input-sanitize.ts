const HTML_TAG_PATTERN = /<[^>]*>/g;
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URI_PATTERN = /javascript\s*:/gi;

export function sanitizeInput(input: string): string {
  return input
    .replace(SCRIPT_PATTERN, "")
    .replace(EVENT_HANDLER_PATTERN, "")
    .replace(JAVASCRIPT_URI_PATTERN, "")
    .replace(HTML_TAG_PATTERN, "")
    .trim();
}

export function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
