import { axiosInstance } from "../lib/axios.js";

export const authService = {
  /**
   * User login with identifier (username or email) and password
   */
  login: async (credentials) => {
    const payload = {
      identifier: credentials.username || credentials.identifier || credentials.email,
      password: credentials.password,
    };
    const res = await axiosInstance.post("/auth/login", payload);
    return res.data;
  },

  /**
   * Fetch currently authenticated user profile
   */
  getMe: async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },

  /**
   * Request password reset / activation link for a provisioned email
   */
  forgotPassword: async (email) => {
    const res = await axiosInstance.post("/auth/forgot-password", { email });
    return res.data;
  },

  /**
   * Complete password reset / activation with secure token
   */
  resetPassword: async ({ token, password }) => {
    const res = await axiosInstance.post("/auth/reset-password", { token, password });
    return res.data;
  },

  /**
   * Verify whether a password reset / activation token is valid
   */
  verifyResetToken: async (token) => {
    const res = await axiosInstance.get(`/auth/verify-reset-token/${token}`);
    return res.data;
  },

  /**
   * Refresh JWT authentication token
   */
  refreshToken: async () => {
    const res = await axiosInstance.post("/auth/refresh-token");
    return res.data;
  },

  /**
   * Logout current session
   */
  logout: async (token) => {
    const res = await axiosInstance.post("/auth/logout", token ? { token } : {});
    return res.data;
  },
};
