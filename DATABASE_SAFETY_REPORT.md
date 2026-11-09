# XPOOL AI CONNECT (XAI) — DATABASE SAFETY & INTEGRITY REPORT

**Document Version:** 3.0  
**Target Database:** PostgreSQL 15+ (Supabase)  
**Security Status:** Production-Safe  
**Execution Status:** Awaiting User Review & Approval (NOT EXECUTED)

---

## 1. Zero Impact on Existing XPOOL Production Database

### 1.1 Complete Namespace Isolation (`xai_` Prefix)
All objects created by this specification strictly adhere to the `xai_` namespace prefix. No core XPOOL tables are touched, altered, migrated, or dropped.

| New Schema Table | Purpose | Core XPOOL Table Collision Risk |
| :--- | :--- | :--- |
| `xai_company_profile` | Telephony tenant configuration & compliance notices | **Zero** (Isolated) |
| `xai_employees` | Staff roster with roles (`CEO`, `HR`, `Team Leader`, `CCE`) | **Zero** (Does not touch core `users` / `staff`) |
| `xai_suppression_list` | Mandatory DNC, opt-out, and regulatory blacklist | **Zero** (Isolated) |
| `xai_contact_consents` | Purpose-specific consent audit log with evidence links | **Zero** (Isolated) |
| `xai_drivers` | Driver onboarding pipeline, language & team allocation | **Zero** (Does not touch production `drivers`) |
| `xai_kyc_documents` | Driver KYC status, masked numbers & private storage paths | **Zero** (Does not touch production `documents`) |
| `xai_passengers` | Commuter profiles, contact schedule & preferences | **Zero** (Does not touch production `passengers`) |
| `xai_ai_agents` | AI persona configurations and prompt templates | **Zero** (Isolated) |
| `xai_call_jobs` | Dispatch authorization queue with idempotency keys | **Zero** (Does not touch production `dispatches`) |
| `xai_call_records` | Audit log of completed calls, transcripts & Exotel SIDs | **Zero** (Does not touch production `calls`) |
| `xai_follow_up_tasks` | Manual callback, escalation, and SLA tracking | **Zero** (Does not touch production `tasks`) |
| `xai_lead_imports` | Ingested XLSX batch audits with rejection summaries | **Zero** (Isolated) |

> **Production Safety Confirmation:**  
> Neither `SUPABASE_SCHEMA.sql` nor `RLS_POLICIES.sql` executes any `DROP TABLE`, `ALTER TABLE`, or `TRUNCATE` against non-`xai_` tables. All existing XPOOL production tables (`drivers`, `passengers`, `rides`, `trips`, `vehicles`, `wallets`, `users`) remain 100% untouched.

---

## 2. Sensitive KYC Storage & Privacy Protection

### 2.1 PII & Government ID Protection
- **No Raw Aadhaar / Driving Licence Exposure:** Ordinary staff (Customer Care Executives) are prevented from seeing raw identity documents.
- **Masked Document Numbers:** The schema provides `document_number_masked` (e.g. `XXXX-XXXX-1234` or `TN-01-XXXXXXX`) for identification without exposing full numbers.
- **Column-Level Revocation:** Direct `SELECT` permission on `document_number_encrypted` is revoked from general authenticated roles in `RLS_POLICIES.sql`:
  ```sql
  REVOKE SELECT (document_number_encrypted) ON xai_kyc_documents FROM authenticated;
  ```
- **Private Storage Buckets Only:** Public URLs have been eliminated. All document files are designated to the private storage bucket `xai-kyc-private` and accessed exclusively via short-lived authenticated signed URLs.

---

## 3. Mandatory Telephony Safety & Compliance Controls

### 3.1 Database-Level Compliance Guardrails
To prevent accidental or automated batch dialing, call dispatch requires creating a row in `xai_call_jobs`. An automatic PostgreSQL trigger (`trg_xai_call_jobs_compliance`) executes prior to insertion:

1. **DNC Suppression Check:** Rejects the call job immediately (`authorization_status = 'Rejected DNC'`) if the phone number is on `xai_suppression_list`.
2. **Purpose-Specific Consent Check:** Rejects the call job (`authorization_status = 'Rejected Consent Missing'`) if an active `Granted` record is not found in `xai_contact_consents` matching the specific `call_purpose`.
3. **Contact Frequency & Rate Limiting:** Evaluates `next_eligible_contact_date` on the target driver or passenger. Rejects (`authorization_status = 'Rejected Rate Limited'`) if the contact is in a cooldown period.
4. **Idempotency Guarantee:** Every job enforces a unique `idempotency_key` to prevent duplicate dialing caused by network retries or repeated user clicks.

### 3.2 Removal of Deceptive Default Outcomes
In `xai_call_records`:
- Default status is changed to honest initial state (`'queued'`).
- Deceptive defaults (`'completed'`, `'Interested'`, `'Neutral'`) have been removed. Outcomes default to `NULL` or `'Pending Outcome'`.
- Audio duration defaults to `NULL` until populated by the Exotel telephony provider webhook.

---

## 4. Foreign Key Integrity & Audit Preservation

| Foreign Key | Target | On Delete Behavior | Audit Preservation Guarantee |
| :--- | :--- | :--- | :--- |
| `xai_employees.auth_user_id` | `auth.users(id)` | `SET NULL` | Employee records and past audit logs survive user account deletion. |
| `xai_employees.team_leader_id` | `xai_employees(id)` | `SET NULL` | Staff reorganization does not break reporting trees. |
| `xai_kyc_documents.driver_id` | `xai_drivers(id)` | `CASCADE` | KYC documents are strictly bound to driver partner lifecycle. |
| `xai_call_jobs.initiated_by_employee_id` | `xai_employees(id)` | `RESTRICT` | Initiator employee cannot be deleted if active dispatch jobs exist. |
| `xai_call_records.call_job_id` | `xai_call_jobs(id)` | `SET NULL` | Historical call audit log survives job cleanup. |
| `xai_call_records.escalated_to_id` | `xai_employees(id)` | `SET NULL` | Preserves escalation records even if staff departs. |
| `xai_follow_up_tasks.assigned_to_id` | `xai_employees(id)` | `SET NULL` | Tasks can be reassigned without violating constraints. |

---

## 5. Row Level Security & Multi-Tier Role Permissions

Row Level Security is enabled on **all 12 tables**. Authorization is verified at the database layer via `xai_get_user_role()`, which resolves the authenticated session `auth.uid()` against `xai_employees`:

1. **`CEO`**: Unrestricted management access across all tables, system configuration, agent prompts, and administrative overrides.
2. **`HR`**: Management of `xai_employees`, audit read-only access to call logs and compliance reports. **HR is strictly prohibited from initiating calls or dispatching jobs.**
3. **`Team Leader`**: Team-scoped management over assigned drivers, passengers, tasks, AI agent prompts, and dispatch approvals.
4. **`Customer Care Executive`**: Operational read/write for assigned contacts, task completion, and manual call initiation (subject to automated database compliance checks). Sensitive KYC decryption and suppression modification are restricted.
