export type AuthRole = "END_USER" | "L2" | "L3";

export interface AuthSession {
  email: string;
  name: string;
  role: AuthRole;
  tenant: string;
}

const AUTH_STORAGE_KEY = "support_l1_auth_session";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
