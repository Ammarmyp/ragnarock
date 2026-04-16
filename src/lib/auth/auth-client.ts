import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";
import { getBearerToken, setBearerToken } from "@/lib/auth/bearer-token";

const authBaseURL = process.env.NEXT_PUBLIC_AUTH_URL ?? "";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getBearerToken(),
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) {
        setBearerToken(token);
      }
    },
  },
  plugins: [
    emailOTPClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
    twoFactorClient(),
  ],
});

export type AuthSession = typeof authClient.$Infer.Session;