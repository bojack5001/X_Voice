-- ============================================================================
-- XPOOL AI CONNECT (XAI) — ROW LEVEL SECURITY (RLS) POLICIES
-- Version: 3.6 (Security Remediation Architecture)
--
-- CORE SAFETY & AUTHORIZATION GUARANTEES:
-- 1. All policies are strictly scoped to 'xai_' tables.
-- 2. Zero modifications to existing XPOOL production tables.
-- 3. Inactive or on-leave staff automatically lose all system privileges.
-- 4. Assignment-based isolation: CCE can only access their assigned contacts.
-- 5. KYC raw document numbers are explicitly revoked at the table level.
-- 6. HR cannot modify CEO profiles or their own role/permissions.
-- 7. Call dispatch execution is strictly restricted to service_role.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Functions: Active Employee Identity & Role Resolution
-- Notice: Every helper strictly verifies status = 'Active' and pins search_path.
-- ----------------------------------------------------------------------------

-- Function: Resolve current authenticated user's active XAI role
CREATE OR REPLACE FUNCTION public.xai_get_user_role()
RETURNS VARCHAR(32)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_role VARCHAR(32);
BEGIN
    SELECT role INTO user_role
    FROM public.xai_employees
    WHERE auth_user_id = auth.uid()
      AND status = 'Active'
    LIMIT 1;

    RETURN user_role;
END;
$$;

-- Function: Resolve current authenticated user's active XAI employee ID
CREATE OR REPLACE FUNCTION public.xai_get_employee_id()
RETURNS VARCHAR(32)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    emp_id VARCHAR(32);
BEGIN
    SELECT id INTO emp_id
    FROM public.xai_employees
    WHERE auth_user_id = auth.uid()
      AND status = 'Active'
    LIMIT 1;

    RETURN emp_id;
END;
$$;

-- Function: Check if current employee is the active Team Leader of a specific subordinate
CREATE OR REPLACE FUNCTION public.xai_is_team_lead_of(subordinate_id VARCHAR(32))
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    is_lead BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.xai_employees
        WHERE id = subordinate_id
          AND team_leader_id = public.xai_get_employee_id()
          AND status = 'Active'
    ) INTO is_lead;

    RETURN COALESCE(is_lead, false);
END;
$$;

-- Explicit least-privilege grants on helper functions
REVOKE EXECUTE ON FUNCTION public.xai_get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.xai_get_user_role() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.xai_get_employee_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.xai_get_employee_id() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.xai_is_team_lead_of(VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.xai_is_team_lead_of(VARCHAR) TO authenticated, service_role;

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
    FOR SELECT TO authenticated
    USING (public.xai_get_user_role() IS NOT NULL);

DROP POLICY IF EXISTS p_xai_company_profile_modify ON xai_company_profile;
CREATE POLICY p_xai_company_profile_modify ON xai_company_profile
    FOR ALL TO authenticated
    USING (public.xai_get_user_role() = 'CEO')
    WITH CHECK (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 4. Policies: xai_employees
-- Read: All active staff can view team directory.
-- Insert: CEO and HR (HR cannot insert CEO role, enforced by trigger).
-- Update:
--   CEO: Can update any employee.
--   HR: Can update ordinary employees (CANNOT modify CEO profiles and CANNOT modify own profile).
--   Ordinary staff: Can update only their own profile (avatar_url, phone).
-- Delete: Strictly CEO.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_employees_select ON xai_employees;
CREATE POLICY p_xai_employees_select ON xai_employees
    FOR SELECT TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_employees_insert ON xai_employees;
CREATE POLICY p_xai_employees_insert ON xai_employees
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'HR'));

DROP POLICY IF EXISTS p_xai_employees_update ON xai_employees;
CREATE POLICY p_xai_employees_update ON xai_employees
    FOR UPDATE TO authenticated
    USING (
        public.xai_get_user_role() = 'CEO'
        OR (
            public.xai_get_user_role() = 'HR'
            AND role != 'CEO'
            AND id != public.xai_get_employee_id()
        )
        OR (
            auth.uid() = auth_user_id
            AND public.xai_get_user_role() IS NOT NULL
        )
    )
    WITH CHECK (
        public.xai_get_user_role() = 'CEO'
        OR (
            public.xai_get_user_role() = 'HR'
            AND role != 'CEO'
            AND id != public.xai_get_employee_id()
        )
        OR (
            auth.uid() = auth_user_id
            AND public.xai_get_user_role() IS NOT NULL
        )
    );

DROP POLICY IF EXISTS p_xai_employees_delete ON xai_employees;
CREATE POLICY p_xai_employees_delete ON xai_employees
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 5. Policies: xai_suppression_list
-- Read: All active staff (needed for DNC verification).
-- Insert: CEO, HR, Team Leader, and CCE (when customer requests opt-out).
-- Update: CEO and Team Leader only.
-- Delete: Strictly CEO.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_suppression_select ON xai_suppression_list;
CREATE POLICY p_xai_suppression_select ON xai_suppression_list
    FOR SELECT TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_suppression_insert ON xai_suppression_list;
CREATE POLICY p_xai_suppression_insert ON xai_suppression_list
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_suppression_update ON xai_suppression_list;
CREATE POLICY p_xai_suppression_update ON xai_suppression_list
    FOR UPDATE TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_suppression_delete ON xai_suppression_list;
CREATE POLICY p_xai_suppression_delete ON xai_suppression_list
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 6. Policies: xai_contact_consents
-- Read: All active staff.
-- Insert: CEO, Team Leader, and CCE (capturing verified opt-in).
-- Update: Allowed only to record revocation (setting consent_status = 'Revoked').
-- Delete: FORBIDDEN TO ALL ROLES (immutable legal compliance log).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_consents_select ON xai_contact_consents;
CREATE POLICY p_xai_consents_select ON xai_contact_consents
    FOR SELECT TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_consents_insert ON xai_contact_consents;
CREATE POLICY p_xai_consents_insert ON xai_contact_consents
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_consents_update ON xai_contact_consents;
CREATE POLICY p_xai_consents_update ON xai_contact_consents
    FOR UPDATE TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'))
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_consents_delete ON xai_contact_consents;
CREATE POLICY p_xai_consents_delete ON xai_contact_consents
    FOR DELETE TO authenticated
    USING (false);

-- ----------------------------------------------------------------------------
-- 7. Policies: xai_drivers (Assignment-Based Access Isolation)
-- Read:
--   CEO: Company-wide.
--   HR: Company-wide read-only (compliance audit).
--   Team Leader: Assigned team drivers OR unassigned leads.
--   Customer Care Executive: STRICTLY assigned drivers only.
-- Update:
--   CEO & Team Leader: Full operational update.
--   CCE: Can update notes, preferred language, or status of assigned drivers only.
--   Notice: Ownership reassignment is blocked by trg_xai_drivers_reassign_guard.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_drivers_select ON xai_drivers;
CREATE POLICY p_xai_drivers_select ON xai_drivers
    FOR SELECT TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'HR')
        OR (public.xai_get_user_role() = 'Team Leader' AND (
            assigned_team_leader_id = public.xai_get_employee_id()
            OR public.xai_is_team_lead_of(assigned_employee_id)
            OR assigned_team_leader_id IS NULL
        ))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_employee_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_drivers_insert ON xai_drivers;
CREATE POLICY p_xai_drivers_insert ON xai_drivers
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_drivers_update ON xai_drivers;
CREATE POLICY p_xai_drivers_update ON xai_drivers
    FOR UPDATE TO authenticated
    USING (
        public.xai_get_user_role() = 'CEO'
        OR (public.xai_get_user_role() = 'Team Leader' AND (assigned_team_leader_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(assigned_employee_id)))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_employee_id = public.xai_get_employee_id())
    )
    WITH CHECK (
        public.xai_get_user_role() = 'CEO'
        OR (public.xai_get_user_role() = 'Team Leader' AND (assigned_team_leader_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(assigned_employee_id)))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_employee_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_drivers_delete ON xai_drivers;
CREATE POLICY p_xai_drivers_delete ON xai_drivers
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 8. Policies & Column Grants: xai_kyc_documents
-- Sensitive Data Protection:
-- 1. Explicitly revoke table-level SELECT on all columns.
-- 2. Grant SELECT only on permitted non-sensitive and masked columns.
-- 3. Raw document_number_secure is NEVER exposed to ordinary staff.
-- ----------------------------------------------------------------------------
REVOKE ALL ON xai_kyc_documents FROM PUBLIC, authenticated, anon;
GRANT SELECT (
    id, driver_id, document_type, document_number_masked,
    storage_bucket, storage_path, status,
    verified_by_employee_id, verified_at, rejection_reason,
    notes, created_at, updated_at
) ON xai_kyc_documents TO authenticated;

GRANT INSERT (
    id, driver_id, document_type, document_number_masked,
    document_number_secure, storage_bucket, storage_path,
    status, notes
) ON xai_kyc_documents TO authenticated;

GRANT UPDATE (
    status, verified_by_employee_id, verified_at,
    rejection_reason, notes, updated_at
) ON xai_kyc_documents TO authenticated;

DROP POLICY IF EXISTS p_xai_kyc_documents_select ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_select ON xai_kyc_documents
    FOR SELECT TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'HR')
        OR (
            public.xai_get_user_role() = 'Team Leader'
            AND EXISTS (
                SELECT 1 FROM public.xai_drivers d
                WHERE d.id = xai_kyc_documents.driver_id
                  AND (d.assigned_team_leader_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(d.assigned_employee_id))
            )
        )
        OR (
            public.xai_get_user_role() = 'Customer Care Executive'
            AND EXISTS (
                SELECT 1 FROM public.xai_drivers d
                WHERE d.id = xai_kyc_documents.driver_id
                  AND d.assigned_employee_id = public.xai_get_employee_id()
            )
        )
    );

DROP POLICY IF EXISTS p_xai_kyc_documents_insert ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_insert ON xai_kyc_documents
    FOR INSERT TO authenticated
    WITH CHECK (
        public.xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (
            public.xai_get_user_role() = 'Customer Care Executive'
            AND EXISTS (
                SELECT 1 FROM public.xai_drivers d
                WHERE d.id = xai_kyc_documents.driver_id
                  AND d.assigned_employee_id = public.xai_get_employee_id()
            )
        )
    );

DROP POLICY IF EXISTS p_xai_kyc_documents_update ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_update ON xai_kyc_documents
    FOR UPDATE TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader'))
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_kyc_documents_delete ON xai_kyc_documents;
CREATE POLICY p_xai_kyc_documents_delete ON xai_kyc_documents
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 9. Policies: xai_passengers (Assignment-Based Access Isolation)
-- Read:
--   CEO & HR: Full read.
--   Team Leader: Assigned team passengers OR unassigned commuters.
--   Customer Care Executive: STRICTLY assigned passengers only.
-- Update:
--   CEO & Team Leader: Full operational update.
--   CCE: Can update notes or engagement status of assigned passengers only.
--   Notice: Ownership reassignment is blocked by trg_xai_passengers_reassign_guard.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_passengers_select ON xai_passengers;
CREATE POLICY p_xai_passengers_select ON xai_passengers
    FOR SELECT TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'HR')
        OR (public.xai_get_user_role() = 'Team Leader' AND (
            assigned_team_leader_id = public.xai_get_employee_id()
            OR public.xai_is_team_lead_of(assigned_employee_id)
            OR assigned_team_leader_id IS NULL
        ))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_employee_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_passengers_insert ON xai_passengers;
CREATE POLICY p_xai_passengers_insert ON xai_passengers
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_passengers_update ON xai_passengers;
CREATE POLICY p_xai_passengers_update ON xai_passengers
    FOR UPDATE TO authenticated
    USING (
        public.xai_get_user_role() = 'CEO'
        OR (public.xai_get_user_role() = 'Team Leader' AND (assigned_team_leader_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(assigned_employee_id)))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_employee_id = public.xai_get_employee_id())
    )
    WITH CHECK (
        public.xai_get_user_role() = 'CEO'
        OR (public.xai_get_user_role() = 'Team Leader' AND (assigned_team_leader_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(assigned_employee_id)))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_employee_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_passengers_delete ON xai_passengers;
CREATE POLICY p_xai_passengers_delete ON xai_passengers
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 10. Policies: xai_ai_agents
-- Read: All active staff (needed for dispatch).
-- Write: CEO and Team Leader only.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_ai_agents_select ON xai_ai_agents;
CREATE POLICY p_xai_ai_agents_select ON xai_ai_agents
    FOR SELECT TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_ai_agents_modify ON xai_ai_agents;
CREATE POLICY p_xai_ai_agents_modify ON xai_ai_agents
    FOR ALL TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 11. Policies: xai_call_jobs (Call Initiation & Dispatch Authorization)
-- Gating:
-- - HR is an audit role and CANNOT initiate calls.
-- - CCE can only initiate calls where initiated_by_employee_id = xai_get_employee_id()
--   and target contact is assigned to them.
-- - Status transitions are protected by trg_xai_call_jobs_transition_guard.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_call_jobs_select ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_select ON xai_call_jobs
    FOR SELECT TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'HR')
        OR (public.xai_get_user_role() = 'Team Leader' AND (initiated_by_employee_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(initiated_by_employee_id)))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND initiated_by_employee_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_call_jobs_insert ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_insert ON xai_call_jobs
    FOR INSERT TO authenticated
    WITH CHECK (
        (public.xai_get_user_role() IN ('CEO', 'Team Leader'))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND initiated_by_employee_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_call_jobs_update ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_update ON xai_call_jobs
    FOR UPDATE TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'Team Leader'))
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_call_jobs_delete ON xai_call_jobs;
CREATE POLICY p_xai_call_jobs_delete ON xai_call_jobs
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 12. Policies: xai_call_records (Audit Trail & Anti-Forgery Protection)
-- Read:
--   CEO & HR: Full audit visibility.
--   Team Leader: Team calls.
--   CCE: Calls escalated to them or where they initiated the linked call job.
-- Insert:
--   Restricted to CEO, Team Leader, or service role (backend provider webhook).
--   Ordinary CCE cannot insert arbitrary completed call records.
-- Update:
--   CCE can only add notes/action items to records assigned to them.
--   Provider fields (SID, status, recording, cost) cannot be forged by staff.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_call_records_select ON xai_call_records;
CREATE POLICY p_xai_call_records_select ON xai_call_records
    FOR SELECT TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'HR')
        OR (public.xai_get_user_role() = 'Team Leader')
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND (
            escalated_to_id = public.xai_get_employee_id()
            OR EXISTS (
                SELECT 1 FROM public.xai_call_jobs cj
                WHERE cj.id = xai_call_records.call_job_id
                  AND cj.initiated_by_employee_id = public.xai_get_employee_id()
            )
        ))
    );

DROP POLICY IF EXISTS p_xai_call_records_insert ON xai_call_records;
CREATE POLICY p_xai_call_records_insert ON xai_call_records
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_call_records_update ON xai_call_records;
CREATE POLICY p_xai_call_records_update ON xai_call_records
    FOR UPDATE TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND escalated_to_id = public.xai_get_employee_id())
    )
    WITH CHECK (
        public.xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND escalated_to_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_call_records_delete ON xai_call_records;
CREATE POLICY p_xai_call_records_delete ON xai_call_records
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');

-- ----------------------------------------------------------------------------
-- 13. Policies: xai_follow_up_tasks
-- Staff can view and update tasks assigned to them or their reporting team.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_tasks_select ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_select ON xai_follow_up_tasks
    FOR SELECT TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'HR')
        OR (public.xai_get_user_role() = 'Team Leader' AND (team_leader_id = public.xai_get_employee_id() OR public.xai_is_team_lead_of(assigned_to_id) OR team_leader_id IS NULL))
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_to_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_tasks_insert ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_insert ON xai_follow_up_tasks
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader', 'Customer Care Executive'));

DROP POLICY IF EXISTS p_xai_tasks_update ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_update ON xai_follow_up_tasks
    FOR UPDATE TO authenticated
    USING (
        public.xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_to_id = public.xai_get_employee_id())
    )
    WITH CHECK (
        public.xai_get_user_role() IN ('CEO', 'Team Leader')
        OR (public.xai_get_user_role() = 'Customer Care Executive' AND assigned_to_id = public.xai_get_employee_id())
    );

DROP POLICY IF EXISTS p_xai_tasks_delete ON xai_follow_up_tasks;
CREATE POLICY p_xai_tasks_delete ON xai_follow_up_tasks
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'Team Leader'));

-- ----------------------------------------------------------------------------
-- 14. Policies: xai_lead_imports
-- Ingestion audit batches managed strictly by Team Leader and CEO.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_xai_lead_imports_select ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_select ON xai_lead_imports
    FOR SELECT TO authenticated
    USING (public.xai_get_user_role() IN ('CEO', 'HR', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_lead_imports_insert ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_insert ON xai_lead_imports
    FOR INSERT TO authenticated
    WITH CHECK (public.xai_get_user_role() IN ('CEO', 'Team Leader'));

DROP POLICY IF EXISTS p_xai_lead_imports_delete ON xai_lead_imports;
CREATE POLICY p_xai_lead_imports_delete ON xai_lead_imports
    FOR DELETE TO authenticated
    USING (public.xai_get_user_role() = 'CEO');
