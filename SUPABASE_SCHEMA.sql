-- ============================================================================
-- XPOOL AI CONNECT (XAI) — POSTGRESQL DATABASE SCHEMA
-- Version: 2.0 (Phase 2 Supabase Production Migration)
-- Safety Guarantee: All tables use the 'xai_' prefix to guarantee zero
-- collision with any existing core XPOOL production tables.
-- ============================================================================

-- Enable pgcrypto extension for UUID generation if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Table: xai_company_profile
-- Stores tenant and corporate configuration for AI telephony dispatch.
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 2. Table: xai_employees
-- Staff roster supporting CEO, HR, Team Leader, and Customer Care Executive roles.
-- Optional link to auth.users if Supabase Auth is active.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xai_employees (
    id VARCHAR(32) PRIMARY KEY,
    auth_user_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive')),
    department VARCHAR(100) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
    avatar_url TEXT,
    calls_handled INT NOT NULL DEFAULT 0,
    last_active TIMESTAMPTZ,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT fk_xai_employees_auth FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 3. Table: xai_drivers
-- Driver onboarding pipeline with mandatory consent and DNC suppression tracking.
-- ----------------------------------------------------------------------------
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
    consent_status VARCHAR(32) NOT NULL DEFAULT 'Consent Unknown' CHECK (consent_status IN ('Consent Granted', 'Consent Unknown', 'Consent Revoked')),
    dnc_status VARCHAR(32) NOT NULL DEFAULT 'Not Listed' CHECK (dnc_status IN ('Not Listed', 'DNC Active')),
    next_eligible_contact_date VARCHAR(64) NOT NULL DEFAULT 'Blocked — Awaiting Explicit Consent',
    ai_call_attempts INT NOT NULL DEFAULT 0,
    last_call_outcome VARCHAR(64),
    last_contacted_at TIMESTAMPTZ,
    compliance_score INT NOT NULL DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    notes TEXT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 4. Table: xai_kyc_documents
-- Verification documents uploaded by driver partners.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xai_kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(32) NOT NULL REFERENCES xai_drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL CHECK (document_type IN ('Aadhaar', 'Driving License', 'RC Book', 'Vehicle Insurance', 'Police Verification')),
    document_number VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Missing' CHECK (status IN ('Verified', 'Pending Review', 'Missing', 'Rejected')),
    file_url TEXT,
    notes TEXT,
    uploaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 5. Table: xai_passengers
-- Commuter profiles with consent, suppression, and route preferences.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xai_passengers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255),
    preferred_language VARCHAR(32) NOT NULL DEFAULT 'Tamil' CHECK (preferred_language IN ('Tamil', 'Telugu', 'English')),
    registration_status VARCHAR(32) NOT NULL DEFAULT 'Registered' CHECK (registration_status IN ('Registered', 'Pending Verification', 'VIP', 'Blocked')),
    engagement_status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (engagement_status IN ('Active', 'Dormant', 'Churn Risk', 'High Value')),
    consent_status VARCHAR(32) NOT NULL DEFAULT 'Consent Unknown' CHECK (consent_status IN ('Consent Granted', 'Consent Unknown', 'Consent Revoked')),
    dnc_status VARCHAR(32) NOT NULL DEFAULT 'Not Listed' CHECK (dnc_status IN ('Not Listed', 'DNC Active')),
    next_eligible_contact_date VARCHAR(64) NOT NULL DEFAULT 'Eligible Now',
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 6. Table: xai_ai_agents
-- Configurable AI voice agent personas with modular language prompt hooks.
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 7. Table: xai_call_records
-- Audit log of simulated and manual telephonic interactions with transcripts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xai_call_records (
    id VARCHAR(32) PRIMARY KEY,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    contact_type VARCHAR(16) NOT NULL CHECK (contact_type IN ('Driver', 'Passenger')),
    agent_id VARCHAR(32) REFERENCES xai_ai_agents(id) ON DELETE SET NULL,
    agent_name VARCHAR(100) NOT NULL,
    language VARCHAR(32) NOT NULL CHECK (language IN ('Tamil', 'Telugu', 'English')),
    status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'ringing', 'in-progress', 'completed', 'failed', 'transferred')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    duration_seconds INT NOT NULL DEFAULT 0,
    audio_duration VARCHAR(16) NOT NULL DEFAULT '00:00',
    outcome VARCHAR(64) NOT NULL DEFAULT 'Interested' CHECK (outcome IN ('Interested', 'Callback Requested', 'Language Barrier', 'Docs Submitted', 'Not Reachable', 'Escalated to Human', 'Completed', 'Call Dropped')),
    sentiment VARCHAR(32) NOT NULL DEFAULT 'Neutral' CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_notes TEXT,
    action_item TEXT,
    escalated_to_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 8. Table: xai_follow_up_tasks
-- SLA tracking for manual callbacks, document reviews, and human escalations.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xai_follow_up_tasks (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Callback', 'Doc Review', 'Human Escalation', 'VIP Support', 'Compliance Check')),
    priority VARCHAR(16) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
    status VARCHAR(32) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    assigned_to_id VARCHAR(32) REFERENCES xai_employees(id) ON DELETE SET NULL,
    assigned_role VARCHAR(32) NOT NULL CHECK (assigned_role IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive')),
    target_contact_name VARCHAR(255) NOT NULL,
    target_phone VARCHAR(32) NOT NULL,
    target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('Driver', 'Passenger')),
    due_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 9. Table: xai_lead_imports
-- Audit batches of XLSX lead ingestion runs with duplicate and rejection stats.
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ============================================================================
-- PERFORMANCE & INTEGRITY INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_xai_drivers_phone ON xai_drivers(phone);
CREATE INDEX IF NOT EXISTS idx_xai_drivers_status ON xai_drivers(status);
CREATE INDEX IF NOT EXISTS idx_xai_drivers_consent ON xai_drivers(consent_status, dnc_status);
CREATE INDEX IF NOT EXISTS idx_xai_passengers_phone ON xai_passengers(phone);
CREATE INDEX IF NOT EXISTS idx_xai_passengers_consent ON xai_passengers(consent_status, dnc_status);
CREATE INDEX IF NOT EXISTS idx_xai_call_records_time ON xai_call_records(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_xai_call_records_contact ON xai_call_records(contact_phone);
CREATE INDEX IF NOT EXISTS idx_xai_kyc_docs_driver ON xai_kyc_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_xai_tasks_assigned ON xai_follow_up_tasks(assigned_to_id, status);
CREATE INDEX IF NOT EXISTS idx_xai_employees_role ON xai_employees(role);

-- ============================================================================
-- AUTOMATIC TIMESTAMPTZ TRIGGER FOR updated_at COLUMNS
-- ============================================================================
CREATE OR REPLACE FUNCTION xai_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xai_company_profile_updated ON xai_company_profile;
CREATE TRIGGER trg_xai_company_profile_updated BEFORE UPDATE ON xai_company_profile FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_employees_updated ON xai_employees;
CREATE TRIGGER trg_xai_employees_updated BEFORE UPDATE ON xai_employees FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_drivers_updated ON xai_drivers;
CREATE TRIGGER trg_xai_drivers_updated BEFORE UPDATE ON xai_drivers FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_kyc_documents_updated ON xai_kyc_documents;
CREATE TRIGGER trg_xai_kyc_documents_updated BEFORE UPDATE ON xai_kyc_documents FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_passengers_updated ON xai_passengers;
CREATE TRIGGER trg_xai_passengers_updated BEFORE UPDATE ON xai_passengers FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_ai_agents_updated ON xai_ai_agents;
CREATE TRIGGER trg_xai_ai_agents_updated BEFORE UPDATE ON xai_ai_agents FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();

DROP TRIGGER IF EXISTS trg_xai_follow_up_tasks_updated ON xai_follow_up_tasks;
CREATE TRIGGER trg_xai_follow_up_tasks_updated BEFORE UPDATE ON xai_follow_up_tasks FOR EACH ROW EXECUTE FUNCTION xai_set_updated_at();
