/**
 * Resolve a post-auth redirect path to an absolute URL for Better Auth `callbackURL`.
 */
export function resolveAuthCallbackUrl(redirectPath: string): string {
  if (typeof window === "undefined") return redirectPath;
  if (redirectPath.startsWith("http://") || redirectPath.startsWith("https://")) {
    return redirectPath;
  }
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  return `${window.location.origin}${path}`;
}

/**
 * Navigate to the OAuth provider URL returned by Better Auth (sign-in / link social).
 */
export function navigateToOAuthUrl(data: { url?: string | null; redirect?: boolean } | null | undefined): boolean {
  const url = data?.url;
  if (url) {
    window.location.href = url;
    return true;
  }
  return false;
}
