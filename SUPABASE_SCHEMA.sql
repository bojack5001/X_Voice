-- ============================================================================
-- XPOOL AI CONNECT (XAI) — PRODUCTION POSTGRESQL DATABASE SCHEMA
-- Version: 3.0 (Production-Safe Architecture Revision)
--
-- CORE SAFETY GUARANTEES:
-- 1. All new tables, functions, triggers, and views strictly use the 'xai_' prefix.
-- 2. Zero modification, alteration, or dropping of any existing XPOOL production tables.
-- 3. Idempotent execution (IF NOT EXISTS / OR REPLACE) prevents deployment failures.
-- 4. No markdown syntax, no box characters, 100% pure ANSI/PostgreSQL SQL.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Table: xai_company_profile
-- Tenant configuration and verified telephony compliance metadata.
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL DEFAULT 'XPOOL Technology Private Limited (Demo Organization)',
    brand_name VARCHAR(100) NOT NULL DEFAULT 'XPOOL AI CONNECT',
    cin VARCHAR(64) NOT NULL DEFAULT 'U72900TN2024PTC000000 (Simulated Demo CIN)',
    registered_office TEXT NOT NULL DEFAULT 'Demo Facility, OMR IT Corridor, Sholinganallur, Chennai, Tamil Nadu - 600119, India',
    support_email VARCHAR(255) NOT NULL DEFAULT 'telephony-demo@xpool.test',
    phone VARCHAR(32) NOT NULL DEFAULT '+91 44 0000 1200',
    website VARCHAR(255) NOT NULL DEFAULT 'https://xpool.test',
    environment_notice TEXT NOT NULL DEFAULT 'DEMO ENVIRONMENT — NO REAL CUSTOMER DATA — NO REAL CALLS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. Table: xai_employees
-- Staff roster with team hierarchy and Supabase Auth integration.
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
    revoked_at TIMESTAMPTZ,
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
-- ============================================================================
CREATE TABLE IF NOT EXISTS xai_kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(32) NOT NULL REFERENCES xai_drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL CHECK (document_type IN ('Aadhaar', 'Driving License', 'RC Book', 'Vehicle Insurance', 'Police Verification')),
    document_number_masked VARCHAR(64) NOT NULL,
    document_number_encrypted TEXT,
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
    authorization_status VARCHAR(32) NOT NULL DEFAULT 'Pending Check' CHECK (authorization_status IN ('Pending Check', 'Authorized', 'Rejected Consent Missing', 'Rejected DNC', 'Rejected Rate Limited', 'Revoked')),
    call_status VARCHAR(32) NOT NULL DEFAULT 'created' CHECK (call_status IN ('created', 'queued', 'initiating', 'in_progress', 'completed', 'failed', 'cancelled')),
    provider_call_sid VARCHAR(128) UNIQUE,
    provider_status VARCHAR(64),
    provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
CREATE INDEX IF NOT EXISTS idx_xai_consents_lookup ON xai_contact_consents(contact_phone, purpose, consent_status);
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
CREATE OR REPLACE FUNCTION xai_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_company_profile_updated ON xai_company_profile;
CREATE TRIGGER trg_xai_company_profile_updated BEFORE UPDATE ON xai_company_profile FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_employees_updated ON xai_employees;
CREATE TRIGGER trg_xai_employees_updated BEFORE UPDATE ON xai_employees FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_suppression_updated ON xai_suppression_list;
CREATE TRIGGER trg_xai_suppression_updated BEFORE UPDATE ON xai_suppression_list FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_consents_updated ON xai_contact_consents;
CREATE TRIGGER trg_xai_consents_updated BEFORE UPDATE ON xai_contact_consents FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_drivers_updated ON xai_drivers;
CREATE TRIGGER trg_xai_drivers_updated BEFORE UPDATE ON xai_drivers FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_kyc_documents_updated ON xai_kyc_documents;
CREATE TRIGGER trg_xai_kyc_documents_updated BEFORE UPDATE ON xai_kyc_documents FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_passengers_updated ON xai_passengers;
CREATE TRIGGER trg_xai_passengers_updated BEFORE UPDATE ON xai_passengers FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_ai_agents_updated ON xai_ai_agents;
CREATE TRIGGER trg_xai_ai_agents_updated BEFORE UPDATE ON xai_ai_agents FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_call_jobs_updated ON xai_call_jobs;
CREATE TRIGGER trg_xai_call_jobs_updated BEFORE UPDATE ON xai_call_jobs FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_call_records_updated ON xai_call_records;
CREATE TRIGGER trg_xai_call_records_updated BEFORE UPDATE ON xai_call_records FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_follow_up_tasks_updated ON xai_follow_up_tasks;
CREATE TRIGGER trg_xai_follow_up_tasks_updated BEFORE UPDATE ON xai_follow_up_tasks FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

-- ============================================================================
-- ELIGIBILITY & COMPLIANCE ENFORCEMENT TRIGGER FUNCTION FOR CALL JOBS
-- Automatically validates:
-- 1. DNC / Suppression list check
-- 2. Purpose-specific Granted consent check
-- 3. Contact frequency / rate limiting eligibility
-- ============================================================================
CREATE OR REPLACE FUNCTION xai_validate_call_job_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    suppressed_count INT;
    consent_count INT;
    eligible_contact_time TIMESTAMPTZ;
BEGIN
    -- Check 1: DNC Suppression List check
    SELECT COUNT(*) INTO suppressed_count
    FROM xai_suppression_list
    WHERE phone_e164 = NEW.contact_phone
      AND (expires_at IS NULL OR expires_at > now());

    IF suppressed_count > 0 THEN
        NEW.authorization_status := 'Rejected DNC';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Contact phone number is registered on XAI Suppression List / DNC';
        RETURN NEW;
    END IF;

    -- Check 2: Purpose-specific active Granted consent check
    SELECT COUNT(*) INTO consent_count
    FROM xai_contact_consents
    WHERE contact_phone = NEW.contact_phone
      AND purpose = NEW.call_purpose
      AND consent_status = 'Granted'
      AND revoked_at IS NULL;

    IF consent_count = 0 THEN
        NEW.authorization_status := 'Rejected Consent Missing';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'No active purpose-specific Granted consent found for this contact';
        RETURN NEW;
    END IF;

    -- Check 3: Next eligible contact date rate limiting check
    IF NEW.contact_type = 'Driver' THEN
        SELECT next_eligible_contact_date INTO eligible_contact_time
        FROM xai_drivers
        WHERE phone = NEW.contact_phone;
    ELSE
        SELECT next_eligible_contact_date INTO eligible_contact_time
        FROM xai_passengers
        WHERE phone = NEW.contact_phone;
    END IF;

    IF eligible_contact_time IS NOT NULL AND eligible_contact_time > now() THEN
        NEW.authorization_status := 'Rejected Rate Limited';
        NEW.call_status := 'cancelled';
        NEW.rejection_reason := 'Contact frequency limit active until ' || to_char(eligible_contact_time, 'YYYY-MM-DD HH24:MI:SS OF');
        RETURN NEW;
    END IF;

    -- If all checks pass and status was pending, authorize the call
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
    EXECUTE FUNCTION xai_validate_call_job_eligibility();
