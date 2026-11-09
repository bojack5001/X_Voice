# XPOOL AI CONNECT (XAI) — DATABASE SAFETY & INTEGRITY REPORT

**Document Version:** 3.6 (Security Remediation Architecture)  
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
> Neither `SUPABASE_SCHEMA.sql`, `RLS_POLICIES.sql`, nor `STORAGE_POLICIES.sql` executes any `DROP TABLE`, `ALTER TABLE`, or `TRUNCATE` against non-`xai_` tables. All existing XPOOL production tables (`drivers`, `passengers`, `rides`, `trips`, `vehicles`, `wallets`, `users`) remain 100% untouched.

---

## 2. HR & Employee Privilege Escalation Protections (v3.6)

1. **HR Self-Promotion Elimination:**  
   The trigger `trg_xai_employees_escalation_guard` intercepts any update attempting to assign `role = 'CEO'`. Unless the authenticated caller's active role in `xai_employees` is currently `'CEO'`, PostgreSQL aborts the transaction with `'Access Denied: Only existing CEO accounts can assign the CEO role'`.
2. **HR Cannot Self-Modify Governance Attributes:**  
   If an HR employee attempts to modify their own `role`, `status`, `permissions`, `team_leader_id`, `department`, or `auth_user_id`, the trigger aborts with an `'Access Denied'` exception. Only another authorized administrator (or CEO) can alter an HR employee's record.
3. **Active Employment Gating:**  
   `xai_get_user_role()` and `xai_get_employee_id()` require `status = 'Active'`. Any employee marked `'On Leave'` or `'Inactive'` immediately loses all administrative and calling privileges.
4. **Search Path Hardening:**  
   All functions explicitly declare `SET search_path = public, pg_temp;` and fully qualify table references with `public.` to prevent search path hijacking.

---

## 3. Privileged Function Security & Controlled Returns

1. **Execution Revocation:**  
   `xai_dispatch_call_job(UUID)` has execution explicitly revoked from `PUBLIC`, `anon`, and `authenticated`. Only the trusted server-side worker role (`service_role`) can invoke dispatch.
2. **Controlled JSONB Return (No Rolled-Back Updates):**  
   Prior architectures updated the database to mark a call rejected and then executed `RAISE EXCEPTION`, which inadvertently caused PostgreSQL to rollback the rejection update.  
   In v3.6, `xai_dispatch_call_job` updates the row to `call_status = 'cancelled'` and `authorization_status = 'Rejected ...'`, commits the state, and returns a structured `JSONB` response (`{ success: false, rejection_reason: '...' }`). Rejections are reliably persisted for compliance audit.

---

## 4. Consent Immutability & Latest-State Resolution

1. **Strict Immutability:**  
   `trg_xai_consents_protect` completely blocks `DELETE` operations on `xai_contact_consents`.
2. **No Re-Granting on Revoked Rows:**  
   Attempting to update an existing `consent_status = 'Revoked'` row back to `'Granted'` is rejected by trigger. A new evidence-backed record must be inserted.
3. **Latest-State Resolution:**  
   Call gating evaluates the most recent consent event (`ORDER BY captured_at DESC, created_at DESC LIMIT 1`). If the latest recorded event is `'Revoked'`, subsequent outbound calls are blocked even if prior `'Granted'` events exist.

---

## 5. KYC Document Security & Storage Boundaries

1. **Table-Level Revocation Before Column Grants:**  
   `RLS_POLICIES.sql` explicitly executes:
   ```sql
   REVOKE ALL ON xai_kyc_documents FROM PUBLIC, authenticated, anon;
   ```
   before selectively granting access only to permitted non-sensitive and masked columns (`document_number_masked`, `storage_path`, `status`, etc.).
2. **Sequestered Document Identifiers:**  
   The raw document identifier column (`document_number_secure`) is **not granted** to the `authenticated` role. Ordinary staff cannot read raw Aadhaar or Driving License numbers.
3. **Private Storage Isolation (`STORAGE_POLICIES.sql`):**  
   - KYC documents are uploaded to private bucket `'xai-kyc-private'` (`public = false`).
   - Object paths follow `drivers/{driver_id}/{doc_id}.pdf`.
   - Storage RLS verifies that Customer Care Executives can only download or upload documents for their assigned drivers.
   - Deletion of verification files is strictly restricted to the `CEO`.

---

## 6. Telephony Dispatch Gating & Concurrency Protection

1. **Verification of Target Contact Identity:**  
   Prior to creating a call job, `xai_validate_call_job_eligibility()` checks that `contact_id`, `contact_type`, and `contact_phone` match an authentic row in `xai_drivers` or `xai_passengers`.
2. **Multi-Step Gating:**  
   - Validates that the initiating employee is `status = 'Active'` and holds an authorized role (`CEO`, `Team Leader`, `Customer Care Executive`).
   - If initiator is CCE, verifies that the target contact is assigned to them.
   - Verifies phone is not present on `xai_suppression_list`.
   - Verifies active purpose-specific `Granted` consent in `xai_contact_consents`.
   - Verifies frequency rate limit (`next_eligible_contact_date`).
   - Verifies `xai_company_profile.is_configured = true`.
3. **Concurrency Protection:**  
   Partial unique index:
   ```sql
   CREATE UNIQUE INDEX uq_xai_call_jobs_active_phone
       ON xai_call_jobs(contact_phone)
       WHERE call_status IN ('queued', 'initiating', 'in_progress');
   ```
   guarantees that multiple concurrent requests cannot initiate simultaneous calls to the same phone number.
4. **Pre-Dial Immediate Re-Verification:**  
   The security definer function `xai_dispatch_call_job(job_id)` acquires an exclusive row lock (`FOR UPDATE`), re-checks suppression and consent immediately before dialing, and transitions the state to `'initiating'`.

---

## 7. Security Assumptions & Limitations

1. **Supabase `service_role` Key Confidentiality:**  
   The database architecture assumes the Supabase `service_role` key is strictly kept in secure server-side environments (e.g. backend dispatch worker, n8n webhook listener, edge functions) and is **never bundled into client-side code**.
2. **KMS / Column Encryption Delegation:**  
   The column `document_number_secure` is protected via PostgreSQL column-level permission grants and RLS. If end-to-end hardware-level encryption is required by enterprise compliance (e.g. ISO 27001 / SOC 2), database-level transparent data encryption (TDE) or application-layer AES-GCM envelope encryption using AWS KMS or Vault must be integrated prior to storing production IDs.
3. **Provider Webhook Authenticity:**  
   Webhook callbacks from Exotel must be validated server-side (via signature verification / shared auth token) before invoking updates on `xai_call_records` or `xai_call_jobs`.
4. **Clock Synchronization:**  
   Gating mechanisms rely on PostgreSQL `now()` (UTC). System servers running background workers and Supabase database instances must remain synchronized via NTP.
