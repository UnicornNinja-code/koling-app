import { axiosInstance } from "../lib/axios.js";

/**
 * Armada / Fleet Domain Service (Canonical Backend Phase 1-7)
 */
export const armadaService = {
  getAll: async (params = {}) => {
    const res = await axiosInstance.get("/armadas", { params });
    return res.data;
  },

  getAvailable: async () => {
    const res = await axiosInstance.get("/armadas/available");
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/armadas/${id}`);
    return res.data;
  },

  create: async ({ code, type = "MOTOR_LISTRIK", status = "ACTIVE" }) => {
    const res = await axiosInstance.post("/armadas", { code, type, status });
    return res.data;
  },

  update: async (id, { code, type, status }) => {
    const res = await axiosInstance.put(`/armadas/${id}`, { code, type, status });
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/armadas/${id}`);
    return res.data;
  },

  // Aliases for backward compatibility
  getArmadas: async () => armadaService.getAll(),
  getArmadaById: async (id) => armadaService.getById(id),
  createArmada: async (data) => armadaService.create(data),
  updateArmada: async (id, data) => armadaService.update(id, data),
  deleteArmada: async (id) => armadaService.delete(id),
};
