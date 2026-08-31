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
      this.logout();
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
