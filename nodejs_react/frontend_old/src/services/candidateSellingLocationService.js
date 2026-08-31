import { axiosInstance } from "../lib/axios.js";

export const candidateSellingLocationService = {
  /**
   * Fetch all candidate selling locations for a zone
   */
  getCandidatesByZone: async (zoneId) => {
    const res = await axiosInstance.get(`/candidate-selling-locations/zone/${zoneId}`);
    return res.data;
  },

  /**
   * Fetch candidate selling location by ID
   */
  getCandidateById: async (id) => {
    const res = await axiosInstance.get(`/candidate-selling-locations/${id}`);
    return res.data;
  },

  /**
   * Create candidate selling location manually
   */
  createCandidate: async (data) => {
    const res = await axiosInstance.post("/candidate-selling-locations", data);
    return res.data;
  },

  /**
   * Generate candidate selling locations from zone POIs
   */
  generateZoneCandidates: async (zoneId) => {
    const res = await axiosInstance.post(`/candidate-selling-locations/generate/zone/${zoneId}`);
    return res.data;
  },

  /**
   * Evaluate a single candidate selling location
   */
  evaluateCandidate: async (id, payload = {}) => {
    const res = await axiosInstance.post(`/candidate-selling-locations/${id}/evaluate`, payload);
    return res.data;
  },

  /**
   * Evaluate and rank all ALLOWED candidate selling locations in a zone
   */
  evaluateZoneCandidates: async (zoneId, payload = {}) => {
    const res = await axiosInstance.post(`/candidate-selling-locations/evaluate/zone/${zoneId}`, payload);
    return res.data;
  },

  /**
   * Fetch evaluation snapshot by ID (Phase 8 Audit Trail)
   */
  getEvaluationSnapshot: async (evaluationId) => {
    const res = await axiosInstance.get(`/candidate-selling-locations/evaluation/${evaluationId}`);
    return res.data;
  },

  /**
   * Fetch evaluation explanation breakdown (Phase 8 Explainability)
   */
  getEvaluationExplanation: async (evaluationId) => {
    const res = await axiosInstance.get(`/candidate-selling-locations/evaluation/${evaluationId}/explanation`);
    return res.data;
  },

  /**
   * Fetch evaluation audit metadata (Phase 8 Audit Trail)
   */
  getEvaluationAudit: async (evaluationId) => {
    const res = await axiosInstance.get(`/candidate-selling-locations/evaluation/${evaluationId}/audit`);
    return res.data;
  },
};
