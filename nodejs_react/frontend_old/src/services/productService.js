import { axiosInstance } from "../lib/axios.js";

/**
 * Product & Catalog Domain Service (Canonical Backend Phase 4/7)
 */
export const productService = {
  getAll: async (params = {}) => {
    const res = await axiosInstance.get("/products", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data;
  },

  create: async ({ name, price, status = "AVAILABLE" }) => {
    const res = await axiosInstance.post("/products", { name, price: Number(price), status });
    return res.data;
  },

  update: async (id, { name, price, status }) => {
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (price !== undefined) payload.price = Number(price);
    if (status !== undefined) payload.status = status;
    const res = await axiosInstance.put(`/products/${id}`, payload);
    return res.data;
  },

  toggleStatus: async (id, status) => {
    const res = await axiosInstance.patch(`/products/${id}/status`, { status });
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/products/${id}`);
    return res.data;
  },
};
