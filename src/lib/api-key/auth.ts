import { headers } from "next/headers";
import { getPayload } from "@/lib/payload";
import {
  type ApiScope,
  permissionsToScopes,
  scopesToPermissions,
} from "./scopes";
import { type ApiKeyMetadata, parseApiKeyMetadata } from "./metadata";

/**
 * Authenticate the request (cookie or API key) and optionally enforce scopes.
 *
 * - Cookie auth: scopes are not checked (full access for session users).
 * - API key auth: scopes are verified against the key's permissions.
 *
 * Returns the user or null if unauthenticated / insufficient scopes.
 */
export async function authenticateWithScopes(
  requiredScopes?: ApiScope[],
): Promise<{ id: string; email: string; name?: string | null } | null> {
  const payload = await getPayload();
  const headersList = await headers();

  // getSession handles both cookie and API key (via enableSessionForAPIKeys)
  const session = await payload.betterAuth.api.getSession({
    headers: headersList,
  });
  if (!session?.user) return null;

  // If request uses API key and scopes are required, verify permissions
  const apiKeyHeader = headersList.get("x-api-key");
  if (apiKeyHeader && requiredScopes?.length) {
    const permissions = scopesToPermissions(requiredScopes);
    const result = await payload.betterAuth.api.verifyApiKey({
      body: { key: apiKeyHeader, permissions },
    });
    if (!result?.valid) return null;
  }

  return session.user;
}

/**
 * Verify an API key and return its full details (id, name, scopes, metadata).
 * Does not enforce any specific scopes — just checks the key is valid.
 */
export async function getApiKeyDetails(apiKey: string): Promise<{
  id: string;
  name: string | null;
  userId: string;
  scopes: ApiScope[];
  permissions: Record<string, string[]>;
  metadata: ApiKeyMetadata | null;
} | null> {
  const payload = await getPayload();
  const result = await payload.betterAuth.api.verifyApiKey({
    body: { key: apiKey },
  });
  if (!result?.valid || !result.key) return null;

  const permissions =
    (result.key.permissions as Record<string, string[]> | null) ?? {};
  return {
    id: result.key.id,
    name: (result.key.name as string) ?? null,
    userId: result.key.userId,
    scopes: permissionsToScopes(permissions),
    permissions,
    metadata: parseApiKeyMetadata(result.key.metadata),
  };
}
