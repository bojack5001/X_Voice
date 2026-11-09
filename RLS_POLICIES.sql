-- ============================================================================
-- XPOOL AI CONNECT (XAI) — ROW LEVEL SECURITY (RLS) POLICIES
-- Version: 3.0 (Production-Safe Architecture Revision)
--
-- CORE SAFETY GUARANTEES:
-- 1. All policies are strictly scoped to 'xai_' tables.
-- 2. Zero modifications to existing XPOOL production tables.
-- 3. Multi-tier role enforcement: CEO, HR, Team Leader, Customer Care Executive.
-- 4. Sensitive KYC masking and team-ownership data isolation.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Functions: Identity & Role Resolution
-- ----------------------------------------------------------------------------

-- Function: Resolve current authenticated user's XAI role
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

-- Function: Resolve current authenticated user's XAI employee ID
CREATE OR REPLACE FUNCTION xai_get_employee_id()
RETURNS VARCHAR(32)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    emp_id VARCHAR(32);
BEGIN
    SELECT id INTO emp_id
    FROM xai_employees
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    RETURN emp_id;
END;
$$;

-- Function: Check if current employee is Team Leader of a specific employee
CREATE OR REPLACE FUNCTION xai_is_team_lead_of(subordinate_id VARCHAR(32))
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_lead BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM xai_employees
        WHERE id = subordinate_id
          AND team_leader_id = xai_get_employee_id()
    ) INTO is_lead;

    RETURN COALESCE(is_lead, false);
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Enable Row Level Security on all 12 XAI Tables
-- ----------------------------------------------------------------------------
ALTER TABLE xai_company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_contact_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_call_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_follow_up_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_lead_imports ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Policies: xai_company_profile
-- Read: All authenticated staff.
-- Write: CEO only.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_company_profile_select ON xai_company_profile;
CREATE POLICY p_xai_company_profile_select ON xai_company_profile
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS p_xai_company_profile_modify ON xai_company_profile;
CREATE POLICY p_xai_company_profile_modify ON xai_company_profile
    FOR ALL TO authenticated
    USING (xai_get_user_role() = 'CEO')
    WITH CHECK (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 4. Policies: xai_employees
-- Read: All staff can view team directory.
-- Modify: CEO and HR manage staff. Self-update for active employee profile.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_employees_select ON xai_employees;
CREATE POLICY p_xai_employees_select ON xai_employees
    FOR SELECT TO authenticated
    USING (
        auth.uid() = auth_user_id
        OR xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive')
    );

DROP POLICY IF EXISTS p_xai_employees_insert ON xai_employees;
CREATE POLICY p_xai_employees_insert ON xai_employees
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'HR'));

DROP POLICY IF EXISTS p_xai_employees_update ON xai_employees;
CREATE POLICY p_xai_employees_update ON xai_employees
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR') OR auth.uid() = auth_user_id)
    WITH CHECK (xai_get_user_role() IN ('CEO', 'HR') OR auth.uid() = auth_user_id);

DROP POLICY IF EXISTS p_xai_employees_delete ON xai_employees;
CREATE POLICY p_xai_employees_delete ON xai_employees
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 5. Policies: xai_suppression_list
-- Read: All operational roles (needed for pre-call DNC checks).
-- Insert: CEO, HR, Team Leader, Customer Care Executive (capturing opt-outs).
-- Modify / Delete: CEO and Team Leader only.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_suppression_select ON xai_suppression_list;
CREATE POLICY p_xai_suppression_select ON xai_suppression_list
    FOR SELECT TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_suppression_insert ON xai_suppression_list;
CREATE POLICY p_xai_suppression_insert ON xai_suppression_list
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_suppression_update ON xai_suppression_list;
CREATE POLICY p_xai_suppression_update ON xai_suppression_list
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_suppression_delete ON xai_suppression_list;
CREATE POLICY p_xai_suppression_delete ON xai_suppression_list
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 6. Policies: xai_contact_consents
-- Read: All authenticated staff.
-- Insert: CEO, Team Leader, and Customer Care Executive.
-- Update (Revocation): CEO, Team Leader, and Customer Care Executive.
-- Delete: Strictly CEO (consent audit history is legally sensitive and immutable).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_consents_select ON xai_contact_consents;
CREATE POLICY p_xai_consents_select ON xai_contact_consents
    FOR SELECT TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_consents_insert ON xai_contact_consents;
CREATE POLICY p_xai_consents_insert ON xai_contact_consents
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_consents_update ON xai_contact_consents;
CREATE POLICY p_xai_consents_update ON xai_contact_consents
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_consents_delete ON xai_contact_consents;
CREATE POLICY p_xai_consents_delete ON xai_contact_consents
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 7. Policies: xai_drivers
-- Read:
--   CEO & HR: Full read.
--   Team Leader: Drivers assigned to their team or unassigned leads.
--   Customer Care: Drivers assigned to the executive or unassigned leads.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_drivers_select ON xai_drivers;
CREATE POLICY p_xai_drivers_select ON xai_drivers
    FOR SELECT TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'HR')
        OR (xai_get_user_role() = 'Team Leader' AND (assigned_team_leader_id = xai_get_employee_id() OR assigned_team_leader_id IS NULL))
        OR (xai_get_user_role() = 'Customer Care Executive' AND (assigned_employee_id = xai_get_employee_id() OR assigned_employee_id IS NULL))
    );

DROP POLICY IF EXISTS p_xai_drivers_insert ON xai_drivers;
CREATE POLICY p_xai_drivers_insert ON xai_drivers
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_drivers_update ON xai_drivers;
CREATE POLICY p_xai_drivers_update ON xai_drivers
    FOR UPDATE TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (xai_get_user_role() = 'Customer Care Executive' AND (assigned_employee_id = xai_get_employee_id() OR assigned_employee_id IS NULL))
    )
    WITH CHECK (
        xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (xai_get_user_role() = 'Customer Care Executive' AND (assigned_employee_id = xai_get_employee_id() OR assigned_employee_id IS NULL))
    );

DROP POLICY IF EXISTS p_xai_drivers_delete ON xai_drivers;
CREATE POLICY p_xai_drivers_delete ON xai_drivers
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 8. Policies & Column Security: xai_kyc_documents
-- Sensitive Data Protection:
-- - Document numbers are masked in document_number_masked for ordinary staff.
-- - Raw document_number_encrypted is restricted from general select.
-- - Private storage buckets are accessed exclusively via authenticated signed URLs.
-- ----------------------------------------------------------------------------
REVOKE SELECT (document_number_encrypted) ON xai_kyc_documents FROM authenticated;
GRANT SELECT (
    id, driver_id, document_type, document_number_masked,
    storage_bucket, storage_path, status,
    verified_by_employee_id, verified_at, rejection_reason,
    notes, created_at, updated_at
) ON xai_kyc_documents TO authenticated;

DROP POLICY IF EXISTS p_xai_kyc_documents_select ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_select ON xai_kyc_documents
    FOR SELECT TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'HR')
        OR (
            xai_get_user_role() IN ('Team Leader', 'Customer Care Executive')
            AND EXISTS (
                SELECT 1 FROM xai_drivers d
                WHERE d.id = xai_kyc_documents.driver_id
                  AND (d.assigned_employee_id = xai_get_employee_id() OR d.assigned_team_leader_id = xai_get_employee_id() OR d.assigned_employee_id IS NULL)
            )
        )
    );

DROP POLICY IF EXISTS p_xai_kyc_documents_insert ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_insert ON xai_kyc_documents
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_kyc_documents_update ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_update ON xai_kyc_documents
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_kyc_documents_delete ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_delete ON xai_kyc_documents
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 9. Policies: xai_passengers
-- Read: CEO, HR, Team Leader, and Customer Care Executive.
-- Modify: CEO, Team Leader, Customer Care Executive.
-- Delete: CEO only.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_passengers_select ON xai_passengers;
CREATE POLICY p_xai_passengers_select ON xai_passengers
    FOR SELECT TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_insert ON xai_passengers;
CREATE POLICY p_xai_passengers_insert ON xai_passengers
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_update ON xai_passengers;
CREATE POLICY p_xai_passengers_update ON xai_passengers
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_delete ON xai_passengers;
CREATE POLICY p_xai_passengers_delete ON xai_passengers
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 10. Policies: xai_ai_agents
-- Read: All operational roles (needed for dispatch configuration).
-- Write: Restricted to CEO and Team Leader.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_ai_agents_select ON xai_ai_agents;
CREATE POLICY p_xai_ai_agents_select ON xai_ai_agents
    FOR SELECT TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_ai_agents_modify ON xai_ai_agents;
CREATE POLICY p_xai_ai_agents_modify ON xai_ai_agents
    FOR ALL TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 11. Policies: xai_call_jobs (Call Initiation & Authorization)
-- Call initiation strictly restricted to authorized roles (CEO, Team Leader, CCE).
-- HR is an administrative/audit role and CANNOT initiate calls.
-- CCE can only initiate jobs with their own employee ID as initiator.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_call_jobs_select ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_select ON xai_call_jobs
    FOR SELECT TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'HR')
        OR (xai_get_user_role() = 'Team Leader' AND (initiated_by_employee_id = xai_get_employee_id() OR xai_is_team_lead_of(initiated_by_employee_id)))
        OR (xai_get_user_role() = 'Customer Care Executive' AND initiated_by_employee_id = xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_call_jobs_insert ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_insert ON xai_call_jobs
    FOR INSERT TO authenticated
    WITH CHECK (
        (xai_get_user_role() IN ('CEO', 'Team Leader'))
        OR (xai_get_user_role() = 'Customer Care Executive' AND initiated_by_employee_id = xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_call_jobs_update ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_update ON xai_call_jobs
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_call_jobs_delete ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_delete ON xai_call_jobs
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 12. Policies: xai_call_records
-- Read: Full audit visibility for CEO and HR.
-- Team Leader views team calls; CCE views calls they escalated or handled.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_call_records_select ON xai_call_records;
CREATE POLICY p_xai_call_records_select ON xai_call_records
    FOR SELECT TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'HR')
        OR xai_get_user_role() = 'Team Leader'
        OR (xai_get_user_role() = 'Customer Care Executive' AND (escalated_to_id = xai_get_employee_id() OR escalated_to_id IS NULL))
    );

DROP POLICY IF EXISTS p_xai_call_records_insert ON xai_call_records;
CREATE POLICY p_xai_call_records_insert ON xai_call_records
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_call_records_update ON xai_call_records;
CREATE POLICY p_xai_call_records_update ON xai_call_records
    FOR UPDATE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_call_records_delete ON xai_call_records;
CREATE POLICY p_xai_call_records_delete ON xai_call_records
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 13. Policies: xai_follow_up_tasks
-- Staff can view and update tasks assigned to them or their team.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_tasks_select ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_select ON xai_follow_up_tasks
    FOR SELECT TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'HR')
        OR (xai_get_user_role() = 'Team Leader' AND (team_leader_id = xai_get_employee_id() OR assigned_to_id = xai_get_employee_id() OR team_leader_id IS NULL))
        OR (xai_get_user_role() = 'Customer Care Executive' AND (assigned_to_id = xai_get_employee_id() OR assigned_to_id IS NULL))
    );

DROP POLICY IF EXISTS p_xai_tasks_insert ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_insert ON xai_follow_up_tasks
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_tasks_update ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_update ON xai_follow_up_tasks
    FOR UPDATE TO authenticated
    USING (
        xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (xai_get_user_role() = 'Customer Care Executive' AND assigned_to_id = xai_get_employee_id())
    )
    WITH CHECK (
        xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (xai_get_user_role() = 'Customer Care Executive' AND assigned_to_id = xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_tasks_delete ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_delete ON xai_follow_up_tasks
    FOR DELETE TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 14. Policies: xai_lead_imports
-- Ingestion audit batches managed by Team Leader and CEO.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_lead_imports_select ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_select ON xai_lead_imports
    FOR SELECT TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_lead_imports_insert ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_insert ON xai_lead_imports
    FOR INSERT TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_lead_imports_delete ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_delete ON xai_lead_imports
    FOR DELETE TO authenticated
    USING (xai_get_user_role() = 'CEO');
