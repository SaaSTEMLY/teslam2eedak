import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  createAuthenticatedClient,
  cleanupByField,
} from "../helpers/setup";
import type createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/types";

type AuthClient = ReturnType<typeof createClient<paths>>;
type ApiData = Record<string, unknown>;

let authClient: AuthClient;
let testUserId: string | null = null;
let createdAddressId: string | null = null;

describe("Addresses API", () => {
  beforeAll(async () => {
    const auth = await createAuthenticatedClient();
    authClient = auth.client;
    testUserId = auth.userId;
  });

  afterAll(async () => {
    if (testUserId) {
      await cleanupByField("addresses", "customer", testUserId);
    }
  });

  describe("POST /api/addresses", () => {
    test("creates an address when authenticated", async () => {
      if (!testUserId) {
        console.log("Skipping: no test user");
        return;
      }

      const { response, data } = await authClient.POST("/api/addresses", {
        body: {
          customer: testUserId,
          title: "Home",
          firstName: "Test",
          lastName: "User",
          addressLine1: "123 Integration St",
          city: "Testville",
          state: "CA",
          postalCode: "90210",
          country: "US",
          phone: "+1-555-0100",
        },
      });
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("doc");
      const doc = (data as ApiData)?.doc as ApiData | undefined;
      createdAddressId = doc?.id != null ? String(doc.id) : null;
      expect(createdAddressId).toBeDefined();
    });
  });

  describe("GET /api/addresses", () => {
    test("returns addresses list including the created one", async () => {
      const { response, data } = await authClient.GET("/api/addresses");
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("docs");
      const docs = (data as ApiData).docs as unknown[];
      expect(Array.isArray(docs)).toBe(true);

      if (createdAddressId) {
        const found = docs.some(
          (addr) => String((addr as ApiData).id) === String(createdAddressId),
        );
        expect(found).toBe(true);
      }
    });
  });

  describe("PATCH /api/addresses/{id}", () => {
    test("updates an address", async () => {
      if (!createdAddressId) {
        console.log("Skipping: no address created");
        return;
      }

      const { response, data } = await authClient.PATCH("/api/addresses/{id}", {
        params: { path: { id: createdAddressId } },
        body: {
          city: "Updated City",
        },
      });
      expect(response.status).toBe(200);
      // PATCH response wraps result in `doc`
      const doc = (data as ApiData).doc as ApiData | undefined;
      const city = doc?.city ?? (data as ApiData).city;
      expect(city).toBe("Updated City");
    });
  });

  describe("DELETE /api/addresses/{id}", () => {
    test("deletes an address", async () => {
      if (!createdAddressId) {
        console.log("Skipping: no address created");
        return;
      }

      const { response } = await authClient.DELETE("/api/addresses/{id}", {
        params: { path: { id: createdAddressId } },
      });
      expect(response.status).toBe(200);
      createdAddressId = null;
    });
  });
});
