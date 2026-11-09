# XPOOL AI CONNECT (XAI) — DATABASE MIGRATION EXECUTION ORDER

**Version:** 3.6 (Security Remediation Architecture)  
**Target Environment:** Supabase (PostgreSQL 15+)  
**Safety Status:** Ready for User Review (DO NOT EXECUTE WITHOUT APPROVAL)

---

## 1. Pre-Migration Prerequisites

1. Ensure you have administrative access to the **Supabase Dashboard** for your project.
2. Verify that existing production tables (`drivers`, `passengers`, `rides`, `users`) are intact.
3. Confirm that no production traffic is executing untested migrations.
4. **Execution Rule:** All scripts must be run in the exact order listed below.

---

## 2. Step-by-Step Execution Sequence

### Step 1: Base Schema, Gating Triggers & Dispatch Function
- **File:** [`SUPABASE_SCHEMA.sql`](file:///c:/X_Voice/SUPABASE_SCHEMA.sql)
- **Target:** Supabase SQL Editor
- **Operations:**
  - Installs extension `"pgcrypto"`.
  - Creates the 12 `xai_` tables in strict topological order.
  - Installs performance, search, and compliance indexes.
  - Installs partial unique index `uq_xai_call_jobs_active_phone` for concurrency protection.
  - Installs `xai_set_updated_at()` trigger function on all tables with pinned `search_path`.
  - Installs security guards:
    - `trg_xai_employees_escalation_guard` (blocks HR self-promotion to CEO and self-governance modifications)
    - `trg_xai_drivers_reassign_guard` (blocks unauthorized driver reassignment)
    - `trg_xai_passengers_reassign_guard` (blocks unauthorized passenger reassignment)
    - `trg_xai_consents_protect` (guarantees consent immutability, blocks deletion, and prevents re-granting revoked consent)
    - `trg_xai_call_jobs_compliance` (enforces contact matching, active staff, CCE assignment scope, consent, suppression, rate limits, and company profile readiness)
    - `trg_xai_call_jobs_transition_guard` (blocks reopening or un-rejecting terminated calls)
  - Installs dispatch function `xai_dispatch_call_job(job_id)` with `FOR UPDATE` locking, returning structured JSONB without rolling back rejection updates.
  - Revokes execution of `xai_dispatch_call_job` from `PUBLIC, anon, authenticated` and grants only to `service_role`.

---

### Step 2: Supabase Storage Configuration & Storage RLS
- **File:** [`STORAGE_POLICIES.sql`](file:///c:/X_Voice/STORAGE_POLICIES.sql)
- **Target:** Supabase SQL Editor
- **Operations:**
  - Ensures the private storage bucket `'xai-kyc-private'` exists (`public = false`, 10 MB file size limit, PDF/image MIME types).
  - Configures download (`SELECT`), upload (`INSERT`), update (`UPDATE`), and deletion (`DELETE`) policies on `storage.objects`.
  - Restricts access to assigned driver folders (`drivers/{driver_id}/...`).

---

### Step 3: Row Level Security & Column Grants
- **File:** [`RLS_POLICIES.sql`](file:///c:/X_Voice/RLS_POLICIES.sql)
- **Target:** Supabase SQL Editor
- **Operations:**
  - Defines role resolution functions with active status checks (`xai_get_user_role()`, `xai_get_employee_id()`, `xai_is_team_lead_of()`) with pinned `search_path`.
  - Revokes execution on helper functions from `PUBLIC, anon` and grants to `authenticated, service_role`.
  - Enables Row Level Security on all 12 `xai_` tables.
  - Revokes table-level SELECT on `xai_kyc_documents` and grants permitted non-sensitive columns only.
  - Applies role-specific policies for:
    - `CEO` (unrestricted company-wide management)
    - `HR` (staff management and compliance audit read-only; no calling initiation; cannot modify CEO or self)
    - `Team Leader` (team-scoped contact management, agent prompt edits, and call dispatch)
    - `Customer Care Executive` (strictly assigned contacts and gated call initiation)

---

## 3. Post-Migration Verification Queries

Execute these queries in the Supabase SQL Editor to confirm that all objects were created properly:

```sql
-- 1. Verify that all 12 xai_ tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'xai_%'
ORDER BY table_name;
-- Expected Result: 12 rows returned.

-- 2. Verify that Row Level Security is active on all 12 tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'xai_%'
ORDER BY tablename;
-- Expected Result: rowsecurity = true for all 12 tables.

-- 3. Verify private KYC storage bucket
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'xai-kyc-private';
-- Expected Result: 1 row returned with public = false.

-- 4. Verify function execution grants (xai_dispatch_call_job restricted to service_role)
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public' AND routine_name = 'xai_dispatch_call_job';
-- Expected Result: grantee = 'service_role' (no authenticated or anon).
```

---

## 4. Security Verification Test Suite

Before exposing APIs to clients, run the verification transactions in a staging/sandbox database from:
- [`SECURITY_TEST_CASES.md`](file:///c:/X_Voice/SECURITY_TEST_CASES.md)

---

## 5. Emergency Containment & Rollback Procedure

Because all tables and policies reside within the `xai_` namespace, an emergency rollback can be executed without impacting core XPOOL tables:

```sql
-- EMERGENCY ROLLBACK SCRIPT (Drops only xai_ tables and isolated storage bucket)
-- WARNING: Only run if rollback is explicitly authorized.
DROP TABLE IF EXISTS public.xai_lead_imports CASCADE;
DROP TABLE IF EXISTS public.xai_follow_up_tasks CASCADE;
DROP TABLE IF EXISTS public.xai_call_records CASCADE;
DROP TABLE IF EXISTS public.xai_call_jobs CASCADE;
DROP TABLE IF EXISTS public.xai_ai_agents CASCADE;
DROP TABLE IF EXISTS public.xai_passengers CASCADE;
DROP TABLE IF EXISTS public.xai_kyc_documents CASCADE;
DROP TABLE IF EXISTS public.xai_drivers CASCADE;
DROP TABLE IF EXISTS public.xai_contact_consents CASCADE;
DROP TABLE IF EXISTS public.xai_suppression_list CASCADE;
DROP TABLE IF EXISTS public.xai_employees CASCADE;
DROP TABLE IF EXISTS public.xai_company_profile CASCADE;

DROP FUNCTION IF EXISTS public.xai_dispatch_call_job(UUID);
DROP FUNCTION IF EXISTS public.xai_validate_call_job_eligibility();
DROP FUNCTION IF EXISTS public.xai_protect_call_job_transitions();
DROP FUNCTION IF EXISTS public.xai_protect_consent_audit_log();
DROP FUNCTION IF EXISTS public.xai_prevent_unauthorized_reassignment();
DROP FUNCTION IF EXISTS public.xai_prevent_employee_self_escalation();
DROP FUNCTION IF EXISTS public.xai_set_updated_at();
DROP FUNCTION IF EXISTS public.xai_is_team_lead_of(VARCHAR);
DROP FUNCTION IF EXISTS public.xai_get_employee_id();
DROP FUNCTION IF EXISTS public.xai_get_user_role();

DELETE FROM storage.buckets WHERE id = 'xai-kyc-private';
```
