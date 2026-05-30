import { toNextJsHandler } from "better-auth/next-js";
import { getPayload } from "@/lib/payload";
import { betterAuth } from "better-auth";
import { payloadAdapter } from "payload-auth/better-auth/adapter";
import { betterAuthOptions } from "@/lib/auth/options";

// Lazy initialization to avoid issues during static generation
let handlers: Awaited<ReturnType<typeof toNextJsHandler>> | null = null;

function buildBetterAuthFromPayload(
  payload: Awaited<ReturnType<typeof getPayload>>,
) {
  return betterAuth({
    ...betterAuthOptions,
    database: payloadAdapter({
      payloadClient: payload,
      adapterConfig: {
        enableDebugLogs: process.env.BETTER_AUTH_ADAPTER_DEBUG === "true",
        idType: payload.db.defaultIDType,
      },
    }),
  });
}

async function getHandlers() {
  if (!handlers) {
    const payload = await getPayload();

    // `payload.betterAuth` is normally provided by the payload-auth plugin onInit.
    // In some Next/Payload integration paths, Payload can be initialized with
    // onInit disabled, leaving `betterAuth` unset.
    const auth = payload.betterAuth ?? buildBetterAuthFromPayload(payload);
    handlers = toNextJsHandler(auth);
  }
  return handlers;
}

export async function POST(request: Request) {
  try {
    const resolved = await getHandlers();
    return resolved.POST(request);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] Failed to initialize handlers", error);
    }

    return Response.json(
      {
        error: "Auth initialization failed",
        hint:
          process.env.NODE_ENV !== "production"
            ? "If schema push failed, try: bun db:clear && bun dev"
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const resolved = await getHandlers();
    return resolved.GET(request);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] Failed to initialize handlers", error);
    }

    return Response.json(
      {
        error: "Auth initialization failed",
        hint:
          process.env.NODE_ENV !== "production"
            ? "If schema push failed, try: bun db:clear && bun dev"
            : undefined,
      },
      { status: 500 },
    );
  }
}
