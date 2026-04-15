import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";

const authBaseURL = process.env.NEXT_PUBLIC_AUTH_URL ?? "";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
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