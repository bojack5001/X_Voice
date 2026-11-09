-- ============================================================================
-- XPOOL AI CONNECT (XAI) — ROW LEVEL SECURITY (RLS) POLICIES
-- Version: 2.0 (Phase 2 Supabase Production Migration)
-- Safety Guarantee: All policies are strictly scoped to 'xai_' tables.
-- Zero modifications to existing XPOOL production tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Function: Extract Authenticated Employee Role
-- Resolves the authenticated Supabase user (auth.uid()) to an XAI employee role.
-- Roles: 'CEO', 'HR', 'Team Leader', 'Customer Care Executive'
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. Enable RLS on all 9 XAI tables
-- ----------------------------------------------------------------------------
ALTER TABLE xai_company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_follow_up_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xai_lead_imports ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Policies: xai_company_profile
-- CEO has full management; HR, Team Leader, and Customer Care have read-only access.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_company_profile_select ON xai_company_profile;
CREATE POLICY p_xai_company_profile_select ON xai_company_profile
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS p_xai_company_profile_modify ON xai_company_profile;
CREATE POLICY p_xai_company_profile_modify ON xai_company_profile
    FOR ALL
    TO authenticated
    USING (xai_get_user_role() = 'CEO')
    WITH CHECK (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 4. Policies: xai_employees
-- CEO and HR can manage all employee records.
-- Team Leader and Customer Care Executives can view the staff roster.
-- Employees can always view their own profile.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_employees_select ON xai_employees;
CREATE POLICY p_xai_employees_select ON xai_employees
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = auth_user_id
        OR xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive')
    );

DROP POLICY IF EXISTS p_xai_employees_insert ON xai_employees;
CREATE POLICY p_xai_employees_insert ON xai_employees
    FOR INSERT
    TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'HR'));

DROP POLICY IF EXISTS p_xai_employees_update ON xai_employees;
CREATE POLICY p_xai_employees_update ON xai_employees
    FOR UPDATE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR') OR auth.uid() = auth_user_id)
    WITH CHECK (xai_get_user_role() IN ('CEO', 'HR') OR auth.uid() = auth_user_id);

DROP POLICY IF EXISTS p_xai_employees_delete ON xai_employees;
CREATE POLICY p_xai_employees_delete ON xai_employees
    FOR DELETE
    TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 5. Policies: xai_drivers
-- CEO and Team Leader have full management access.
-- Customer Care Executive can view drivers and update engagement notes/consent.
-- HR has read-only access for compliance audits.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_drivers_select ON xai_drivers;
CREATE POLICY p_xai_drivers_select ON xai_drivers
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_drivers_insert ON xai_drivers;
CREATE POLICY p_xai_drivers_insert ON xai_drivers
    FOR INSERT
    TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_drivers_update ON xai_drivers;
CREATE POLICY p_xai_drivers_update ON xai_drivers
    FOR UPDATE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_drivers_delete ON xai_drivers;
CREATE POLICY p_xai_drivers_delete ON xai_drivers
    FOR DELETE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 6. Policies: xai_kyc_documents
-- Team Leader and Customer Care Executives review and verify driver docs.
-- CEO has full access; HR has audit read access.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_kyc_documents_select ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_select ON xai_kyc_documents
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_kyc_documents_modify ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_modify ON xai_kyc_documents
    FOR ALL
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

-- ----------------------------------------------------------------------------
-- 7. Policies: xai_passengers
-- Full read for operational roles. Team Leader and Customer Care can update.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_passengers_select ON xai_passengers;
CREATE POLICY p_xai_passengers_select ON xai_passengers
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_insert ON xai_passengers;
CREATE POLICY p_xai_passengers_insert ON xai_passengers
    FOR INSERT
    TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_update ON xai_passengers;
CREATE POLICY p_xai_passengers_update ON xai_passengers
    FOR UPDATE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_delete ON xai_passengers;
CREATE POLICY p_xai_passengers_delete ON xai_passengers
    FOR DELETE
    TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 8. Policies: xai_ai_agents
-- Team Leader and CEO configure voice prompts and agent personas.
-- Customer Care Executives have read access to inspect active scripts.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_ai_agents_select ON xai_ai_agents;
CREATE POLICY p_xai_ai_agents_select ON xai_ai_agents
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_ai_agents_modify ON xai_ai_agents;
CREATE POLICY p_xai_ai_agents_modify ON xai_ai_agents
    FOR ALL
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 9. Policies: xai_call_records
-- Audit log of simulated/dispatched calls.
-- All operational roles can read call history and transcripts.
-- Team Leader and Customer Care Executives can log manual calls.
-- Hard delete is restricted to CEO.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_call_records_select ON xai_call_records;
CREATE POLICY p_xai_call_records_select ON xai_call_records
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_call_records_insert ON xai_call_records;
CREATE POLICY p_xai_call_records_insert ON xai_call_records
    FOR INSERT
    TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_call_records_update ON xai_call_records;
CREATE POLICY p_xai_call_records_update ON xai_call_records
    FOR UPDATE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_call_records_delete ON xai_call_records;
CREATE POLICY p_xai_call_records_delete ON xai_call_records
    FOR DELETE
    TO authenticated
    USING (xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 10. Policies: xai_follow_up_tasks
-- All staff can view tasks; assignees and leaders can update task statuses.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_follow_up_tasks_select ON xai_follow_up_tasks;
CREATE POLICY p_xai_follow_up_tasks_select ON xai_follow_up_tasks
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_follow_up_tasks_insert ON xai_follow_up_tasks;
CREATE POLICY p_xai_follow_up_tasks_insert ON xai_follow_up_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_follow_up_tasks_update ON xai_follow_up_tasks;
CREATE POLICY p_xai_follow_up_tasks_update ON xai_follow_up_tasks
    FOR UPDATE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_follow_up_tasks_delete ON xai_follow_up_tasks;
CREATE POLICY p_xai_follow_up_tasks_delete ON xai_follow_up_tasks
    FOR DELETE
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 11. Policies: xai_lead_imports
-- Audit batches of lead imports.
-- Only Team Leader and CEO can upload and view import batch audit reports.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_lead_imports_select ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_select ON xai_lead_imports
    FOR SELECT
    TO authenticated
    USING (xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_lead_imports_insert ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_insert ON xai_lead_imports
    FOR INSERT
    TO authenticated
    WITH CHECK (xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_lead_imports_delete ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_delete ON xai_lead_imports
    FOR DELETE
    TO authenticated
    USING (xai_get_user_role() = 'CEO');
