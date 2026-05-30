import {
  describe,
  test,
  expect,
  afterAll,
  api,
  cleanupByField,
} from "../helpers/setup";

const TEST_EMAIL = "newsletter-test@google.com";

describe("POST /api/newsletter", () => {
  afterAll(async () => {
    await cleanupByField("newsletter-subscribers", "email", TEST_EMAIL);
  });

  test("subscribes with valid email", async () => {
    const { response, data } = await api.POST("/api/newsletter", {
      body: { email: TEST_EMAIL },
    });
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("success", true);
  });

  test("handles duplicate email gracefully", async () => {
    const { response } = await api.POST("/api/newsletter", {
      body: { email: TEST_EMAIL },
    });
    // Should not error on duplicate — silently succeeds
    expect(response.status).toBe(200);
  });

  test("rejects invalid email", async () => {
    const { response } = await api.POST("/api/newsletter", {
      body: { email: "not-an-email" },
    });
    expect(response.status).toBe(400);
  });

  test("rejects missing email", async () => {
    const { response } = await api.POST("/api/newsletter", {
      // @ts-expect-error testing invalid input
      body: {},
    });
    expect(response.status).toBe(400);
  });
});
