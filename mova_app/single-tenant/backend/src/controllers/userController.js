import {
    getProfileService,
    getAllUsersService,
    getUserByIdService,
    createUserService,
    updateUserService,
    setUserStatusService,
    deleteUserService,
    changePasswordService,
} from "../services/userService.js";
import { sendSuccess, sendPaginated, sendError } from "../utils/apiResponse.js";

const sanitizeUser = (userObj) => {
    if (!userObj) return null;
    const { password, ...safe } = userObj;
    return safe;
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const user = await getProfileService(req.user.id);
        const safeUser = sanitizeUser(user);
        return sendSuccess(res, safeUser, "Profil pengguna berhasil dimuat.", 200, { user: safeUser });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Update current user profile (Self Profile)
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, birth_date } = req.body;
        const updatedUser = await updateUserService(
            req.user.id,
            { name, email, phone, birth_date },
            req.user
        );
        const safeUser = sanitizeUser(updatedUser);
        return sendSuccess(res, safeUser, "Profil berhasil diperbarui.", 200, { user: safeUser });
    } catch (error) {
        if (error.code === "23505") {
            return sendError(res, "Email sudah terdaftar.", 400);
        }
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Get all users (SUPERADMIN, MANAGEMENT, and SUPERVISOR-scoped)
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);

        const result = await getAllUsersService(req.user, req.query);
        const safeUsers = (result.users || []).map(sanitizeUser);

        const pagination = {
            page,
            limit,
            total_records: result.total_records !== undefined ? result.total_records : safeUsers.length,
            total_pages: Math.ceil((result.total_records || safeUsers.length) / limit) || 1,
        };

        return sendPaginated(res, safeUsers, pagination, "Daftar pengguna berhasil dimuat.", 200, {
            users: safeUsers, // Backward compatibility alias
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Get user by ID (SUPERADMIN, MANAGEMENT, or SUPERVISOR viewing Rider)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id, req.user);
        const safeUser = sanitizeUser(user);
        return sendSuccess(res, safeUser, "Detail pengguna berhasil dimuat.", 200, { user: safeUser });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Create user (RBAC Hierarchy enforced in service)
export const createUser = async (req, res) => {
    try {
        const { username, name, email, password, phone, role } = req.body;
        const newUser = await createUserService(
            { username, name, email, password, phone, role },
            req.user
        );
        const safeUser = sanitizeUser(newUser);
        return sendSuccess(res, safeUser, "Pengguna berhasil dibuat.", 201, { user: safeUser });
    } catch (error) {
        if (error.code === "23505") {
            return sendError(res, "Email atau username sudah digunakan.", 400);
        }
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Update user (Hierarchy Guard and IDOR protection enforced in service)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;

        const updatedUser = await updateUserService(
            id,
            { name, email, phone, role },
            req.user
        );
        const safeUser = sanitizeUser(updatedUser);
        return sendSuccess(res, safeUser, "Data pengguna berhasil diperbarui.", 200, { user: safeUser });
    } catch (error) {
        if (error.code === "23505") {
            return sendError(res, "Email sudah terdaftar.", 400);
        }
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Activate / Deactivate user account (Hierarchy Guard enforced)
export const setUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await setUserStatusService(id, is_active, req.user);
        const safeUser = sanitizeUser(result.user);
        return sendSuccess(res, safeUser, result.message || "Status pengguna berhasil diubah.", 200, { user: safeUser });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Delete user account (Hierarchy Guard enforced)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUserService(id, req.user);
        const safeUser = sanitizeUser(result.user);
        return sendSuccess(res, safeUser, result.message || "Pengguna berhasil dihapus.", 200, { user: safeUser });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Internal server error", statusCode);
    }
};

// Change user password (Self Profile)
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        await changePasswordService(userId, { currentPassword, newPassword });
        return sendSuccess(res, null, "Kata sandi berhasil diperbarui.", 200);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return sendError(res, error.message || "Gagal memperbarui kata sandi.", statusCode);
    }
};

