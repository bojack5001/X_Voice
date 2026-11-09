-- ============================================================================
-- XPOOL AI CONNECT (XAI) — PRODUCTION POSTGRESQL DATABASE SCHEMA
-- Version: 3.6 (Security Remediation Architecture)
--
-- CORE SAFETY & COMPLIANCE GUARANTEES:
-- 1. All objects strictly use the 'xai_' namespace prefix.
-- 2. Zero modification, renaming, or dropping of existing XPOOL production tables.
-- 3. Idempotent DDL (IF NOT EXISTS / OR REPLACE) prevents deployment collisions.
-- 4. Pure ANSI/PostgreSQL SQL (0 Markdown fences, 0 Unicode box characters).
-- 5. No fictitious company records or demo identity data inserted as real info.
-- 6. Trigger guards prevent HR self-promotion to CEO and enforce consent immutability.
-- 7. Controlled dispatch function returns JSONB without rolled-back updates.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Table: xai_company_profile
-- Tenant configuration and legal compliance declarations.
-- Starts in an explicit unconfigured state until verified production info is added.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL DEFAULT 'Unconfigured Organization',
    brand_name VARCHAR(100) NOT NULL DEFAULT 'XPOOL AI CONNECT',
    cin VARCHAR(64) DEFAULT NULL,
    registered_office TEXT DEFAULT NULL,
    support_email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(32) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    is_configured BOOLEAN NOT NULL DEFAULT false,
    environment_notice TEXT NOT NULL DEFAULT 'Awaiting verified corporate profile configuration',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. Table: xai_employees
-- Staff roster with team hierarchy, active status check, and Supabase Auth link.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_employees (
    id VARCHAR(32) PRIMARY KEY,
    auth_user_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive')),
    department VARCHAR(100) NOT NULL,
    team_name VARCHAR(100),
    team_leader_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
    avatar_url TEXT,
    calls_handled INT NOT NULL DEFAULT 0,
    last_active TIMESTAMPTZ,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_xai_employees_auth FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 3. Table: xai_suppression_list
-- Mandatory Do Not Call (DNC), opt-out, and regulatory suppression registry.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 VARCHAR(32) NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    source VARCHAR(64) NOT NULL CHECK (source IN ('National DNC', 'Customer Opt-Out', 'Staff Manual', 'Regulatory Block', 'Auto Suppression')),
    added_by_employee_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. Table: xai_contact_consents
-- Immutable consent tracking audit log per contact and specific purpose.
-- Historical records cannot be rewritten. Revocations are append-only transitions.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_contact_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id VARCHAR(32) NOT NULL,
    contact_type VARCHAR(16) NOT NULL CHECK (contact_type IN ('Driver', 'Passenger')),
    contact_phone VARCHAR(32) NOT NULL,
    purpose VARCHAR(64) NOT NULL CHECK (purpose IN ('onboarding', 'engagement', 'service_updates', 'transactional', 'feedback')),
    consent_status VARCHAR(32) NOT NULL CHECK (consent_status IN ('Granted', 'Unknown', 'Revoked')),
    consent_source VARCHAR(64) NOT NULL CHECK (consent_source IN ('Web Form', 'App Registration', 'Inbound Call', 'Written Agreement', 'Excel Import', 'IVR Consent Capture')),
    evidence_reference TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    revoked_by_employee_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    revocation_reason TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. Table: xai_drivers
-- Driver onboarding pipeline with assigned staff and team ownership.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_drivers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(32) NOT NULL CHECK (vehicle_type IN ('Auto', 'Bike', 'Hatchback', 'Sedan', 'SUV', 'EV Auto')),
    vehicle_number VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'contacted', 'docs_pending', 'verification', 'training', 'onboarded', 'rejected')),
    preferred_language VARCHAR(32) NOT NULL DEFAULT 'Tamil' CHECK (preferred_language IN ('Tamil', 'Telugu', 'English')),
    assigned_employee_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    assigned_team_leader_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    next_eligible_contact_date TIMESTAMPTZ DEFAULT NULL,
    ai_call_attempts INT NOT NULL DEFAULT 0,
    last_call_outcome VARCHAR(64),
    last_contacted_at TIMESTAMPTZ,
    compliance_score INT NOT NULL DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    notes TEXT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. Table: xai_kyc_documents
-- Driver verification documents using private storage and masked identifiers.
-- Raw document numbers are sequestered in document_number_secure.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(32) NOT NULL REFERENCES xai_drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL CHECK (document_type IN ('Aadhaar', 'Driving License', 'RC Book', 'Vehicle Insurance', 'Police Verification')),
    document_number_masked VARCHAR(64) NOT NULL,
    document_number_secure VARCHAR(128) DEFAULT NULL,
    storage_bucket VARCHAR(64) NOT NULL DEFAULT 'xai-kyc-private',
    storage_path TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Verified', 'Pending Review', 'Missing', 'Rejected')),
    verified_by_employee_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. Table: xai_passengers
-- Commuter engagement profiles with team assignments and contact schedules.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_passengers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255),
    preferred_language VARCHAR(32) NOT NULL DEFAULT 'Tamil' CHECK (preferred_language IN ('Tamil', 'Telugu', 'English')),
    registration_status VARCHAR(32) NOT NULL DEFAULT 'Registered' CHECK (registration_status IN ('Registered', 'Pending Verification', 'VIP', 'Blocked')),
    engagement_status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (engagement_status IN ('Active', 'Dormant', 'Churn Risk', 'High Value')),
    assigned_employee_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    assigned_team_leader_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    next_eligible_contact_date TIMESTAMPTZ DEFAULT NULL,
    total_rides INT NOT NULL DEFAULT 0,
    completed_rides INT NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    last_ride_date TIMESTAMPTZ,
    call_attempts INT NOT NULL DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    preferred_pickup_zone VARCHAR(255),
    notes TEXT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. Table: xai_ai_agents
-- Configurable AI voice agent personas and regional language configurations.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_ai_agents (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    target_audience VARCHAR(32) NOT NULL CHECK (target_audience IN ('Driver', 'Passenger', 'Both')),
    supported_languages TEXT[] NOT NULL DEFAULT '{"Tamil", "Telugu", "English"}',
    voice_gender VARCHAR(16) NOT NULL CHECK (voice_gender IN ('Female', 'Male')),
    voice_style VARCHAR(100) NOT NULL,
    speaking_rate NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (speaking_rate BETWEEN 0.50 AND 2.00),
    fallback_sensitivity INT NOT NULL DEFAULT 3 CHECK (fallback_sensitivity BETWEEN 1 AND 5),
    status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Training')),
    transfer_threshold_silence_seconds INT NOT NULL DEFAULT 8,
    greeting_prompts JSONB NOT NULL DEFAULT '{}'::jsonb,
    system_instructions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. Table: xai_call_jobs
-- Mandatory dispatch authorization queue with idempotency and compliance checks.
-- Concurrency protected by partial unique index on active calls.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_call_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    contact_id VARCHAR(32) NOT NULL,
    contact_type VARCHAR(16) NOT NULL CHECK (contact_type IN ('Driver', 'Passenger')),
    contact_phone VARCHAR(32) NOT NULL,
    initiated_by_employee_id VARCHAR(32) NOT NULL REFERENCES xai_employees(id),
    approved_by_employee_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    agent_id VARCHAR(32) REFERENCES xai_ai_agents(id) ON DELETE SET NULL,
    agent_type VARCHAR(64) NOT NULL,
    language VARCHAR(32) NOT NULL CHECK (language IN ('Tamil', 'Telugu', 'English')),
    call_purpose VARCHAR(64) NOT NULL CHECK (call_purpose IN ('onboarding', 'engagement', 'service_updates', 'transactional', 'feedback')),
    authorization_status VARCHAR(32) NOT NULL DEFAULT 'Pending Check' CHECK (authorization_status IN ('Pending Check', 'Authorized', 'Rejected Contact Mismatch', 'Rejected Unassigned Contact', 'Rejected Inactive Staff', 'Rejected Consent Missing', 'Rejected DNC', 'Rejected Rate Limited', 'Rejected Unconfigured Company', 'Revoked')),
    call_status VARCHAR(32) NOT NULL DEFAULT 'created' CHECK (call_status IN ('created', 'queued', 'initiating', 'in_progress', 'completed', 'failed', 'cancelled')),
    provider_call_sid VARCHAR(128) UNIQUE,
    provider_status VARCHAR(64),
    provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Concurrency protection: At most ONE active call job per phone number at any given moment
CREATE UNIQUE INDEX IF NOT EXISTS uq_xai_call_jobs_active_phone
    ON xai_call_jobs(contact_phone)
    WHERE call_status IN ('queued', 'initiating', 'in_progress');

-- ============================================================================
-- 10. Table: xai_call_records
-- Audit log of completed telephonic sessions, Exotel metadata, and transcripts.
-- Notice: NO misleading default outcomes or assumed 'completed' statuses.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_call_records (
    id VARCHAR(32) PRIMARY KEY,
    call_job_id UUID REFERENCES xai_call_jobs(id) ON DELETE SET NULL,
    contact_id VARCHAR(32) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    contact_type VARCHAR(16) NOT NULL CHECK (contact_type IN ('Driver', 'Passenger')),
    agent_id VARCHAR(32) REFERENCES xai_ai_agents(id) ON DELETE SET NULL,
    agent_name VARCHAR(100) NOT NULL,
    language VARCHAR(32) NOT NULL CHECK (language IN ('Tamil', 'Telugu', 'English')),
    status VARCHAR(32) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'ringing', 'in_progress', 'completed', 'failed', 'cancelled', 'transferred')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    audio_duration VARCHAR(16),
    outcome VARCHAR(64) CHECK (outcome IN ('Interested', 'Callback Requested', 'Language Barrier', 'Docs Submitted', 'Not Reachable', 'Escalated to Human', 'Completed', 'Call Dropped', 'Pending Outcome', 'Refused Consent')),
    sentiment VARCHAR(32) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative', 'Unanalyzed')),
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_notes TEXT,
    action_item TEXT,
    escalated_to_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    provider_call_sid VARCHAR(128),
    provider_status VARCHAR(64),
    provider_recording_path TEXT,
    provider_cost NUMERIC(8, 4) DEFAULT 0.0000,
    provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. Table: xai_follow_up_tasks
-- SLA tracking for manual callbacks, document reviews, and human escalations.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_follow_up_tasks (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Callback', 'Doc Review', 'Human Escalation', 'VIP Support', 'Compliance Check')),
    priority VARCHAR(16) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
    status VARCHAR(32) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    assigned_to_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    assigned_role VARCHAR(32) NOT NULL CHECK (assigned_role IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive')),
    team_leader_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    target_contact_name VARCHAR(255) NOT NULL,
    target_phone VARCHAR(32) NOT NULL,
    target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('Driver', 'Passenger')),
    call_job_id UUID REFERENCES xai_call_jobs(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 12. Table: xai_lead_imports
-- Audit batches of XLSX lead ingestion runs with duplicate and rejection logs.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_lead_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INT NOT NULL DEFAULT 0,
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    duplicate_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    imported_by_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    rejection_report JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PERFORMANCE & COMPLIANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_xai_suppression_phone ON xai_suppression_list(phone_e164);
CREATE INDEX IF NOT EXISTS idx_xai_consents_lookup ON xai_contact_consents(contact_id, contact_type, contact_phone, purpose, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_xai_call_jobs_contact ON xai_call_jobs(contact_phone, authorization_status);
CREATE INDEX IF NOT EXISTS idx_xai_call_jobs_idempotency ON xai_call_jobs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_xai_call_jobs_status ON xai_call_jobs(call_status);
CREATE INDEX IF NOT EXISTS idx_xai_call_jobs_provider ON xai_call_jobs(provider_call_sid);
CREATE INDEX IF NOT EXISTS idx_xai_drivers_phone ON xai_drivers(phone);
CREATE INDEX IF NOT EXISTS idx_xai_drivers_status ON xai_drivers(status);
CREATE INDEX IF NOT EXISTS idx_xai_drivers_assigned ON xai_drivers(assigned_employee_id, assigned_team_leader_id);
CREATE INDEX IF NOT EXISTS idx_xai_passengers_phone ON xai_passengers(phone);
CREATE INDEX IF NOT EXISTS idx_xai_passengers_assigned ON xai_passengers(assigned_employee_id, assigned_team_leader_id);
CREATE INDEX IF NOT EXISTS idx_xai_call_records_time ON xai_call_records(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_xai_call_records_contact ON xai_call_records(contact_phone);
CREATE INDEX IF NOT EXISTS idx_xai_call_records_provider ON xai_call_records(provider_call_sid);
CREATE INDEX IF NOT EXISTS idx_xai_kyc_docs_driver ON xai_kyc_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_xai_tasks_assigned ON xai_follow_up_tasks(assigned_to_id, status);
CREATE INDEX IF NOT EXISTS idx_xai_tasks_team ON xai_follow_up_tasks(team_leader_id, status);
CREATE INDEX IF NOT EXISTS idx_xai_employees_role ON xai_employees(role);
CREATE INDEX IF NOT EXISTS idx_xai_employees_team ON xai_employees(team_leader_id);

-- ============================================================================
-- AUTOMATIC TIMESTAMPTZ TRIGGER FOR updated_at COLUMNS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_company_profile_updated ON xai_company_profile;
CREATE TRIGGER trg_xai_company_profile_updated BEFORE UPDATE ON xai_company_profile FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_employees_updated ON xai_employees;
CREATE TRIGGER trg_xai_employees_updated BEFORE UPDATE ON xai_employees FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_suppression_updated ON xai_suppression_list;
CREATE TRIGGER trg_xai_suppression_updated BEFORE UPDATE ON xai_suppression_list FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_consents_updated ON xai_contact_consents;
CREATE TRIGGER trg_xai_consents_updated BEFORE UPDATE ON xai_contact_consents FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_drivers_updated ON xai_drivers;
CREATE TRIGGER trg_xai_drivers_updated BEFORE UPDATE ON xai_drivers FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_kyc_documents_updated ON xai_kyc_documents;
CREATE TRIGGER trg_xai_kyc_documents_updated BEFORE UPDATE ON xai_kyc_documents FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_passengers_updated ON xai_passengers;
CREATE TRIGGER trg_xai_passengers_updated BEFORE UPDATE ON xai_passengers FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_ai_agents_updated ON xai_ai_agents;
CREATE TRIGGER trg_xai_ai_agents_updated BEFORE UPDATE ON xai_ai_agents FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_call_jobs_updated ON xai_call_jobs;
CREATE TRIGGER trg_xai_call_jobs_updated BEFORE UPDATE ON xai_call_jobs FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_call_records_updated ON xai_call_records;
CREATE TRIGGER trg_xai_call_records_updated BEFORE UPDATE ON xai_call_records FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_follow_up_tasks_updated ON xai_follow_up_tasks;
CREATE TRIGGER trg_xai_follow_up_tasks_updated BEFORE UPDATE ON xai_follow_up_tasks FOR EACH ROW EXECUTE FUNCTION public.xai_set_updated_at();

-- ============================================================================
-- SECURITY TRIGGER: STRICT HR & EMPLOYEE PRIVILEGE ESCALATION GUARD
-- Enforces:
-- 1. HR must NEVER promote themselves or anyone else to CEO.
-- 2. Only existing active CEO accounts can assign the CEO role or modify CEO profiles.
-- 3. HR can manage ordinary staff, but CANNOT modify their own role, status, permissions,
--    department, team_leader_id, or auth_user_id.
-- 4. Ordinary staff cannot alter any administrative fields on their profile.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_prevent_employee_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_caller_role VARCHAR(32);
    current_caller_emp_id VARCHAR(32);
BEGIN
    -- Resolve active caller role and employee id
    SELECT role, id INTO current_caller_role, current_caller_emp_id
    FROM public.xai_employees
    WHERE auth_user_id = auth.uid() AND status = 'Active'
    LIMIT 1;

    -- Security Rule 1: Only an existing active CEO can create or assign a CEO role
    IF NEW.role = 'CEO' AND OLD.role != 'CEO' THEN
        IF COALESCE(current_caller_role, '') != 'CEO' THEN
            RAISE EXCEPTION 'Access Denied: Only existing CEO accounts can assign the CEO role';
        END IF;
    END IF;

    -- Security Rule 2: Non-CEO users cannot modify a CEO profile
    IF OLD.role = 'CEO' AND COALESCE(current_caller_role, '') != 'CEO' THEN
        RAISE EXCEPTION 'Access Denied: Only CEO accounts can modify CEO profiles';
    END IF;

    -- Security Rule 3: HR cannot alter their own role, status, permissions, or reporting hierarchy
    IF OLD.id = current_caller_emp_id AND current_caller_role != 'CEO' THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Access Denied: Staff (including HR) cannot alter their own organizational role';
        END IF;
        IF NEW.permissions IS DISTINCT FROM OLD.permissions THEN
            RAISE EXCEPTION 'Access Denied: Staff (including HR) cannot alter their own granted permissions';
        END IF;
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'Access Denied: Staff (including HR) cannot alter their own employment status';
        END IF;
        IF NEW.team_leader_id IS DISTINCT FROM OLD.team_leader_id THEN
            RAISE EXCEPTION 'Access Denied: Staff (including HR) cannot alter their own reporting hierarchy';
        END IF;
        IF NEW.department IS DISTINCT FROM OLD.department THEN
            RAISE EXCEPTION 'Access Denied: Staff (including HR) cannot reassign their own department';
        END IF;
        IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
            RAISE EXCEPTION 'Access Denied: Staff (including HR) cannot reassign auth_user_id links';
        END IF;
    END IF;

    -- Security Rule 4: Non-admin staff (Team Leader, CCE) cannot alter ANY administrative fields
    IF COALESCE(current_caller_role, '') NOT IN ('CEO', 'HR') THEN
        IF NEW.role IS DISTINCT FROM OLD.role
           OR NEW.permissions IS DISTINCT FROM OLD.permissions
           OR NEW.status IS DISTINCT FROM OLD.status
           OR NEW.team_leader_id IS DISTINCT FROM OLD.team_leader_id
           OR NEW.department IS DISTINCT FROM OLD.department
           OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
            RAISE EXCEPTION 'Access Denied: Non-administrative staff cannot alter employee governance attributes';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_employees_escalation_guard ON xai_employees;
CREATE TRIGGER trg_xai_employees_escalation_guard
    BEFORE UPDATE ON xai_employees
    FOR EACH ROW
    EXECUTE FUNCTION public.xai_prevent_employee_self_escalation();

-- ============================================================================
-- SECURITY TRIGGER: PREVENT UNAUTHORIZED CONTACT REASSIGNMENT
-- Customer Care Executives cannot reassign drivers or passengers to bypass
-- assignment-based access restrictions. Only CEO and Team Leaders can reassign.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_prevent_unauthorized_reassignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_caller_role VARCHAR(32);
BEGIN
    SELECT role INTO current_caller_role
    FROM public.xai_employees
    WHERE auth_user_id = auth.uid() AND status = 'Active'
    LIMIT 1;

    IF COALESCE(current_caller_role, '') NOT IN ('CEO', 'Team Leader') THEN
        IF NEW.assigned_employee_id IS DISTINCT FROM OLD.assigned_employee_id THEN
            RAISE EXCEPTION 'Access Denied: Ordinary staff cannot alter contact assignment';
        END IF;
        IF NEW.assigned_team_leader_id IS DISTINCT FROM OLD.assigned_team_leader_id THEN
            RAISE EXCEPTION 'Access Denied: Ordinary staff cannot alter team leadership assignment';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_drivers_reassign_guard ON xai_drivers;
CREATE TRIGGER trg_xai_drivers_reassign_guard
    BEFORE UPDATE ON xai_drivers
    FOR EACH ROW
    EXECUTE FUNCTION public.xai_prevent_unauthorized_reassignment();

DROP TRIGGER IF EXISTS trg_xai_passengers_reassign_guard ON xai_passengers;
CREATE TRIGGER trg_xai_passengers_reassign_guard
    BEFORE UPDATE ON xai_passengers
    FOR EACH ROW
    EXECUTE FUNCTION public.xai_prevent_unauthorized_reassignment();

-- ============================================================================
-- SECURITY TRIGGER: STRICT IMMUTABLE CONSENT AUDIT LOG PROTECTION
-- Enforces:
-- 1. Deletion of consent records is FORBIDDEN.
-- 2. Once Revoked, a record can NEVER transition back to Granted.
-- 3. New consent must be captured as a separate, newly inserted record.
-- 4. Evidence reference, phone, purpose, source, and captured_at are immutable.
-- 5. Revocation records who revoked consent and when.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_protect_consent_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_caller_emp_id VARCHAR(32);
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Access Denied: Consent records are immutable legal audit trails and cannot be deleted';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Rule 1: A revoked consent record can NEVER be changed back to Granted
        IF OLD.consent_status = 'Revoked' AND NEW.consent_status = 'Granted' THEN
            RAISE EXCEPTION 'Access Denied: Revoked consent cannot be re-granted on an existing record. A new evidence-backed consent record must be created';
        END IF;

        -- Rule 2: Core historical evidence parameters cannot be rewritten
        IF NEW.evidence_reference IS DISTINCT FROM OLD.evidence_reference THEN
            RAISE EXCEPTION 'Access Denied: Historical consent evidence reference is immutable';
        END IF;
        IF NEW.captured_at IS DISTINCT FROM OLD.captured_at THEN
            RAISE EXCEPTION 'Access Denied: Consent capture timestamp is immutable';
        END IF;
        IF NEW.consent_source IS DISTINCT FROM OLD.consent_source THEN
            RAISE EXCEPTION 'Access Denied: Consent source is immutable';
        END IF;
        IF NEW.contact_phone IS DISTINCT FROM OLD.contact_phone THEN
            RAISE EXCEPTION 'Access Denied: Contact phone number on consent record is immutable';
        END IF;
        IF NEW.purpose IS DISTINCT FROM OLD.purpose THEN
            RAISE EXCEPTION 'Access Denied: Consent purpose is immutable';
        END IF;
        IF NEW.contact_id IS DISTINCT FROM OLD.contact_id THEN
            RAISE EXCEPTION 'Access Denied: Contact ID on consent record is immutable';
        END IF;
        IF NEW.contact_type IS DISTINCT FROM OLD.contact_type THEN
            RAISE EXCEPTION 'Access Denied: Contact type on consent record is immutable';
        END IF;

        -- Rule 3: Record who revoked consent and timestamp when transitioning to Revoked
        IF NEW.consent_status = 'Revoked' AND OLD.consent_status != 'Revoked' THEN
            IF NEW.revoked_at IS NULL THEN
                NEW.revoked_at := now();
            END IF;
            IF NEW.revoked_by_employee_id IS NULL THEN
                SELECT id INTO current_caller_emp_id
                FROM public.xai_employees
                WHERE auth_user_id = auth.uid() AND status = 'Active'
                LIMIT 1;
                NEW.revoked_by_employee_id := current_caller_emp_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_consents_protect ON xai_contact_consents;
CREATE TRIGGER trg_xai_consents_protect
    BEFORE UPDATE OR DELETE ON xai_contact_consents
    FOR EACH ROW
    EXECUTE FUNCTION public.xai_protect_consent_audit_log();

-- ============================================================================
-- SECURITY TRIGGER: CALL JOB ELIGIBILITY & GATING (BEFORE INSERT)
-- Validates:
-- 1. Initiating employee exists, is Active, and has an authorized role.
-- 2. Contact ID, contact type, and phone number match the actual database record.
-- 3. If initiator is Customer Care Executive, contact MUST be assigned to them.
-- 4. DNC / Suppression list check.
-- 5. Latest purpose-specific consent status check.
-- 6. Rate limit cooldown check (next_eligible_contact_date).
-- 7. Company profile configuration check.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_validate_call_job_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    staff_status VARCHAR(32);
    staff_role VARCHAR(32);
    contact_match_count INT;
    assigned_staff VARCHAR(32);
    suppressed_count INT;
    latest_consent_status VARCHAR(32);
    latest_revoked_at TIMESTAMPTZ;
    eligible_contact_time TIMESTAMPTZ;
    company_configured BOOLEAN;
BEGIN
    -- Check 0: Company profile configuration check
    SELECT is_configured INTO company_configured
    FROM public.xai_company_profile
    LIMIT 1;

    IF company_configured IS NOT TRUE THEN
        NEW.authorization_status := 'Rejected Unconfigured Company';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Company profile is unconfigured. Telephony dispatch disabled until verified corporate details are supplied.';
        RETURN NEW;
    END IF;

    -- Check 1: Initiator employee active status and authorized calling role
    SELECT status, role INTO staff_status, staff_role
    FROM public.xai_employees
    WHERE id = NEW.initiated_by_employee_id;

    IF staff_status IS NULL OR staff_status != 'Active' THEN
        NEW.authorization_status := 'Rejected Inactive Staff';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Initiating employee account is inactive, suspended, or does not exist';
        RETURN NEW;
    END IF;

    IF staff_role NOT IN ('CEO', 'Team Leader', 'Customer Care Executive') THEN
        NEW.authorization_status := 'Rejected Inactive Staff';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Role ' || staff_role || ' is not permitted to initiate outbound calls';
        RETURN NEW;
    END IF;

    -- Check 2: Validate contact ID, contact type, and phone against actual table
    IF NEW.contact_type = 'Driver' THEN
        SELECT COUNT(*), MAX(assigned_employee_id), MAX(next_eligible_contact_date)
        INTO contact_match_count, assigned_staff, eligible_contact_time
        FROM public.xai_drivers
        WHERE id = NEW.contact_id AND phone = NEW.contact_phone;
    ELSIF NEW.contact_type = 'Passenger' THEN
        SELECT COUNT(*), MAX(assigned_employee_id), MAX(next_eligible_contact_date)
        INTO contact_match_count, assigned_staff, eligible_contact_time
        FROM public.xai_passengers
        WHERE id = NEW.contact_id AND phone = NEW.contact_phone;
    ELSE
        NEW.authorization_status := 'Rejected Contact Mismatch';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Invalid contact_type specified';
        RETURN NEW;
    END IF;

    IF contact_match_count = 0 THEN
        NEW.authorization_status := 'Rejected Contact Mismatch';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Contact ID, contact type, and phone number do not match verified database records';
        RETURN NEW;
    END IF;

    -- Check 3: If initiator is CCE, enforce assignment boundary
    IF staff_role = 'Customer Care Executive' THEN
        IF assigned_staff IS DISTINCT FROM NEW.initiated_by_employee_id THEN
            NEW.authorization_status := 'Rejected Unassigned Contact';
            NEW.call_status := 'cancelled';
            NEW.rejection_reason := 'Customer Care Executives can only initiate calls to their assigned contacts';
            RETURN NEW;
        END IF;
    END IF;

    -- Check 4: DNC Suppression list check
    SELECT COUNT(*) INTO suppressed_count
    FROM public.xai_suppression_list
    WHERE phone_e164 = NEW.contact_phone
      AND (expires_at IS NULL OR expires_at > now());

    IF suppressed_count > 0 THEN
        NEW.authorization_status := 'Rejected DNC';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Contact phone number is registered on XAI Suppression List / DNC';
        RETURN NEW;
    END IF;

    -- Check 5: Latest purpose-specific consent status check
    -- Queries the most recent consent event for this exact contact and purpose
    SELECT consent_status, revoked_at
    INTO latest_consent_status, latest_revoked_at
    FROM public.xai_contact_consents
    WHERE contact_id = NEW.contact_id
      AND contact_type = NEW.contact_type
      AND contact_phone = NEW.contact_phone
      AND purpose = NEW.call_purpose
    ORDER BY captured_at DESC, created_at DESC
    LIMIT 1;

    IF latest_consent_status IS DISTINCT FROM 'Granted' OR latest_revoked_at IS NOT NULL THEN
        NEW.authorization_status := 'Rejected Consent Missing';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'No active purpose-specific Granted consent found on file for this contact';
        RETURN NEW;
    END IF;

    -- Check 6: Next eligible contact date rate limiting check
    IF eligible_contact_time IS NOT NULL AND eligible_contact_time > now() THEN
        NEW.authorization_status := 'Rejected Rate Limited';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Contact frequency limit active until ' || to_char(eligible_contact_time, 'YYYY-MM-DD HH24:MI:SS OF');
        RETURN NEW;
    END IF;

    -- All checks passed: Authorize the call job
    IF NEW.authorization_status = 'Pending Check' THEN
        NEW.authorization_status := 'Authorized';
        NEW.approved_at := now();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_call_jobs_compliance ON xai_call_jobs;
CREATE TRIGGER trg_xai_call_jobs_compliance
    BEFORE INSERT ON xai_call_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.xai_validate_call_job_eligibility();

-- ============================================================================
-- SECURITY TRIGGER: PROTECT CALL JOB STATUS TRANSITIONS
-- Prevents unauthorized updates from converting a rejected call into an authorized call.
-- Once a call job is completed, failed, or cancelled, its status is terminal.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_protect_call_job_transitions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_caller_role VARCHAR(32);
BEGIN
    SELECT role INTO current_caller_role
    FROM public.xai_employees
    WHERE auth_user_id = auth.uid() AND status = 'Active'
    LIMIT 1;

    -- Prevent reviving terminal call jobs
    IF OLD.call_status IN ('completed', 'failed', 'cancelled') THEN
        IF NEW.call_status NOT IN ('completed', 'failed', 'cancelled') THEN
            RAISE EXCEPTION 'Access Denied: Terminal call jobs cannot be reopened';
        END IF;
    END IF;

    -- Prevent overriding rejected authorization status (only CEO administrative override)
    IF OLD.authorization_status LIKE 'Rejected%' AND NEW.authorization_status = 'Authorized' THEN
        IF COALESCE(current_caller_role, '') != 'CEO' THEN
            RAISE EXCEPTION 'Access Denied: Rejected call jobs cannot be authorized except by CEO override';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_call_jobs_transition_guard ON xai_call_jobs;
CREATE TRIGGER trg_xai_call_jobs_transition_guard
    BEFORE UPDATE ON xai_call_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.xai_protect_call_job_transitions();

-- ============================================================================
-- PRIVILEGED DISPATCH FUNCTION: PRE-DIAL REVALIDATION WITH ROW LOCKING
-- Called exclusively by the trusted backend telephony worker (service_role).
-- Revalidates all authorization criteria immediately before provider dial.
-- Returns structured JSONB. Never raises unhandled exceptions that roll back updates.
-- Execution is explicitly revoked from PUBLIC, anon, and authenticated.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.xai_dispatch_call_job(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job public.xai_call_jobs;
    v_company_configured BOOLEAN;
    v_staff_status VARCHAR(32);
    v_staff_role VARCHAR(32);
    v_contact_count INT;
    v_assigned_staff VARCHAR(32);
    v_eligible_contact_time TIMESTAMPTZ;
    v_suppressed_count INT;
    v_latest_consent_status VARCHAR(32);
    v_latest_revoked_at TIMESTAMPTZ;
BEGIN
    -- Acquire exclusive row lock on the target call job
    SELECT * INTO v_job
    FROM public.xai_call_jobs
    WHERE id = p_job_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'JOB_NOT_FOUND',
            'message', 'Call job does not exist'
        );
    END IF;

    -- Check 1: Is company profile configured?
    SELECT is_configured INTO v_company_configured
    FROM public.xai_company_profile
    LIMIT 1;

    IF v_company_configured IS NOT TRUE THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected Unconfigured Company',
            call_status = 'cancelled',
            rejection_reason = 'Company profile is unconfigured. Telephony dispatch disabled.'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected Unconfigured Company',
            'call_status', 'cancelled',
            'rejection_reason', 'Company profile is unconfigured'
        );
    END IF;

    -- Check 2: Job must be Authorized and in dispatchable state
    IF v_job.authorization_status != 'Authorized' OR v_job.call_status NOT IN ('created', 'queued') THEN
        UPDATE public.xai_call_jobs
        SET call_status = 'cancelled',
            rejection_reason = 'Job is not in dispatchable state (auth: ' || v_job.authorization_status || ', status: ' || v_job.call_status || ')'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', v_job.authorization_status,
            'call_status', 'cancelled',
            'rejection_reason', 'Job not in dispatchable state'
        );
    END IF;

    -- Check 3: Initiating employee active status and role
    SELECT status, role INTO v_staff_status, v_staff_role
    FROM public.xai_employees
    WHERE id = v_job.initiated_by_employee_id;

    IF v_staff_status IS DISTINCT FROM 'Active' OR v_staff_role NOT IN ('CEO', 'Team Leader', 'Customer Care Executive') THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected Inactive Staff',
            call_status = 'cancelled',
            rejection_reason = 'Initiating employee is inactive or not authorized to dispatch calls'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected Inactive Staff',
            'call_status', 'cancelled',
            'rejection_reason', 'Initiator inactive or unauthorized'
        );
    END IF;

    -- Check 4: Contact ID, type, and phone match
    IF v_job.contact_type = 'Driver' THEN
        SELECT COUNT(*), MAX(assigned_employee_id), MAX(next_eligible_contact_date)
        INTO v_contact_count, v_assigned_staff, v_eligible_contact_time
        FROM public.xai_drivers
        WHERE id = v_job.contact_id AND phone = v_job.contact_phone;
    ELSIF v_job.contact_type = 'Passenger' THEN
        SELECT COUNT(*), MAX(assigned_employee_id), MAX(next_eligible_contact_date)
        INTO v_contact_count, v_assigned_staff, v_eligible_contact_time
        FROM public.xai_passengers
        WHERE id = v_job.contact_id AND phone = v_job.contact_phone;
    ELSE
        v_contact_count := 0;
    END IF;

    IF v_contact_count = 0 THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected Contact Mismatch',
            call_status = 'cancelled',
            rejection_reason = 'Contact details do not match active database record at dispatch'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected Contact Mismatch',
            'call_status', 'cancelled',
            'rejection_reason', 'Contact mismatch'
        );
    END IF;

    -- Check 5: CCE assignment boundary check
    IF v_staff_role = 'Customer Care Executive' AND v_assigned_staff IS DISTINCT FROM v_job.initiated_by_employee_id THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected Unassigned Contact',
            call_status = 'cancelled',
            rejection_reason = 'Contact is not assigned to initiating Customer Care Executive'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected Unassigned Contact',
            'call_status', 'cancelled',
            'rejection_reason', 'Contact unassigned to CCE'
        );
    END IF;

    -- Check 6: Frequency cooldown rate limit check
    IF v_eligible_contact_time IS NOT NULL AND v_eligible_contact_time > now() THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected Rate Limited',
            call_status = 'cancelled',
            rejection_reason = 'Contact is in frequency cooldown until ' || to_char(v_eligible_contact_time, 'YYYY-MM-DD HH24:MI:SS OF')
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected Rate Limited',
            'call_status', 'cancelled',
            'rejection_reason', 'Cooldown active'
        );
    END IF;

    -- Check 7: DNC Suppression check
    SELECT COUNT(*) INTO v_suppressed_count
    FROM public.xai_suppression_list
    WHERE phone_e164 = v_job.contact_phone
      AND (expires_at IS NULL OR expires_at > now());

    IF v_suppressed_count > 0 THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected DNC',
            call_status = 'cancelled',
            rejection_reason = 'Phone registered on suppression list prior to dispatch'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected DNC',
            'call_status', 'cancelled',
            'rejection_reason', 'Phone is suppressed'
        );
    END IF;

    -- Check 8: Latest purpose-specific consent check
    SELECT consent_status, revoked_at
    INTO v_latest_consent_status, v_latest_revoked_at
    FROM public.xai_contact_consents
    WHERE contact_id = v_job.contact_id
      AND contact_type = v_job.contact_type
      AND contact_phone = v_job.contact_phone
      AND purpose = v_job.call_purpose
    ORDER BY captured_at DESC, created_at DESC
    LIMIT 1;

    IF v_latest_consent_status IS DISTINCT FROM 'Granted' OR v_latest_revoked_at IS NOT NULL THEN
        UPDATE public.xai_call_jobs
        SET authorization_status = 'Rejected Consent Missing',
            call_status = 'cancelled',
            rejection_reason = 'Consent revoked or expired prior to dispatch'
        WHERE id = p_job_id;

        RETURN jsonb_build_object(
            'success', false,
            'job_id', p_job_id,
            'authorization_status', 'Rejected Consent Missing',
            'call_status', 'cancelled',
            'rejection_reason', 'Consent revoked or missing'
        );
    END IF;

    -- All checks passed: Transition job to initiating
    UPDATE public.xai_call_jobs
    SET call_status = 'initiating',
        dispatched_at = now()
    WHERE id = p_job_id;

    RETURN jsonb_build_object(
        'success', true,
        'job_id', p_job_id,
        'contact_id', v_job.contact_id,
        'contact_type', v_job.contact_type,
        'contact_phone', v_job.contact_phone,
        'agent_id', v_job.agent_id,
        'agent_type', v_job.agent_type,
        'language', v_job.language,
        'call_purpose', v_job.call_purpose,
        'call_status', 'initiating',
        'dispatched_at', now()
    );
END;
$$;

-- ============================================================================
-- EXPLICIT FUNCTION ACCESS REVOCATION & LEAST PRIVILEGE GRANTS
-- Privileged dispatch function is strictly reserved for the trusted backend worker (service_role).
-- General frontend roles (authenticated, anon, PUBLIC) are denied execution access.
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.xai_dispatch_call_job(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xai_dispatch_call_job(UUID) TO service_role;
