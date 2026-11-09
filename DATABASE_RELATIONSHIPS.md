# XPOOL AI CONNECT (XAI) — DATABASE RELATIONSHIPS & DATA MODEL SPECIFICATION

**Version:** 3.5 (Security Remediation Architecture)  
**Target Engine:** PostgreSQL 15+ (Supabase)  
**Namespace:** `xai_` (Isolated from core XPOOL production tables)

---

## 1. Architectural Overview & Entity Hierarchy

The XPOOL AI CONNECT telephony data model is designed around strict legal compliance, assignment-based data isolation, explicit human-in-the-loop calling, and role-based data access.

```
                      +----------------------------+
                      |         auth.users         |
                      |     (Supabase Auth)        |
                      +--------------+-------------+
                                     | (1:1)
                                     v
                      +----------------------------+
                      |       xai_employees        |<------------------+
                      |  (Staff Roster & Roles)    |                   |
                      +--------------+-------------+                   |
                                     | (Team Lead 1:N)                 |
                                     +---------------------------------+
                                     |
         +---------------------------+---------------------------+
         | (1:N Assignment)          | (1:N Initiation)          | (1:N Lead Import)
         v                           v                           v
+------------------+       +-------------------+       +--------------------+
|   xai_drivers    |       |   xai_call_jobs   |       |  xai_lead_imports  |
+--------+---------+       +---------+---------+       +--------------------+
         | (1:N)                     | (1:1/1:N)
         v                           v
+------------------+       +-------------------+
|xai_kyc_documents |       | xai_call_records  |
+------------------+       +---------+---------+
         |                           | (Escalation / Call Task)
         |                           v
+------------------+       +-------------------+
| xai_passengers   |       |xai_follow_up_tasks|
+------------------+       +-------------------+
         ^                           ^
         |                           |
+--------+---------------------------+-------------------------+
|                  Compliance & Regulatory Core                |
|  - xai_contact_consents (Immutable opt-in & revocation log)  |
|  - xai_suppression_list (DNC & regulatory blocks)            |
|  - xai_company_profile  (Tenant compliance declarations)     |
|  - xai_ai_agents        (Regional voice personas)            |
+--------------------------------------------------------------+
```

---

## 2. Table-by-Table Schema & Foreign Key Map

### 2.1 `xai_company_profile`
Corporate legal profile. Starts in an explicit unconfigured state until verified production information is configured.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Configuration record ID |
| `legal_name` | VARCHAR(255) | NOT NULL DEFAULT `'Unconfigured Organization'` | Legal registered name |
| `brand_name` | VARCHAR(100) | NOT NULL DEFAULT `'XPOOL AI CONNECT'` | Brand name |
| `cin` | VARCHAR(64) | NULLABLE | Corporate Identification Number |
| `registered_office` | TEXT | NULLABLE | Physical registered address |
| `support_email` | VARCHAR(255) | NULLABLE | Verified support email |
| `phone` | VARCHAR(32) | NULLABLE | Official telephonic contact |
| `website` | VARCHAR(255) | NULLABLE | Official URL |
| `is_configured` | BOOLEAN | NOT NULL DEFAULT `false` | Explicit configuration readiness gate |
| `environment_notice`| TEXT | NOT NULL DEFAULT `'Awaiting verified corporate profile configuration'` | System banner |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation audit |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

---

### 2.2 `xai_employees`
Staff roster with team hierarchy and self-escalation protection.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Employee ID (e.g., `EMP-1001`) |
| `auth_user_id` | UUID | UNIQUE, FK → `auth.users(id)` ON DELETE SET NULL | Link to Supabase Auth login |
| `name` | VARCHAR(255) | NOT NULL | Full employee name |
| `email` | VARCHAR(255) | UNIQUE NOT NULL | Corporate email |
| `phone` | VARCHAR(32) | NOT NULL | Official contact number |
| `role` | VARCHAR(32) | CHECK IN (`'CEO'`, `'HR'`, `'Team Leader'`, `'Customer Care Executive'`) | Authorization tier |
| `department` | VARCHAR(100) | NOT NULL | Department name |
| `team_name` | VARCHAR(100) | NULLABLE | Operational pod / team name |
| `team_leader_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Reporting manager / Team Lead |
| `status` | VARCHAR(32) | CHECK IN (`'Active'`, `'On Leave'`, `'Inactive'`) | Active employment check |
| `calls_handled` | INT | NOT NULL DEFAULT 0 | Lifetime call counter |
| `last_active` | TIMESTAMPTZ | NULLABLE | Session heartbeat |
| `joined_date` | DATE | NOT NULL DEFAULT CURRENT_DATE | Hire date |
| `permissions` | TEXT[] | NOT NULL DEFAULT `'{}'` | Granular permission flags |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

*Security Guard:* `trg_xai_employees_escalation_guard` blocks ordinary staff from modifying their own `role`, `permissions`, `status`, `department`, `team_leader_id`, or `auth_user_id`.

---

### 2.3 `xai_suppression_list`
National DNC, regulatory opt-outs, and customer-requested telephony blacklists.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Suppression record ID |
| `phone_e164` | VARCHAR(32) | UNIQUE NOT NULL | Normalized phone (+91...) |
| `reason` | TEXT | NOT NULL | Suppression rationale |
| `source` | VARCHAR(64) | CHECK IN (`'National DNC'`, `'Customer Opt-Out'`, `'Staff Manual'`, `'Regulatory Block'`, `'Auto Suppression'`) | Origin channel |
| `added_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Staff who added entry |
| `added_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Timestamp added |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiry timestamp (NULL = indefinite) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation audit |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

---

### 2.4 `xai_contact_consents`
Immutable consent tracking audit log per contact and purpose.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Consent log ID |
| `contact_id` | VARCHAR(32) | NOT NULL | Driver ID or Passenger ID |
| `contact_type` | VARCHAR(16) | CHECK IN (`'Driver'`, `'Passenger'`) | Entity classification |
| `contact_phone` | VARCHAR(32) | NOT NULL | Contact phone number |
| `purpose` | VARCHAR(64) | CHECK IN (`'onboarding'`, `'engagement'`, `'service_updates'`, `'transactional'`, `'feedback'`) | Explicit legal purpose |
| `consent_status` | VARCHAR(32) | CHECK IN (`'Granted'`, `'Unknown'`, `'Revoked'`) | Consent state |
| `consent_source` | VARCHAR(64) | CHECK IN (`'Web Form'`, `'App Registration'`, `'Inbound Call'`, `'Written Agreement'`, `'Excel Import'`, `'IVR Consent Capture'`) | Origin channel |
| `evidence_reference`| TEXT | NOT NULL | Form ID, IP, or document proof |
| `captured_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Timestamp granted |
| `revoked_at` | TIMESTAMPTZ | NULLABLE | Timestamp revoked |
| `revoked_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Staff logging revocation |
| `revocation_reason` | TEXT | NULLABLE | Rationale for revocation |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation audit |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

*Security Guard:* `trg_xai_consents_protect` prevents deletion of records and modification of historical evidence. Revocations must transition `consent_status` to `'Revoked'` with `revoked_at` recorded.

---

### 2.5 `xai_drivers`
Driver onboarding pipeline with team assignments and rate limits.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Driver identifier |
| `name` | VARCHAR(255) | NOT NULL | Driver partner name |
| `phone` | VARCHAR(32) | UNIQUE NOT NULL | Primary mobile number |
| `email` | VARCHAR(255) | NULLABLE | Email address |
| `city` | VARCHAR(100) | NOT NULL | Operational hub city |
| `vehicle_type` | VARCHAR(32) | CHECK IN (`'Auto'`, `'Bike'`, `'Hatchback'`, `'Sedan'`, `'SUV'`, `'EV Auto'`) | Vehicle category |
| `vehicle_number` | VARCHAR(32) | NOT NULL | Registration plate |
| `status` | VARCHAR(32) | CHECK IN (`'lead'`, `'contacted'`, `'docs_pending'`, `'verification'`, `'training'`, `'onboarded'`, `'rejected'`) | Pipeline phase |
| `preferred_language` | VARCHAR(32) | CHECK IN (`'Tamil'`, `'Telugu'`, `'English'`) | Active supported language |
| `assigned_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Assigned CCE |
| `assigned_team_leader_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Assigned Team Leader |
| `next_eligible_contact_date` | TIMESTAMPTZ | NULLABLE DEFAULT NULL | Rate limit cooldown (NULL = unrestricted) |
| `ai_call_attempts` | INT | NOT NULL DEFAULT 0 | Outbound call counter |
| `last_call_outcome` | VARCHAR(64) | NULLABLE | Outcome of last call |
| `last_contacted_at` | TIMESTAMPTZ | NULLABLE | Last contact timestamp |
| `compliance_score` | INT | CHECK (0 - 100) | Onboarding score |
| `rating` | NUMERIC(3, 2) | CHECK (1.00 - 5.00) | Driver partner rating |
| `notes` | TEXT | NULLABLE | Operational notes |
| `joined_date` | DATE | NOT NULL DEFAULT CURRENT_DATE | Registration date |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation audit |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

*Security Guard:* `trg_xai_drivers_reassign_guard` prevents ordinary staff from modifying ownership assignments (`assigned_employee_id`, `assigned_team_leader_id`).

---

### 2.6 `xai_kyc_documents`
Driver partner KYC verification with private storage paths and masked document numbers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Document record ID |
| `driver_id` | VARCHAR(32) | NOT NULL, FK → `xai_drivers(id)` ON DELETE CASCADE | Target driver |
| `document_type` | VARCHAR(64) | CHECK IN (`'Aadhaar'`, `'Driving License'`, `'RC Book'`, `'Vehicle Insurance'`, `'Police Verification'`) | Category |
| `document_number_masked` | VARCHAR(64) | NOT NULL | Masked display (e.g. `XXXX-XXXX-1234`) |
| `document_number_secure` | VARCHAR(128) | RESTRICTED (Revoked from general SELECT) | Raw identifier for verified audit |
| `storage_bucket` | VARCHAR(64) | NOT NULL DEFAULT `'xai-kyc-private'` | Private Supabase bucket |
| `storage_path` | TEXT | NOT NULL | Path in private bucket |
| `status` | VARCHAR(32) | DEFAULT `'Pending Review'` CHECK IN (`'Verified'`, `'Pending Review'`, `'Missing'`, `'Rejected'`) | Verification state |
| `verified_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Reviewing staff |
| `verified_at` | TIMESTAMPTZ | NULLABLE | Verification timestamp |
| `rejection_reason` | TEXT | NULLABLE | Rejection explanation |
| `notes` | TEXT | NULLABLE | Verification notes |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Ingestion timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

---

### 2.7 `xai_call_jobs`
Strict dispatch authorization queue. Outbound calls cannot be initiated without an Authorized job.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Call job ID |
| `idempotency_key` | VARCHAR(128) | UNIQUE NOT NULL | Prevents duplicate dialing |
| `contact_id` | VARCHAR(32) | NOT NULL | Target contact ID |
| `contact_type` | VARCHAR(16) | CHECK IN (`'Driver'`, `'Passenger'`) | Contact type |
| `contact_phone` | VARCHAR(32) | NOT NULL | Target phone number |
| `initiated_by_employee_id` | VARCHAR(32) | NOT NULL, FK → `xai_employees(id)` | Employee who requested call |
| `approved_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Approving supervisor |
| `agent_id` | VARCHAR(32) | FK → `xai_ai_agents(id)` ON DELETE SET NULL | AI Persona ID |
| `agent_type` | VARCHAR(64) | NOT NULL | AI Persona label |
| `language` | VARCHAR(32) | CHECK IN (`'Tamil'`, `'Telugu'`, `'English'`) | Supported regional language |
| `call_purpose` | VARCHAR(64) | CHECK IN (`'onboarding'`, `'engagement'`, `'service_updates'`, `'transactional'`, `'feedback'`) | Purpose matching consent |
| `authorization_status` | VARCHAR(32) | CHECK IN (`'Pending Check'`, `'Authorized'`, `'Rejected Contact Mismatch'`, `'Rejected Unassigned Contact'`, `'Rejected Inactive Staff'`, `'Rejected Consent Missing'`, `'Rejected DNC'`, `'Rejected Rate Limited'`, `'Revoked'`) | Automated check outcome |
| `call_status` | VARCHAR(32) | NOT NULL DEFAULT `'created'` CHECK IN (`'created'`, `'queued'`, `'initiating'`, `'in_progress'`, `'completed'`, `'failed'`, `'cancelled'`) | Telephony state |
| `provider_call_sid` | VARCHAR(128) | UNIQUE NULLABLE | Exotel Call SID |
| `provider_status` | VARCHAR(64) | NULLABLE | Exotel provider status |
| `provider_response` | JSONB | NOT NULL DEFAULT `'{}'` | Webhook response payload |
| `rejection_reason` | TEXT | NULLABLE | Gating rejection reason |
| `approved_at` | TIMESTAMPTZ | NULLABLE | Approval timestamp |
| `dispatched_at` | TIMESTAMPTZ | NULLABLE | Dispatch timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation audit |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

*Concurrency Guard:* `uq_xai_call_jobs_active_phone` enforces at most one active call job (`queued`, `initiating`, `in_progress`) per phone number.

---

### 2.8 `xai_call_records`
Audit record of completed or failed telephonic interactions, transcripts, and Exotel metadata.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(32) | PRIMARY KEY | Call record ID (e.g., `CALL-1001`) |
| `call_job_id` | UUID | FK → `xai_call_jobs(id)` ON DELETE SET NULL | Linked dispatch job |
| `contact_id` | VARCHAR(32) | NOT NULL | Driver or Passenger ID |
| `contact_name` | VARCHAR(255) | NOT NULL | Target contact name |
| `contact_phone` | VARCHAR(32) | NOT NULL | Target phone number |
| `contact_type` | VARCHAR(16) | CHECK IN (`'Driver'`, `'Passenger'`) | Contact type |
| `agent_id` | VARCHAR(32) | FK → `xai_ai_agents(id)` ON DELETE SET NULL | AI Agent persona |
| `agent_name` | VARCHAR(100) | NOT NULL | AI Agent name |
| `language` | VARCHAR(32) | CHECK IN (`'Tamil'`, `'Telugu'`, `'English'`) | Language used |
| `status` | VARCHAR(32) | DEFAULT `'queued'` CHECK IN (`'queued'`, `'ringing'`, `'in_progress'`, `'completed'`, `'failed'`, `'cancelled'`, `'transferred'`) | Call session status |
| `start_time` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Dial start timestamp |
| `end_time` | TIMESTAMPTZ | NULLABLE | Session termination |
| `duration_seconds` | INT | NOT NULL DEFAULT 0 | Duration in seconds |
| `audio_duration` | VARCHAR(16) | NULLABLE | Duration string |
| `outcome` | VARCHAR(64) | NULLABLE CHECK IN (`'Interested'`, `'Callback Requested'`, `'Language Barrier'`, `'Docs Submitted'`, `'Not Reachable'`, `'Escalated to Human'`, `'Completed'`, `'Call Dropped'`, `'Pending Outcome'`, `'Refused Consent'`) | Genuine call outcome |
| `sentiment` | VARCHAR(32) | NULLABLE CHECK IN (`'Positive'`, `'Neutral'`, `'Negative'`, `'Unanalyzed'`) | Sentiment classification |
| `transcript` | JSONB | NOT NULL DEFAULT `'[]'` | Structured dialogue entries |
| `key_notes` | TEXT | NULLABLE | Call summary notes |
| `action_item` | TEXT | NULLABLE | Immediate next action |
| `escalated_to_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Human assignee |
| `provider_call_sid` | VARCHAR(128) | NULLABLE | Exotel Call SID |
| `provider_status` | VARCHAR(64) | NULLABLE | Exotel status |
| `provider_recording_path` | TEXT | NULLABLE | Private storage audio path |
| `provider_cost` | NUMERIC(8, 4) | DEFAULT 0.0000 | Telephony fee in INR |
| `provider_metadata` | JSONB | NOT NULL DEFAULT `'{}'` | Exotel webhook payload |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Audit log timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Trigger-managed timestamp |

---

## 3. Team Ownership & Assignment Flow

1. **Manager to Team Leader to Executive Hierarchy**:
   - Every `xai_employees` record can specify a `team_leader_id` pointing to another active employee.
   - The helper function `xai_is_team_lead_of(subordinate_id)` determines supervisor authority dynamically and validates that both employees are currently `status = 'Active'`.
2. **Contact Allocation**:
   - `xai_drivers` and `xai_passengers` link to `assigned_employee_id` (Customer Care Executive) and `assigned_team_leader_id` (Team Leader).
   - Staff cannot modify these assignment columns unless their role is `CEO` or `Team Leader`.
3. **Task & Escalation Routing**:
   - `xai_follow_up_tasks` assigns tickets to specific employees (`assigned_to_id`) while linking to the team leader (`team_leader_id`).

---

## 4. Telephony Integration & Concurrency Flow

```
[Customer Care Executive clicks "Call Contact"]
           |
           v
[INSERT INTO xai_call_jobs (with unique idempotency_key)]
           |
           v
[BEFORE INSERT Trigger: xai_validate_call_job_eligibility()]
   |-- 1. Verify initiator is Active & permitted role
   |-- 2. Verify contact exists & phone matches record
   |-- 3. Verify contact is assigned to initiator (if CCE)
   |-- 4. Check xai_suppression_list (DNC) ---------> IF MATCH: Reject ('Rejected DNC')
   |-- 5. Check xai_contact_consents (Purpose) ------> IF MISSING/REVOKED: Reject ('Rejected Consent Missing')
   |-- 6. Check next_eligible_contact_date ----------> IF NOT ELIGIBLE: Reject ('Rejected Rate Limited')
   +-- 7. ALL CHECKS PASS ---------------------------> Authorize ('Authorized', approved_at = now())
           |
           v
[Backend Dispatcher calls xai_dispatch_call_job(job_id)]
   |-- Acquires exclusive FOR UPDATE row lock on call job
   |-- Re-validates DNC and Consent immediately prior to dialing
   |-- Sets call_status = 'initiating', dispatched_at = now()
   +-- Calls Exotel REST API -> Receives provider_call_sid
           |
           v
[Exotel Webhook Callback (Authenticated Service Role)]
   |-- Updates provider_status ('completed', 'busy', 'no-answer')
   +-- Stores audio recording in private storage
   +-- Inserts finalized interaction into xai_call_records
```
