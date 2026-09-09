import { axiosInstance } from "../lib/axios.js";

export const auditService = {
  getAuditLogs: async () => {
    const res = await axiosInstance.get("/audit-logs");
    return res.data;
  },
};
