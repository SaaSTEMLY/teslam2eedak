import {
  describe,
  test,
  expect,
  afterAll,
  api,
  cleanupByField,
} from "../helpers/setup";

const TEST_EMAIL = "contact-test@google.com";

describe("POST /api/contact", () => {
  afterAll(async () => {
    await cleanupByField("contact-form-submissions", "email", TEST_EMAIL);
  });

  test("creates submission with valid data", async () => {
    const { response } = await api.POST("/api/contact", {
      body: {
        name: "Jane Doe",
        email: TEST_EMAIL,
        subject: "Test inquiry",
        message: "This is a test message for integration testing.",
      },
    });
    expect(response.status).toBe(201);
  });

  test("rejects missing required fields", async () => {
    const { response } = await api.POST("/api/contact", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: { name: "Jane" } as any,
    });
    expect(response.status).toBe(400);
  });

  test("rejects invalid email", async () => {
    const { response } = await api.POST("/api/contact", {
      body: {
        name: "Jane",
        email: "not-an-email",
        subject: "Test",
        message: "Test message",
      },
    });
    expect(response.status).toBe(400);
  });
});
