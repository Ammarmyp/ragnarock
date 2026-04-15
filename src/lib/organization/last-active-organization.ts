import { LAST_ACTIVE_ORGANIZATION_COOKIE_NAME } from "./last-active-organization-cookie";

export { LAST_ACTIVE_ORGANIZATION_COOKIE_NAME };

/**
 * Persists last active org id for proxy restoration (multi-org).
 * Call after any successful `organization/set-active`.
 */
export function setLastActiveOrganizationIdClient(organizationId: string) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LAST_ACTIVE_ORGANIZATION_COOKIE_NAME}=${encodeURIComponent(organizationId)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
