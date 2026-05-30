import configPromise from "@payload-config";
import { getPayloadAuth } from "payload-auth/better-auth";
import type { ConstructedBetterAuthPluginOptions } from "./auth/options";

export const getPayload = async () => {
  try {
    return await getPayloadAuth<ConstructedBetterAuthPluginOptions>(
      configPromise,
    );
  } catch (error) {
    const hint =
      process.env.NODE_ENV !== "production"
        ? "Payload failed to initialize (often due to schema push issues). For local sqlite, a reset usually fixes it: bun db:clear && bun dev"
        : "Payload failed to initialize.";

    throw new Error(hint, { cause: error });
  }
};
