/*
 * CandidateSellingLocationController.js
 * Express HTTP Controller for Candidate Selling Locations REST API
 */

import { candidateSellingLocationService } from "../services/candidateSellingLocationService.js";
import { candidateSellingLocationRepository } from "../repositories/candidateSellingLocationRepository.js";

export class CandidateSellingLocationController {
  /**
   * POST /api/candidate-selling-locations
   */
  async createCandidate(req, res, next) {
    try {
      const { zone_id, poi_id, name, latitude, longitude, source } = req.body;
      const result = await candidateSellingLocationService.createCandidateSellingLocation({
        zone_id,
        poi_id,
        name,
        latitude,
        longitude,
        source,
      });

      return res.status(201).json({
        success: true,
        message: "Candidate selling location created successfully.",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/candidate-selling-locations/zone/:zoneId
   */
  async getCandidatesByZone(req, res, next) {
    try {
      const { zoneId } = req.params;
      const candidates = await candidateSellingLocationService.getCandidatesByZone(zoneId);

      return res.status(200).json({
        success: true,
        total: candidates.length,
        data: candidates,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/candidate-selling-locations/:id
   */
  async getCandidateById(req, res, next) {
    try {
      const { id } = req.params;
      const candidate = await candidateSellingLocationRepository.findById(id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: `Candidate selling location with ID '${id}' not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/candidate-selling-locations/generate/zone/:zoneId
   */
  async generateCandidatesFromZonePois(req, res, next) {
    try {
      const { zoneId } = req.params;
      const generated = await candidateSellingLocationService.generateCandidatesFromZonePois(zoneId);

      return res.status(200).json({
        success: true,
        message: `Generated ${generated.length} candidate locations from eligible zone POIs.`,
        data: generated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/candidate-selling-locations/:id/evaluate
   */
  async evaluateCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const { timeSlot, riderLat, riderLon } = req.body || {};
      const result = await candidateSellingLocationService.evaluateCandidateSellingLocation(id, {
        timeSlot,
        riderLat,
        riderLon,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/candidate-selling-locations/evaluate/zone/:zoneId
   */
  async evaluateZoneCandidates(req, res, next) {
    try {
      const { zoneId } = req.params;
      const { timeSlot, riderLat, riderLon } = req.body || {};
      const result = await candidateSellingLocationService.evaluateZoneCandidateSellingLocations(zoneId, {
        timeSlot,
        riderLat,
        riderLon,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/candidate-selling-locations/evaluation/:evaluationId
   */
  async getEvaluationSnapshot(req, res, next) {
    try {
      const { evaluationId } = req.params;
      const result = await candidateSellingLocationService.getEvaluationSnapshotById(evaluationId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/candidate-selling-locations/evaluation/:evaluationId/explanation
   */
  async getEvaluationExplanation(req, res, next) {
    try {
      const { evaluationId } = req.params;
      const snapshot = await candidateSellingLocationService.getEvaluationSnapshotById(evaluationId);

      return res.status(200).json({
        success: true,
        data: {
          evaluation_id: snapshot.evaluation_id,
          explanations: snapshot.explanations,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/candidate-selling-locations/evaluation/:evaluationId/audit
   */
  async getEvaluationAudit(req, res, next) {
    try {
      const { evaluationId } = req.params;
      const snapshot = await candidateSellingLocationService.getEvaluationSnapshotById(evaluationId);

      return res.status(200).json({
        success: true,
        data: {
          audit: snapshot.audit,
          criteria_specs: snapshot.criteria_specs,
          ideal_positive: snapshot.ideal_positive,
          ideal_negative: snapshot.ideal_negative,
          total_evaluated_candidates: snapshot.total_evaluated_candidates,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const candidateSellingLocationController = new CandidateSellingLocationController();
