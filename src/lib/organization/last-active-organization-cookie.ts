/**
 * Sent on every request so the proxy can restore the last active organization
 * when the session has no active org and the user belongs to multiple orgs.
 */
export const LAST_ACTIVE_ORGANIZATION_COOKIE_NAME = "rag_last_org";
