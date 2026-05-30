import { test, expect, beforeAll, afterAll, describe } from "vitest";
import createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/types";

export { test, expect, beforeAll, afterAll, describe };

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
export { BASE_URL };

/** Unauthenticated API client for public endpoint tests. */
export const api = createClient<paths>({ baseUrl: BASE_URL });

/** Generic POST. Includes Origin header for CSRF protection. */
export async function rawPost(
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE_URL,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
}

/** Generic GET. */
export async function rawGet(path: string, headers?: Record<string, string>) {
  return fetch(`${BASE_URL}${path}`, { headers, redirect: "manual" });
}

/** Generic PATCH. */
export async function rawPatch(
  path: string,
  body: unknown,
  headers?: Record<string, string>,
) {
  return fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

/** Generic DELETE. */
export async function rawDelete(
  path: string,
  headers?: Record<string, string>,
) {
  return fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
}

/**
 * Call the test setup endpoint (dev-only) for data seeding/cleanup.
 */
export async function testSetup(
  action: string,
  data: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const res = await rawPost("/api/test/setup", { action, ...data });
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Creates an authenticated API client by signing up (if needed) and signing in.
 * Uses the test setup endpoint to auto-verify the email.
 */
export async function createAuthenticatedClient(
  email = "test-integration@google.com",
): Promise<{
  client: ReturnType<typeof createClient<paths>>;
  cookie: string;
  userId: string | null;
}> {
  const password = "TestPassword123!";

  // Sign up (may 409 if exists — that's fine)
  await rawPost("/api/auth/sign-up/email", {
    email,
    password,
    name: "Test User",
  });

  // Auto-verify email via the test setup endpoint
  const verifyResult = await testSetup("verify-email", { email });
  const userId = verifyResult.userId ? String(verifyResult.userId) : null;

  // Sign in to get session cookie
  const signInRes = await rawPost("/api/auth/sign-in/email", {
    email,
    password,
  });

  // Extract session cookie — try getSetCookie() first, then fallback to
  // parsing the raw set-cookie header, then fallback to response body token
  let sessionCookie: string | undefined;

  const setCookies = signInRes.headers.getSetCookie?.() ?? [];
  sessionCookie = setCookies
    .find((c) => c.startsWith("better-auth.session_token"))
    ?.split(";")[0];

  if (!sessionCookie) {
    // Fallback: parse raw set-cookie header (Node fetch may combine them)
    const rawCookie = signInRes.headers.get("set-cookie") ?? "";
    const match = rawCookie.match(/better-auth\.session_token=([^;]+)/);
    if (match) {
      sessionCookie = `better-auth.session_token=${match[1]}`;
    }
  }

  if (!sessionCookie) {
    // Fallback: read token from response body
    const body = (await signInRes.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (body?.token) {
      sessionCookie = `better-auth.session_token=${body.token}`;
    }
  }

  if (!sessionCookie) {
    throw new Error(`Failed to authenticate ${email}`);
  }

  return {
    client: createClient<paths>({
      baseUrl: BASE_URL,
      headers: { cookie: sessionCookie },
    }),
    cookie: sessionCookie,
    userId,
  };
}

/** Delete documents via the test setup endpoint. */
export async function cleanupByField(
  collection: string,
  field: string,
  value: string,
) {
  await testSetup("cleanup", { collection, field, value });
}

/** Delete a single document by ID via the test setup endpoint. */
export async function cleanupById(collection: string, id: string | number) {
  await testSetup("cleanup-id", { collection, id: String(id) });
}
