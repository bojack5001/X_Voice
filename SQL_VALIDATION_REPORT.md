# XPOOL AI CONNECT (XAI) — SQL SYNTAX & DEPENDENCY VALIDATION REPORT

**Validation Date:** November 9, 2026  
**Dialect:** PostgreSQL 15+ / Supabase  
**Analyzed Files:**
1. `SUPABASE_SCHEMA.sql` (Schema DDL, Triggers, Dispatch Functions & Constraints)
2. `RLS_POLICIES.sql` (Row Level Security & Column Grants)
3. `STORAGE_POLICIES.sql` (Supabase Storage Bucket & Object Policies)

---

## 1. Syntax & Error `42601` Defense Audit

| Validation Check | `SUPABASE_SCHEMA.sql` | `RLS_POLICIES.sql` | `STORAGE_POLICIES.sql` | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Markdown Fences (` ``` `)** | 0 Found | 0 Found | 0 Found | PASS |
| **Box-Drawing Unicode Characters (`┌─│└`)** | 0 Found | 0 Found | 0 Found | PASS |
| **Invalid Statement Terminators (`;`)** | All Valid | All Valid | All Valid | PASS |
| **Reserved Keyword Collisions** | 0 Found | 0 Found | 0 Found | PASS |
| **Enum / CHECK Constraint Syntax** | Valid ANSI SQL | Valid ANSI SQL | Valid ANSI SQL | PASS |
| **Trigger Function Signatures (`RETURNS TRIGGER`)** | Valid PL/pgSQL | N/A | N/A | PASS |
| **Dispatch Function Signature (`RETURNS xai_call_jobs`)** | Valid PL/pgSQL | N/A | N/A | PASS |
| **SECURITY DEFINER search_path Hardening** | `search_path = public` | `search_path = public` | N/A | PASS |

---

## 2. Table Creation Order & Dependency Graph

To prevent foreign-key reference errors (`relation does not exist`), table definitions are ordered topologically:

```
[Level 0] pgcrypto (Extension)
   |
   +---> [Level 1] xai_company_profile
   |
   +---> [Level 2] xai_employees (Links to auth.users, self-ref team_leader_id)
   |        |
   |        +---> [Level 3] xai_suppression_list (FK -> xai_employees)
   |        +---> [Level 3] xai_contact_consents (FK -> xai_employees)
   |        +---> [Level 3] xai_drivers (FK -> xai_employees)
   |        |        |
   |        |        +---> [Level 4] xai_kyc_documents (FK -> xai_drivers, xai_employees)
   |        |
   |        +---> [Level 3] xai_passengers (FK -> xai_employees)
   |        +---> [Level 3] xai_ai_agents
   |        |
   |        +---> [Level 4] xai_call_jobs (FK -> xai_employees, xai_ai_agents)
   |        |        |
   |        |        +---> [Level 5] xai_call_records (FK -> xai_call_jobs, xai_employees)
   |        |        +---> [Level 5] xai_follow_up_tasks (FK -> xai_employees, xai_call_jobs)
   |        |
   |        +---> [Level 4] xai_lead_imports (FK -> xai_employees)
```

**Result:** Zero circular dependencies. Every referenced table is declared prior to its dependent foreign key.

---

## 3. Data Type & Default Value Conformance Check

### 3.1 `TIMESTAMPTZ` and `now()` Standardization
- All timestamps (`created_at`, `updated_at`, `captured_at`, `revoked_at`, `start_time`, `end_time`, `approved_at`, `dispatched_at`) are typed as `TIMESTAMPTZ`.
- Standardized to `now()` across all tables and trigger functions.
- All `updated_at` columns are managed by trigger function `xai_set_updated_at()`.

### 3.2 `next_eligible_contact_date` Verification
- Converted from `VARCHAR` to `TIMESTAMPTZ DEFAULT NULL` on both `xai_drivers` and `xai_passengers`.
- `NULL` explicitly denotes that no future restriction is established.

### 3.3 Deceptive Call Defaults Elimination
- `xai_call_records.status`: Defaults to `'queued'`.
- `xai_call_records.outcome`: Defaults to `NULL`.
- `xai_call_records.sentiment`: Defaults to `NULL`.
- `xai_call_records.audio_duration`: Defaults to `NULL`.

---

## 4. Trigger & Concurrency Validation

1. **Self-Escalation Guard (`trg_xai_employees_escalation_guard`):** Validated to intercept unauthorized modifications to employee roles, permissions, status, and reporting lines.
2. **Reassignment Guard (`trg_xai_drivers_reassign_guard`, `trg_xai_passengers_reassign_guard`):** Validated to restrict ownership transfers to `CEO` and `Team Leader`.
3. **Consent Immutability Guard (`trg_xai_consents_protect`):** Validated to abort `DELETE` statements and protect captured evidence fields.
4. **Call Job Gating Guard (`trg_xai_call_jobs_compliance`):** Validated to verify contact matching, CCE assignment scope, DNC status, and purpose-specific consent.
5. **Partial Unique Index (`uq_xai_call_jobs_active_phone`):** Validated to reject simultaneous concurrent call jobs to the same phone number.
6. **Pre-Dial Dispatch Function (`xai_dispatch_call_job`):** Validated with `FOR UPDATE` row-level locking.

---

## 5. Storage Policy Validation (`STORAGE_POLICIES.sql`)

- Evaluates `(string_to_array(name, '/'))[2]` to resolve target `driver_id`.
- Validates that ordinary staff (CCE) can only upload and read files belonging to their assigned drivers.
- Verified syntax against Supabase storage schema (`storage.buckets` and `storage.objects`).
