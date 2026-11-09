# XPOOL AI CONNECT (XAI) — DATABASE RELATIONSHIPS & DATA MODEL SPECIFICATION

**Version:** 3.0  
**Target Engine:** PostgreSQL 15+ (Supabase)  
**Namespace:** `xai_` (Isolated from core XPOOL production tables)

---

## 1. Architectural Overview & Entity Hierarchy

The XPOOL AI CONNECT telephony data model is designed around strict legal compliance, explicit human-in-the-loop calling, and role-based data access.

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
                                     | (Escalation / Call Task)
                                     v
+------------------+       +-------------------+
| xai_passengers   |       |xai_follow_up_tasks|
+------------------+       +-------------------+
         ^                           ^
         |                           |
+--------+---------------------------+-------------------------+
|                  Compliance & Regulatory Core                |
|  - xai_contact_consents (Explicit purpose-bound opt-in)      |
|  - xai_suppression_list (DNC & regulatory blocks)            |
|  - xai_company_profile  (Tenant compliance declarations)     |
|  - xai_ai_agents        (Regional voice personas)            |
+--------------------------------------------------------------+
```

---

## 2. Table-by-Table Schema & Foreign Key Map

### 2.1 `xai_employees`
Staff directory containing organizational roles and management hierarchy.

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
| `status` | VARCHAR(32) | CHECK IN (`'Active'`, `'On Leave'`, `'Inactive'`) | Employment status |
| `calls_handled` | INT | NOT NULL DEFAULT 0 | Lifetime call counter |
| `last_active` | TIMESTAMPTZ | NULLABLE | Heartbeat / session timestamp |
| `joined_date` | DATE | NOT NULL DEFAULT CURRENT_DATE | Hire date |
| `permissions` | TEXT[] | NOT NULL DEFAULT '{}' | Granular capability flags |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Audit timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

---

### 2.2 `xai_suppression_list`
National DNC, regulatory opt-outs, and customer-requested telephony blacklists.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Unique suppression record ID |
| `phone_e164` | VARCHAR(32) | UNIQUE NOT NULL | Normalized phone number (+91...) |
| `reason` | TEXT | NOT NULL | Suppression rationale |
| `source` | VARCHAR(64) | CHECK IN (`'National DNC'`, `'Customer Opt-Out'`, `'Staff Manual'`, `'Regulatory Block'`, `'Auto Suppression'`) | Origin of suppression |
| `added_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Employee logging suppression |
| `added_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Timestamp added |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiry timestamp (NULL = permanent) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Creation audit |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

---

### 2.3 `xai_contact_consents`
Audit trail of purpose-specific, verifiable consent for outbound communications.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Consent log ID |
| `contact_id` | VARCHAR(32) | NOT NULL | Driver ID or Passenger ID |
| `contact_type` | VARCHAR(16) | CHECK IN (`'Driver'`, `'Passenger'`) | Entity classification |
| `contact_phone` | VARCHAR(32) | NOT NULL | Contact phone number |
| `purpose` | VARCHAR(64) | CHECK IN (`'onboarding'`, `'engagement'`, `'service_updates'`, `'transactional'`, `'feedback'`) | Explicit legal purpose |
| `consent_status` | VARCHAR(32) | CHECK IN (`'Granted'`, `'Unknown'`, `'Revoked'`) | Consent state |
| `consent_source` | VARCHAR(64) | CHECK IN (`'Web Form'`, `'App Registration'`, `'Inbound Call'`, `'Written Agreement'`, `'Excel Import'`, `'IVR Consent Capture'`) | Origin channel |
| `evidence_reference` | TEXT | NOT NULL | Verification proof, form ID or IP |
| `captured_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Timestamp granted |
| `revoked_at` | TIMESTAMPTZ | NULLABLE | Timestamp revoked (if applicable) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Audit timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

---

### 2.4 `xai_call_jobs`
Strict dispatch authorization queue. Outbound calls cannot be initiated without an Authorized job.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Call job identifier |
| `idempotency_key` | VARCHAR(128) | UNIQUE NOT NULL | Prevents duplicate dispatches |
| `contact_id` | VARCHAR(32) | NOT NULL | Target contact ID |
| `contact_type` | VARCHAR(16) | CHECK IN (`'Driver'`, `'Passenger'`) | Contact type |
| `contact_phone` | VARCHAR(32) | NOT NULL | Target phone number |
| `initiated_by_employee_id` | VARCHAR(32) | NOT NULL, FK → `xai_employees(id)` | Employee who clicked call |
| `approved_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Approving supervisor |
| `agent_id` | VARCHAR(32) | FK → `xai_ai_agents(id)` ON DELETE SET NULL | AI Persona ID |
| `agent_type` | VARCHAR(64) | NOT NULL | AI Persona label |
| `language` | VARCHAR(32) | CHECK IN (`'Tamil'`, `'Telugu'`, `'English'`) | Modular regional language |
| `call_purpose` | VARCHAR(64) | CHECK IN (`'onboarding'`, `'engagement'`, `'service_updates'`, `'transactional'`, `'feedback'`) | Purpose matching consent |
| `authorization_status` | VARCHAR(32) | CHECK IN (`'Pending Check'`, `'Authorized'`, `'Rejected Consent Missing'`, `'Rejected DNC'`, `'Rejected Rate Limited'`, `'Revoked'`) | Automated check outcome |
| `call_status` | VARCHAR(32) | NOT NULL DEFAULT `'created'` CHECK IN (`'created'`, `'queued'`, `'initiating'`, `'in_progress'`, `'completed'`, `'failed'`, `'cancelled'`) | Telephony state |
| `provider_call_sid` | VARCHAR(128) | UNIQUE NULLABLE | Exotel Call SID |
| `provider_status` | VARCHAR(64) | NULLABLE | Exotel provider status |
| `provider_response` | JSONB | NOT NULL DEFAULT `'{}'` | Raw provider response payload |
| `rejection_reason` | TEXT | NULLABLE | Compliance check failure reason |
| `approved_at` | TIMESTAMPTZ | NULLABLE | Timestamp authorization passed |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Job creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

---

### 2.5 `xai_call_records`
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
| `end_time` | TIMESTAMPTZ | NULLABLE | Session termination timestamp |
| `duration_seconds` | INT | NOT NULL DEFAULT 0 | Duration in seconds |
| `audio_duration` | VARCHAR(16) | NULLABLE | Duration string |
| `outcome` | VARCHAR(64) | NULLABLE CHECK IN (`'Interested'`, `'Callback Requested'`, `'Language Barrier'`, `'Docs Submitted'`, `'Not Reachable'`, `'Escalated to Human'`, `'Completed'`, `'Call Dropped'`, `'Pending Outcome'`, `'Refused Consent'`) | Genuine call outcome |
| `sentiment` | VARCHAR(32) | NULLABLE CHECK IN (`'Positive'`, `'Neutral'`, `'Negative'`, `'Unanalyzed'`) | Sentiment classification |
| `transcript` | JSONB | NOT NULL DEFAULT `'[]'` | Structured dialogue entries |
| `key_notes` | TEXT | NULLABLE | Call summary notes |
| `action_item` | TEXT | NULLABLE | Immediate next action |
| `escalated_to_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Human agent assignee |
| `provider_call_sid` | VARCHAR(128) | NULLABLE | Exotel Call SID |
| `provider_status` | VARCHAR(64) | NULLABLE | Exotel status |
| `provider_recording_path` | TEXT | NULLABLE | Private storage audio path |
| `provider_cost` | NUMERIC(8, 4) | DEFAULT 0.0000 | Telephony fee in INR |
| `provider_metadata` | JSONB | NOT NULL DEFAULT `'{}'` | Raw Exotel webhook payload |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Audit log timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

---

### 2.6 `xai_kyc_documents`
Driver partner KYC verification with private storage paths and masked document numbers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY DEFAULT `gen_random_uuid()` | Document record ID |
| `driver_id` | VARCHAR(32) | NOT NULL, FK → `xai_drivers(id)` ON DELETE CASCADE | Target driver |
| `document_type` | VARCHAR(64) | CHECK IN (`'Aadhaar'`, `'Driving License'`, `'RC Book'`, `'Vehicle Insurance'`, `'Police Verification'`) | Document category |
| `document_number_masked` | VARCHAR(64) | NOT NULL | Masked display (e.g. `XXXX-XXXX-1234`) |
| `document_number_encrypted` | TEXT | RESTRICTED | Encrypted raw cipher |
| `storage_bucket` | VARCHAR(64) | NOT NULL DEFAULT `'xai-kyc-private'` | Private Supabase bucket |
| `storage_path` | TEXT | NOT NULL | Path within private bucket |
| `status` | VARCHAR(32) | DEFAULT `'Pending Review'` CHECK IN (`'Verified'`, `'Pending Review'`, `'Missing'`, `'Rejected'`) | Verification status |
| `verified_by_employee_id` | VARCHAR(32) | FK → `xai_employees(id)` ON DELETE SET NULL | Reviewing staff member |
| `verified_at` | TIMESTAMPTZ | NULLABLE | Verification timestamp |
| `rejection_reason` | TEXT | NULLABLE | Rejection explanation |
| `notes` | TEXT | NULLABLE | Internal staff notes |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Ingestion timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

---

## 3. Team Ownership & Assignment Flow

1. **Manager to Team Leader to Executive Hierarchy**:
   - Every `xai_employees` record can specify a `team_leader_id` pointing to another employee.
   - The helper function `xai_is_team_lead_of(subordinate_id)` determines supervisor authority dynamically without hardcoding.
2. **Contact Allocation**:
   - `xai_drivers` has `assigned_employee_id` (Customer Care Executive) and `assigned_team_leader_id` (Team Leader).
   - `xai_passengers` has matching assignment columns.
3. **Task & Escalation Routing**:
   - `xai_follow_up_tasks` assigns tickets to specific employees (`assigned_to_id`) while linking to the team leader (`team_leader_id`).
   - If an AI call results in `outcome = 'Escalated to Human'`, a corresponding follow-up task is generated and assigned.

---

## 4. Telephony Integration Flow (Exotel Ready)

```
[Employee clicks "Call"]
           |
           v
[INSERT INTO xai_call_jobs (with unique idempotency_key)]
           |
           v
[BEFORE INSERT Trigger: xai_validate_call_job_eligibility()]
   |-- 1. Check xai_suppression_list (DNC) ---------> IF MATCH: Reject ('Rejected DNC')
   |-- 2. Check xai_contact_consents (Purpose) ------> IF MISSING/REVOKED: Reject ('Rejected Consent Missing')
   |-- 3. Check next_eligible_contact_date ----------> IF NOT ELIGIBLE: Reject ('Rejected Rate Limited')
   +-- 4. ALL CHECKS PASS ---------------------------> Authorize ('Authorized', approved_at = now())
           |
           v
[Backend Dispatcher (Exotel REST API Call)]
   |-- Receives provider_call_sid
   +-- Updates xai_call_jobs (call_status = 'initiating', provider_call_sid = '...')
           |
           v
[Exotel Webhook Callback]
   |-- Updates provider_status ('completed', 'busy', 'no-answer')
   +-- Records audio in private storage (provider_recording_path)
   +-- Inserts finalized session into xai_call_records
```
