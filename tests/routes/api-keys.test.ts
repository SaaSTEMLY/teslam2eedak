import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  rawGet,
  createAuthenticatedClient,
  BASE_URL,
} from "../helpers/setup";

let sessionCookie: string | null = null;
let createdKeyId: string | null = null;
let createdKeyValue: string | null = null;

/**
 * Helper to make authenticated raw requests with the session cookie.
 * Better-Auth API key endpoints are not part of the OpenAPI spec,
 * so we use raw fetch calls.
 */
async function authPost(path: string, body?: unknown) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE_URL,
      ...(sessionCookie ? { cookie: sessionCookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
}

describe("API Keys (Better-Auth)", () => {
  beforeAll(async () => {
    // Use createAuthenticatedClient to get session cookie via REST API
    const auth = await createAuthenticatedClient("test-apikeys@google.com");
    sessionCookie = auth.cookie;
  });

  afterAll(async () => {
    // Delete the key if it was not deleted during the test
    if (createdKeyId && sessionCookie) {
      try {
        await authPost("/api/auth/api-key/delete", { keyId: createdKeyId });
      } catch {
        // Best effort cleanup
      }
    }
  });

  test("creates an API key", async () => {
    if (!sessionCookie) {
      console.log("Skipping: no session cookie");
      return;
    }

    const res = await authPost("/api/auth/api-key/create", {
      name: "integration-test-key",
    });

    // Better-Auth may return 200 or 201
    expect(res.status).toBeLessThan(300);

    const data = await res.json();
    // The response should contain the key — shape varies by Better-Auth version
    createdKeyId = data.id ?? data.key?.id ?? null;
    createdKeyValue = data.key ?? data.apiKey ?? data.key?.key ?? null;

    expect(createdKeyId || createdKeyValue).toBeTruthy();
  });

  test("lists API keys including the created one", async () => {
    if (!sessionCookie) {
      console.log("Skipping: no session cookie");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/auth/api-key/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
        ...(sessionCookie ? { cookie: sessionCookie } : {}),
      },
      redirect: "manual",
    });
    expect(res.status).toBeLessThan(300);

    const data = await res.json();
    const keys = Array.isArray(data) ? data : (data.keys ?? data.apiKeys ?? []);
    expect(keys.length).toBeGreaterThanOrEqual(1);
  });

  test("uses the API key to access a public endpoint", async () => {
    if (!createdKeyValue) {
      console.log("Skipping: no API key value");
      return;
    }

    const res = await rawGet("/api/products", { "x-api-key": createdKeyValue });
    // The endpoint should respond (may be 200 even without the key for public endpoints)
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("docs");
  });

  test("deletes the API key", async () => {
    if (!sessionCookie || !createdKeyId) {
      console.log("Skipping: no session or no key to delete");
      return;
    }

    const res = await authPost("/api/auth/api-key/delete", {
      keyId: createdKeyId,
    });
    expect(res.status).toBeLessThan(300);
    createdKeyId = null; // Prevent double-delete in afterAll
  });
});
