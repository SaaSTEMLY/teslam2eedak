/**
 * Metadata stored on API keys for token delegation tracking.
 */
export interface ApiKeyMetadata {
  parentKeyId?: string;
  parentKeyName?: string;
  createdVia?: "delegation";
}

/**
 * Safely parse API key metadata, handling Better-Auth's potential
 * double-stringification of the metadata JSON field.
 */
export function parseApiKeyMetadata(raw: unknown): ApiKeyMetadata | null {
  if (!raw) return null;

  // Already an object
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ApiKeyMetadata;
  }

  // String — may be single or double-stringified JSON
  if (typeof raw === "string") {
    try {
      let parsed: unknown = JSON.parse(raw);
      // Handle double-stringification
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) {
        return parsed as ApiKeyMetadata;
      }
    } catch {
      return null;
    }
  }

  return null;
}
