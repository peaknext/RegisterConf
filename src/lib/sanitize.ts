import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize string input to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return "";

  // First, use DOMPurify to clean HTML
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
  });

  // Additional cleanup
  return cleaned
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .slice(0, 10000); // Limit length to prevent DoS
}

/**
 * Sanitize HTML content (for rich text fields)
 * Allows safe HTML tags only
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "u", "strong", "em",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return "";

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w.@+-]/g, "") // Only allow valid email characters
    .slice(0, 254); // Max email length per RFC 5321
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return "";

  return phone
    .replace(/[^\d+\-() ]/g, "") // Only allow digits and common phone chars
    .trim()
    .slice(0, 20);
}

/**
 * Sanitize numeric string (for IDs, etc.)
 */
export function sanitizeNumeric(input: string | null | undefined): string {
  if (!input) return "";

  return input.replace(/\D/g, "").slice(0, 20);
}

/**
 * Sanitize alphanumeric code (for hospital codes, etc.)
 */
export function sanitizeCode(input: string | null | undefined): string {
  if (!input) return "";

  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 50);
}

/**
 * Sanitize object with string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldConfig?: Partial<Record<keyof T, "string" | "html" | "email" | "phone" | "code" | "skip">>
): T {
  const result = { ...obj };

  for (const key of Object.keys(result) as (keyof T)[]) {
    const value = result[key];
    const config = fieldConfig?.[key] || "string";

    if (typeof value === "string" && config !== "skip") {
      switch (config) {
        case "html":
          (result[key] as unknown) = sanitizeHtml(value);
          break;
        case "email":
          (result[key] as unknown) = sanitizeEmail(value);
          break;
        case "phone":
          (result[key] as unknown) = sanitizePhone(value);
          break;
        case "code":
          (result[key] as unknown) = sanitizeCode(value);
          break;
        default:
          (result[key] as unknown) = sanitizeString(value);
      }
    }
  }

  return result;
}
