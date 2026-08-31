/*
 * auditService.ts
 * Clean Architecture Singleton Service for Audit Logs in TypeScript
 */

import { auditRepository, AuditRepository } from "../repositories/auditRepository.js";

export class AuditService {
  private static instance: AuditService | null = null;
  private repo: AuditRepository;

  constructor(repo: AuditRepository = auditRepository) {
    if (AuditService.instance && repo === auditRepository) {
      return AuditService.instance;
    }
    this.repo = repo;
    if (repo === auditRepository) {
      AuditService.instance = this;
    }
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Fetch audit logs list
   */
  public async getAuditLogs(filters: any = {}): Promise<{ logs: any[]; count: number; page: number; limit: number }> {
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
