import {
  describe,
  test,
  expect,
  afterAll,
  api,
  testSetup,
  cleanupById,
} from "../helpers/setup";

type ApiData = Record<string, unknown>;

const TEST_CODE = "INTEGRATIONTEST10";
let createdDiscountId: string | null = null;

describe("POST /api/discount/validate", () => {
  afterAll(async () => {
    if (createdDiscountId) {
      await cleanupById("discount-codes", createdDiscountId);
    }
  });

  test("setup: create test discount code", async () => {
    const result = await testSetup("create-discount", {
      code: TEST_CODE,
      discountType: "percentage",
      discountValue: 10,
      isActive: true,
      validFrom: new Date(Date.now() - 86400000).toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    });
    createdDiscountId = result.id ? String(result.id) : null;
    expect(createdDiscountId).toBeDefined();
  });

  test("validates a valid discount code", async () => {
    const { response, data } = await api.POST("/api/discount/validate", {
      body: { code: TEST_CODE, subtotal: 5000 },
    });
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("valid", true);
    expect(data).toHaveProperty("code", TEST_CODE);
    expect(data).toHaveProperty("discountType", "percentage");
    expect(data).toHaveProperty("discountValue", 10);
    expect(data).toHaveProperty("discountAmount");
    // 10% of 5000 = 500
    expect((data as ApiData).discountAmount).toBe(500);
  });

  test("rejects an invalid discount code", async () => {
    const { response, data } = await api.POST("/api/discount/validate", {
      body: { code: "NONEXISTENTCODE", subtotal: 5000 },
    });
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("valid", false);
    expect(data).toHaveProperty("error");
  });

  test("rejects missing code field", async () => {
    const { response } = await api.POST("/api/discount/validate", {
      // @ts-expect-error testing invalid input
      body: {},
    });
    expect(response.status).toBe(400);
  });

  test("validates case-insensitively", async () => {
    const { response, data } = await api.POST("/api/discount/validate", {
      body: { code: TEST_CODE.toLowerCase(), subtotal: 1000 },
    });
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("valid", true);
  });
});
