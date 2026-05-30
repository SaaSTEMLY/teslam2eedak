import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { apiKeyClient } from "better-auth/client/plugins";
import { dicebearUrl } from "@/lib/avatar";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [passkeyClient(), apiKeyClient()],
  fetchOptions: {
    jsonParser(text: string) {
      if (!text) return null;
      const data = JSON.parse(text);
      if (data?.user && !data.user.image && data.user.email) {
        data.user.image = dicebearUrl(data.user.email);
      }
      return data;
    },
  },
});
