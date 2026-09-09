import {
    registerService,
    loginService,
    forgotPasswordService,
    resetPasswordService,
    verifyResetTokenService,
    refreshTokenService,
    logoutService,
} from "../services/authService.js";

/**
 * Cookie configuration for refresh token.
 * HttpOnly: prevents JavaScript access (XSS protection)
 * Secure: only sent over HTTPS (disabled in dev)
 * SameSite: Strict prevents CSRF by blocking cross-origin cookie sending
 */
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || "30", 10);

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
});

export const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        const user = await registerService({ username, name, email, password });
        return res.status(201).json({ msg: "User registered successfully", user });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ msg: "Email or username already exists" });
        }
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const identifier = req.body.identifier || req.body.username || req.body.email;
        const password = req.body.password;

        const result = await loginService({ identifier, password });

        // Set refresh token in HTTP-Only cookie (not in JSON response body)
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

        return res.status(200).json({
            msg: "Login successful",
            token: result.token,
            user: result.user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await forgotPasswordService(email);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const result = await resetPasswordService({ token, password });
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const result = await verifyResetTokenService(token);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        // Read refresh token from cookie first, fallback to body for backward compatibility
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.token;

        const result = await refreshTokenService(token);

        // Set the new rotated refresh token in cookie
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

        return res.status(200).json({
            msg: "Token refreshed successfully",
            token: result.token,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        // Read refresh token from cookie first, fallback to body
        const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.token;

        const result = await logoutService(token);

        // Clear the refresh token cookie
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/api/auth",
        });

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getMe = async (req, res) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    const { password, ...safeUser } = req.user;
    return res.status(200).json({ user: safeUser });
};
