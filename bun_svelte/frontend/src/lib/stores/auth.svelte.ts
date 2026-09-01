/*
 * auth.svelte.ts
 * Svelte 5 Runes-based Global Authentication State Store
 */

import { authService, type AuthUser } from "../../services/authService";

export function getRoleLandingPath(role: string | undefined): string {
  switch (role) {
    case "RIDER":
      return "/rider";
    case "SUPERVISOR":
    case "MANAGEMENT":
    case "SUPERADMIN":
    default:
      return "/dashboard";
  }
}

class AuthStore {
  user = $state<AuthUser | null>(null);
  token = $state<string | null>(null);
  loading = $state<boolean>(true);
  isExpired = $state<boolean>(false);

  constructor() {
    this.hydrate();
    if (typeof window !== "undefined") {
      window.addEventListener("auth:expired", () => {
        this.handleExpired();
      });
      window.addEventListener("auth:token_refreshed", (e: any) => {
        if (e?.detail) {
          this.token = e.detail;
        }
      });
    }
  }

  get isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  get role(): string {
    return this.user?.role || "GUEST";
  }

  hydrate() {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken) {
        this.token = savedToken;
      }
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn("Gagal memuat sesi autentikasi lokal:", e);
    } finally {
      this.loading = false;
    }
  }

  async validateSession() {
    if (!this.token) {
      this.loading = false;
      return;
    }
    try {
      const res = await authService.getMe();
      if (res?.user) {
        this.user = res.user;
        localStorage.setItem("user", JSON.stringify(res.user));
      }
    } catch (err: any) {
      console.warn("Sesi tidak valid atau telah kedaluwarsa:", err?.message);
      // Only logout on explicit 401 Unauthorized or deactivated user (403 USER_DEACTIVATED)
      // Do NOT log out if there is a transient 500 error or network disconnection!
      if (err?.response?.status === 401 || err?.response?.data?.error === "USER_DEACTIVATED") {
        this.logout();
      }
    } finally {
      this.loading = false;
    }
  }

  login(userData: AuthUser, authToken: string) {
    this.user = userData;
    this.token = authToken;
    this.isExpired = false;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  }

  async logout() {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      this.user = null;
      this.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }

  handleExpired() {
    this.user = null;
    this.token = null;
    this.isExpired = true;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}

export const authStore = new AuthStore();
