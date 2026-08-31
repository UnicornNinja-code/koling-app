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
const getProfile = async (req, res) => {
    try {
        const user = await getProfileService(req.user.id);
        return res.status(200).json({ user: sanitizeUser(user) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Get all users (SUPERADMIN & MANAGEMENT only)
const getAllUsers = async (req, res) => {
    try {
        const result = await getAllUsersService();
        const safeUsers = (result.users || []).map(sanitizeUser);
        return res.status(200).json({ ...result, users: safeUsers });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Get user by ID (SUPERADMIN & MANAGEMENT only)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id);
        return res.status(200).json({ user: sanitizeUser(user) });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Create user (RBAC Hierarchy enforced in service)
const createUser = async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;
        const newUser = await createUserService(
            { username, name, email, password, role },
            req.user
        );

        return res.status(201).json({ msg: "User created successfully", user: newUser });
    } catch (error) {
        if (error.code === "23505") { // unique_violation in Postgres
            return res.status(400).json({ msg: "Email or username already exists" });
        }
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Update user (SUPERADMIN/MANAGEMENT for admin updates, user can update own profile, protected against IDOR)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const updatedUser = await updateUserService(
            id,
            { name, email, role },
            req.user
        );

        return res.status(200).json({ msg: "User updated successfully", user: updatedUser });
    } catch (error) {
        if (error.code === "23505") { // unique_violation in Postgres
            return res.status(400).json({ msg: "Email or username already exists" });
        }
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Activate / Deactivate user account (RBAC Hierarchy)
const setUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await setUserStatusService(id, is_active, req.user);
        return res.status(200).json({ msg: result.message, user: result.user });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Delete user (SUPERADMIN & MANAGEMENT with RBAC hierarchy)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUserService(id, req.user);
        return res.status(200).json({ msg: result.message });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

// Change user password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        await changePasswordService(userId, { currentPassword, newPassword });
        return res.status(200).json({ msg: "Password berhasil diperbarui." });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Gagal memperbarui password." });
    }
};

export {
    getProfile,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    setUserStatus,
    deleteUser,
    changePassword,
};
