# MOVA — RC-1 Release Manifest

```yaml
# ==============================================================================
#                       MOVA RELEASE CANDIDATE 1 MANIFEST                       
# ==============================================================================

release_metadata:
  product_name: "MOVA (MantaKopi Operational Vehicle Analytics & DSS)"
  release_tag: "v1.0.0-rc.1"
  qualification_status: "QUALIFIED WITHIN AUDITED SCOPE"
  scope_status: "FROZEN"
  audit_verdict: "0 RC-1 BLOCKERS"
  release_date: "2026-09-08"

runtime_environment:
  backend_runtime: "Bun >= 1.4.0 (TypeScript 5.7+)"
  frontend_runtime: "Node >= 22.0.0 (Vite 8.2.2, Svelte 5.56+)"
  database_engine: "PostgreSQL >= 16.0 with PostGIS Spatial Extension"
  cache_queue_engine: "Redis >= 7.0 (BullMQ 6.0+)"

baseline_specifications:
  openapi_contract_version: "v4.2.0"
  database_migrations_range: "001_initial_schema.sql -> 019_operational_reporting_schema.sql"
  tenant_isolation_mode: "PostgreSQL FORCE ROW LEVEL SECURITY (mova_app NOBYPASSRLS)"
  dss_mathematical_model: "Best-Worst Method (BWM) + TOPSIS"

test_verification_metrics:
  backend_unit_test_files: 17
  backend_tests_passed: 286
  backend_assertions: 765
  frontend_test_files: 2
  frontend_tests_passed: 26
  frontend_assertions: 118
  total_test_files: 19
  total_tests_passed: 312
  total_tests_failed: 0
  total_assertions_evaluated: 883
  svelte_type_diagnostics: "0 errors / 0 warnings"
  frontend_production_build: "PASS"

audit_domain_matrix_summary:
  total_domains_evaluated: 22
  pass: 17
  partial: 2
  pass_note_or_ui: 2
  not_verified: 1
  rc1_blockers: 0

capability_exclusions:
  deferred_features:
    - id: "SALES_SETTLEMENT_REPORT"
      reason: "Missing tenant_id on shift_settlements; deferred to preserve strict RLS boundary"
  post_rc_backlog:
    - "Socket.IO legacy fallback room deprecation"
    - "Dedicated Redis BullMQ Dead Letter Queue (DLQ)"
    - "Automated physical database backup/restore testing in CI/CD"
    - "Express 5 Request typing cleanup in legacy controllers"

manifest_signoff:
  status: "LOCKED AND READY FOR DEPLOYMENT VALIDATION (PILLAR 2)"
  author: "Antigravity AI & Human Lead"
```
