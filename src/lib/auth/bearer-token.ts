const AUTH_BEARER_TOKEN_KEY = "auth_bearer_token";
const AUTH_HINT_COOKIE = "ba_session_hint";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getBearerToken(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(AUTH_BEARER_TOKEN_KEY) ?? "";
}

export function setBearerToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_BEARER_TOKEN_KEY, token);
  document.cookie = `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function clearBearerToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_BEARER_TOKEN_KEY);
  document.cookie = `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function hasSessionHintCookie(cookieHeader?: string): boolean {
  const source = cookieHeader ?? (isBrowser() ? document.cookie : "");
  return source.split(";").some((part) => part.trim().startsWith(`${AUTH_HINT_COOKIE}=`));
}

