You are implementing authentication on the frontend of a Next.js app using Better Auth.

Follow these rules strictly:

1. Core Architecture Understanding
Better Auth works as:
Server (API) → handles auth logic
Client SDK → used in frontend to interact with auth
The frontend must NEVER implement auth logic directly — only call the client SDK.
All session and auth state is reactive and managed by the SDK.
2. Auth Client Setup (MANDATORY)
Always create a single centralized auth client instance
Place it in:
/src/lib/auth/client.ts
Example pattern:
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseUrl: "/api/auth", // must match backend
})
NEVER create multiple instances across the app
3. Session Handling (CRITICAL)

Use the provided hook:

import { useSession } from "@/lib/auth/client"

const { data: session, isPending, error, refetch } = useSession()
Rules:
session === null → user not authenticated
isPending === true → loading state
Always handle loading + unauthenticated states
Never manually fetch session from API

👉 This hook is reactive across the app and syncs automatically.

4. Authentication Actions
Sign In
await authClient.signIn.email({
  email,
  password,
})
Sign Up
await authClient.signUp.email({
  email,
  password,
  name,
})
Sign Out
await authClient.signOut()
5. UI Patterns (STRICT)
Always handle 3 states:
if (isPending) return <Loading />

if (!session) return <AuthScreen />

return <Dashboard user={session.user} />
6. Form Handling (IMPORTANT)
Use your company-standard form system (TanStack Form + shadcn)
On submit:
Call Better Auth methods
Handle errors explicitly
Show toast feedback (using your toast system)
7. Error Handling
Every auth call must be wrapped:
try {
  await authClient.signIn.email(...)
} catch (error) {
  // show toast
}
Never silently fail
8. Plugins (When Needed)

If using advanced features, extend the client:

import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [organizationClient()],
})

Available plugin types:

organizations
2FA
passkeys
admin
multi-session

9. Best Practices (NON-NEGOTIABLE)
Centralize auth client
Never duplicate session logic
Always show loading states
Always handle errors
Use hooks instead of manual state
Do not store tokens manually (handled internally)
10. Folder Structure (ENFORCED)
src/
  lib/
    auth/
      client.ts
  features/
    auth/
      components/
        sign-in-form.tsx
        sign-up-form.tsx
      hooks/
      utils/
11. Example Component Pattern
"use client"

import { useSession } from "@/lib/auth/client"

export function UserProfile() {
  const { data: session, isPending } = useSession()

  if (isPending) return <p>Loading...</p>
  if (!session) return <p>Not logged in</p>

  return <div>{session.user.email}</div>
}
12. Mental Model (IMPORTANT)
Think of Better Auth client as:
→ “React Query for authentication”
It:
syncs session automatically
handles cookies internally
revalidates state across components
13. Common Mistakes to Avoid

❌ Fetching /api/auth/session manually
❌ Storing tokens in localStorage
❌ Creating multiple auth clients
❌ Ignoring loading states
❌ Handling auth outside the SDK

14. Integration Notes for Next.js
Works with App Router
Uses cookies automatically (no manual headers needed)
Middleware / proxy handles protection on server side
15. Expected Outcome

The frontend must:

Reactively know if user is logged in
Provide login/signup/logout flows
Keep session in sync across all components
Never manually manage authentication state
🔥 Optional Add-on (for your stack)

You can extend the prompt with:

“Use TanStack Form for forms”
“Use Sileo toast system for feedback”
“Follow modular feature-based architecture”

for more information refer https://better-auth.com/docs/integrations/next