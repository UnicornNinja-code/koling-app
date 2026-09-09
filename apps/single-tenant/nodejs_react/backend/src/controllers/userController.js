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

const sanitizeUser = (userObj) => {
    if (!userObj) return null;
    const { password, ...safe } = userObj;
    return safe;
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const user = await getProfileService(req.user.id);
        return res.status(200).json({ success: true, user: sanitizeUser(user) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
    }
};

// Get all users (SUPERADMIN, MANAGEMENT, and SUPERVISOR-scoped)
export const getAllUsers = async (req, res) => {
    try {
        const result = await getAllUsersService(req.user, req.query);
        const safeUsers = (result.users || []).map(sanitizeUser);
        return res.status(200).json({ success: true, count: safeUsers.length, users: safeUsers });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
    }
};

// Get user by ID (SUPERADMIN, MANAGEMENT, or SUPERVISOR viewing Rider)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id, req.user);
        return res.status(200).json({ success: true, user: sanitizeUser(user) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
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

        return res.status(201).json({
            success: true,
            msg: "Pengguna berhasil dibuat.",
            user: sanitizeUser(newUser),
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ success: false, msg: "Email atau username sudah digunakan." });
        }
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
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

        return res.status(200).json({
            success: true,
            msg: "Data pengguna berhasil diperbarui.",
            user: sanitizeUser(updatedUser),
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ success: false, msg: "Email sudah terdaftar." });
        }
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
    }
};

// Activate / Deactivate user account (Hierarchy Guard enforced)
export const setUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await setUserStatusService(id, is_active, req.user);
        return res.status(200).json({
            success: true,
            msg: result.message,
            user: sanitizeUser(result.user),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
    }
};

// Delete user account (Hierarchy Guard enforced)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUserService(id, req.user);
        return res.status(200).json({
            success: true,
            msg: result.message,
            user: sanitizeUser(result.user),
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Internal server error" });
    }
};

// Change user password (Self Profile)
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        await changePasswordService(userId, { currentPassword, newPassword });
        return res.status(200).json({ success: true, msg: "Kata sandi berhasil diperbarui." });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, msg: error.message || "Gagal memperbarui kata sandi." });
    }
};
