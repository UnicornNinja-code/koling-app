/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   auditController.js (HTTP Controller for Audit Logs)
 */

import { auditService } from "../services/auditService.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { user_id, action, entity_type, status, page, limit } = req.query;
    const result = await auditService.getAuditLogs({
      userId: user_id,
      action,
      entityType: entity_type,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
