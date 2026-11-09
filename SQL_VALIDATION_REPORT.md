# XPOOL AI CONNECT (XAI) — SQL SYNTAX & DEPENDENCY VALIDATION REPORT

**Validation Date:** November 9, 2026  
**Dialect:** PostgreSQL 15+ / Supabase  
**Analyzed Files:**
1. `SUPABASE_SCHEMA.sql` (Schema DDL, Constraints, Indexes & Triggers)
2. `RLS_POLICIES.sql` (Row Level Security & Column Grants)

---

## 1. Syntax & Error `42601` Defense Audit

| Validation Check | `SUPABASE_SCHEMA.sql` | `RLS_POLICIES.sql` | Status |
| :--- | :---: | :---: | :---: |
| **Markdown Fences (` ``` `)** | 0 Found | 0 Found | PASS |
| **Box-Drawing Unicode Characters (`┌─│└`)** | 0 Found | 0 Found | PASS |
| **Invalid Statement Terminators (`;`)** | All Valid | All Valid | PASS |
| **Reserved Keyword Collisions** | 0 Found | 0 Found | PASS |
| **Enum / CHECK Constraint Syntax** | Valid ANSI SQL | Valid ANSI SQL | PASS |
| **Trigger Function Signature (`RETURNS TRIGGER`)** | Valid PL/pgSQL | N/A | PASS |
| **SECURITY DEFINER search_path Hardening** | Valid | `search_path = public` | PASS |

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
   |        +---> [Level 3] xai_contact_consents
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
- All timestamps (`created_at`, `updated_at`, `captured_at`, `revoked_at`, `start_time`, `end_time`) are typed as `TIMESTAMPTZ`.
- Standardized to `now()` (PostgreSQL standard equivalent to `CURRENT_TIMESTAMP`).
- All `updated_at` columns are managed by trigger function `xai_set_updated_at()`.

### 3.2 `next_eligible_contact_date` Verification
- Converted from `VARCHAR` to `TIMESTAMPTZ DEFAULT NULL` on both `xai_drivers` and `xai_passengers`.
- `NULL` explicitly denotes that no future restriction is established.

### 3.3 Deceptive Call Defaults Elimination
- `xai_call_records.status`: Defaults to `'queued'` (was `'completed'`).
- `xai_call_records.outcome`: Defaults to `NULL` (no longer auto-populates `'Interested'`).
- `xai_call_records.sentiment`: Defaults to `NULL` (no longer auto-populates `'Neutral'`).
- `xai_call_records.audio_duration`: Defaults to `NULL` (no longer hardcoded to `'00:00'`).

---

## 4. RLS Policy & Role Access Matrix

### 4.1 Recursive Query Prevention
Policies do not execute recursive table joins to check roles. Role resolution is encapsulated in `xai_get_user_role()`, declared as:
- `SECURITY DEFINER`
- `STABLE` (cached for the query duration)
- `SET search_path = public` (prevents malicious schema override)

### 4.2 Role Permission Coverage

| Entity | CEO | HR | Team Leader | Customer Care Exec |
| :--- | :---: | :---: | :---: | :---: |
| `xai_company_profile` | Read / Write | Read Only | Read Only | Read Only |
| `xai_employees` | Full CRUD | Full CRUD | Directory Read | Self-Update Only |
| `xai_suppression_list` | Full CRUD | Read / Insert | Read / Insert / Update | Read / Insert (Opt-Out) |
| `xai_contact_consents` | Full CRUD | Read Only | Read / Insert / Update | Read / Insert / Revoke |
| `xai_drivers` | Full CRUD | Read Only | Team Scope CRUD | Assigned Scope Read/Update |
| `xai_kyc_documents` | Full CRUD | Audit Read / Verify | Team Scope / Verify | Masked Scope Read Only |
| `xai_passengers` | Full CRUD | Read Only | Team Scope CRUD | Assigned Scope Read/Update |
| `xai_ai_agents` | Full CRUD | Read Only | Full CRUD | Read Only |
| `xai_call_jobs` | Full CRUD | Read Only | Team Initiate / Approve | Self Initiate (Gated) |
| `xai_call_records` | Full CRUD | Read Only | Team Read / Insert / Update | Assigned Read / Note Update |
| `xai_follow_up_tasks`| Full CRUD | Read Only | Team Scope CRUD | Assigned Scope Update |
| `xai_lead_imports` | Full CRUD | Audit Read | Full CRUD | No Access |

---

## 5. Execution Pre-Flight Checklist

Before running these scripts in the Supabase SQL Editor:
1. Ensure the target Supabase project is active.
2. Confirm the user executing the script has admin privileges in Supabase.
3. Run `SUPABASE_SCHEMA.sql` first.
4. Run `RLS_POLICIES.sql` second.
5. Both files are safe to re-run (idempotent DDL and `DROP POLICY IF EXISTS`).
