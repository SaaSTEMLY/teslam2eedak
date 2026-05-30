import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  createAuthenticatedClient,
  testSetup,
  cleanupById,
} from "../helpers/setup";
import type createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/types";

type AuthClient = ReturnType<typeof createClient<paths>>;
type ApiData = Record<string, unknown>;

const TEST_DISCOUNT_CODE = "CARTDISCOUNTTEST20";

let authClient: AuthClient;
let testUserId: string | null = null;
let testCartId: string | null = null;
let testDiscountId: string | null = null;

describe("Cart Discount API", () => {
  beforeAll(async () => {
    const auth = await createAuthenticatedClient();
    authClient = auth.client;
    testUserId = auth.userId;

    // Create a test discount code via test setup endpoint
    const discountResult = await testSetup("create-discount", {
      code: TEST_DISCOUNT_CODE,
      discountType: "percentage",
      discountValue: 20,
      isActive: true,
      validFrom: new Date(Date.now() - 86400000).toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    });
    testDiscountId = discountResult.id ? String(discountResult.id) : null;

    // Create a test cart owned by the test user
    if (testUserId) {
      const cartResult = await testSetup("create-cart", {
        customer: testUserId,
        items: [],
      });
      testCartId = cartResult.id ? String(cartResult.id) : null;
    }
  });

  afterAll(async () => {
    // Clean up test cart
    if (testCartId) {
      await cleanupById("carts", testCartId);
    }

    // Clean up test discount code
    if (testDiscountId) {
      await cleanupById("discount-codes", testDiscountId);
    }
  });

  describe("POST /api/cart/apply-discount", () => {
    test("applies a valid discount code to the cart", async () => {
      if (!testCartId) {
        console.log("Skipping: no test cart created");
        return;
      }

      const { response, data } = await authClient.POST(
        "/api/cart/apply-discount",
        {
          body: {
            code: TEST_DISCOUNT_CODE,
            cartId: Number(testCartId),
          },
        },
      );
      expect(response.status).toBe(200);
      const result = data as ApiData;
      expect(result.success).toBe(true);
      expect(result.discount).toBeDefined();
      const discount = result.discount as ApiData;
      expect(discount.code).toBe(TEST_DISCOUNT_CODE);
      expect(discount.discountType).toBe("percentage");
      expect(discount.discountValue).toBe(20);
    });

    test("rejects an invalid discount code", async () => {
      if (!testCartId) {
        console.log("Skipping: no test cart created");
        return;
      }

      const { response, data, error } = await authClient.POST(
        "/api/cart/apply-discount",
        {
          body: {
            code: "NONEXISTENT_CODE_XYZ",
            cartId: Number(testCartId),
          },
        },
      );
      expect(response.status).toBe(400);
      // openapi-fetch puts error responses in `error`, not `data`
      const body = (data ?? error) as ApiData | undefined;
      expect(body?.success).toBe(false);
    });
  });

  describe("POST /api/cart/remove-discount", () => {
    test("removes the discount from the cart", async () => {
      if (!testCartId) {
        console.log("Skipping: no test cart created");
        return;
      }

      const { response, data } = await authClient.POST(
        "/api/cart/remove-discount",
        {
          body: {
            cartId: Number(testCartId),
          },
        },
      );
      expect(response.status).toBe(200);
      expect((data as ApiData).success).toBe(true);
    });
  });
});
