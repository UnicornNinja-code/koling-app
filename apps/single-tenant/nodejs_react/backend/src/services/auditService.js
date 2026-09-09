/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   auditService.js (Clean Architecture Singleton Service for Audit Logs)
 */

import { auditRepository } from "../repositories/auditRepository.js";

export class AuditService {
  static instance = null;

  constructor(repo = auditRepository) {
    if (AuditService.instance && repo === auditRepository) {
      return AuditService.instance;
    }
    this.repo = repo;
    if (repo === auditRepository) {
      AuditService.instance = this;
    }
  }

  static getInstance() {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Fetch audit logs list
   */
  async getAuditLogs(filters = {}) {
    const logs = await this.repo.findAuditLogs(filters);
    return {
      logs,
      count: logs.length,
      page: filters.page || 1,
      limit: filters.limit || 50,
    };
  }
}

export const auditService = AuditService.getInstance();
