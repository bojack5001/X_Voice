# XPOOL AI CONNECT — DATABASE SAFETY & SYNTAX AUDIT REPORT

**Date:** November 9, 2026  
**Target Environment:** Supabase (PostgreSQL 15+)  
**Scope:** Schema definition, table prefix validation, foreign keys, RLS security policies, and PostgreSQL error 42601 analysis.

---

## 1. Analysis of PostgreSQL Error `42601`

### Root Cause
SQLSTATE code `42601` indicates a **PostgreSQL Syntax Error** (`syntax_error`).

In database blueprint documentation, architectural diagrams frequently use Markdown formatting code fences (e.g. ` ```sql `) or Unicode box-drawing characters (e.g. `┌`, `─`, `│`, `└`). When non-SQL characters or markdown formatting are pasted into the **Supabase SQL Editor**, the PostgreSQL lexer fails immediately on line 1, column 1, raising:

```
ERROR: 42601: syntax error at or near "```" (or "┌")
```

### Remediation Applied
1. **Separation of Concerns:** All SQL statements have been extracted into pure SQL files:
   - `SUPABASE_SCHEMA.sql` — Pure PostgreSQL DDL (tables, constraints, triggers, indexes).
   - `RLS_POLICIES.sql` — Pure PostgreSQL DCL (RLS policies, helper functions).
2. **Stripped Non-SQL Tokens:** All Markdown backticks, box-drawing characters, and prose explanations were completely stripped from the SQL files.
3. **Comment Standards:** Only standard ANSI SQL comments (`--` single line or `/* ... */` multiline) are present.
4. **Idempotent Statements:** All DDL commands utilize `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and `DROP POLICY IF EXISTS` to prevent errors upon re-execution.

---

## 2. Table Namespace & Production Isolation (`xai_` Prefix)

To protect existing XPOOL production tables (`drivers`, `passengers`, `rides`, `trips`, `users`, etc.), **every single new table in this module strictly enforces the `xai_` prefix**:

| New Schema Table | Purpose | Core Table Collision Risk |
| :--- | :--- | :--- |
| `xai_company_profile` | Organization profile & simulated telephony demo flags | **Zero** (Isolated) |
| `xai_employees` | Staff roster & role-based permissions (CEO, HR, etc.) | **Zero** (Does not touch `users` or `staff`) |
| `xai_drivers` | Driver onboarding pipeline, consent & DNC tracking | **Zero** (Does not touch production `drivers`) |
| `xai_kyc_documents` | Verification document statuses (Aadhaar, DL, RC) | **Zero** (Does not touch production `documents`) |
| `xai_passengers` | Commuter profiles, consent, and engagement preferences | **Zero** (Does not touch production `passengers`) |
| `xai_ai_agents` | AI voice agent personas, prompts, and language configs | **Zero** (Isolated) |
| `xai_call_records` | Dispatched call logs, transcripts, and outcome tracking | **Zero** (Does not touch production `calls`) |
| `xai_follow_up_tasks` | Manual callback, doc review, and escalation SLA tasks | **Zero** (Does not touch production `tasks`) |
| `xai_lead_imports` | Ingested XLSX batch audits with rejection summaries | **Zero** (Isolated) |

> **Production Safety Confirmation:**  
> Neither `SUPABASE_SCHEMA.sql` nor `RLS_POLICIES.sql` executes any `DROP TABLE`, `ALTER TABLE`, or `TRUNCATE` against non-`xai_` tables. Existing XPOOL production data remains 100% untouched.

---

## 3. Foreign Key & Dependency Integrity Check

All relationships are topological and ordered to eliminate circular dependencies or missing references:

1. **`xai_employees.auth_user_id`** → References `auth.users(id) ON DELETE SET NULL`
   - *Safety:* If a Supabase auth account is deleted, the employee audit history remains preserved.
2. **`xai_kyc_documents.driver_id`** → References `xai_drivers(id) ON DELETE CASCADE`
   - *Safety:* Deleting a lead driver cleans up associated document records.
3. **`xai_call_records.agent_id`** → References `xai_ai_agents(id) ON DELETE SET NULL`
   - *Safety:* Decommissioning or re-training an agent does not orphan or delete historical call records.
4. **`xai_call_records.escalated_to_id`** → References `xai_employees(id) ON DELETE SET NULL`
   - *Safety:* Employee departures retain call escalation logs intact.
5. **`xai_follow_up_tasks.assigned_to_id`** → References `xai_employees(id) ON DELETE SET NULL`
   - *Safety:* Reassignment can occur without violating foreign key constraints.
6. **`xai_lead_imports.imported_by_id`** → References `xai_employees(id) ON DELETE SET NULL`

---

## 4. Row Level Security (RLS) & Role-Based Authorization

The RLS architecture maps to the four roles defined in the application:
- `CEO`
- `HR`
- `Team Leader`
- `Customer Care Executive`

### Role Resolution Helper Function
```sql
CREATE OR REPLACE FUNCTION xai_get_user_role()
RETURNS VARCHAR(32)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role VARCHAR(32);
BEGIN
    SELECT role INTO user_role
    FROM xai_employees
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    RETURN user_role;
END;
$$;
```
*Benefits:*  
- `SECURITY DEFINER` with fixed `search_path = public` prevents privilege escalation or search path attacks.  
- `STABLE` caching optimizes query performance inside RLS policy evaluations.  
- Returns `NULL` for unauthorized or anonymous users.

### Role Permission Matrix

| Table | CEO | HR | Team Leader | Customer Care Exec |
| :--- | :---: | :---: | :---: | :---: |
| `xai_company_profile` | Read / Write | Read Only | Read Only | Read Only |
| `xai_employees` | Full CRUD | Full CRUD | Read Only | Read Only (Self Update) |
| `xai_drivers` | Full CRUD | Read Only | Full CRUD | Read & Update (Notes/Consent) |
| `xai_kyc_documents` | Full CRUD | Read Only | Full CRUD | Read & Update (Verification) |
| `xai_passengers` | Full CRUD | Read Only | Full CRUD | Read & Update (Notes/Consent) |
| `xai_ai_agents` | Full CRUD | Read Only | Full CRUD | Read Only |
| `xai_call_records` | Full CRUD | Read Only | Read / Insert / Update | Read / Insert / Update |
| `xai_follow_up_tasks`| Full CRUD | Read Only | Full CRUD | Read / Insert / Update |
| `xai_lead_imports` | Full CRUD | Read Only | Full CRUD | No Access |

---

## 5. Execution Order for Supabase SQL Editor

When ready to apply these tables in your Supabase project:

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run **`SUPABASE_SCHEMA.sql`** first.
   - Creates the extension `pgcrypto`.
   - Creates the 9 `xai_` tables with data type checks and foreign keys.
   - Creates indexes on search, phone, and consent columns.
   - Installs the automatic `updated_at` trigger.
3. Run **`RLS_POLICIES.sql`** second.
   - Defines the `xai_get_user_role()` resolution function.
   - Enables RLS on all 9 `xai_` tables.
   - Applies granular `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies for the four employee roles.

Both files are validated to be completely free of Markdown fences, non-SQL Unicode characters, or destructive commands.
