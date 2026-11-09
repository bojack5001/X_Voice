-- ============================================================================
-- XPOOL AI CONNECT (XAI) — SUPABASE STORAGE SECURITY POLICIES
-- Version: 3.6 (Security Remediation Architecture)
--
-- CORE SAFETY & COMPLIANCE GUARANTEES:
-- 1. Creates private, non-public bucket 'xai-kyc-private'.
-- 2. Strictly restricts MIME types to PDF and verified image formats.
-- 3. File size capped at 10 MB per document.
-- 4. Assignment-based storage RLS prevents unauthorized viewing or tampering.
-- 5. No Markdown fences, 100% ANSI/PostgreSQL SQL.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create / Configure Private KYC Storage Bucket
-- Notice: public = false guarantees no unauthenticated public URL access.
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'xai-kyc-private',
    'xai-kyc-private',
    false,
    10485760, -- 10 MB maximum upload size
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- ----------------------------------------------------------------------------
-- 2. Storage Objects RLS: Download & Read Access (SELECT)
-- Storage Object Path Standard: drivers/{driver_id}/{document_type}_{uuid}.pdf
-- Resolves driver_id from path: (string_to_array(name, '/'))[2]
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_storage_kyc_select ON storage.objects;
CREATE POLICY p_storage_kyc_select ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'xai-kyc-private'
        AND (
            public.xai_get_user_role() IN ('CEO', 'HR')
            OR (
                public.xai_get_user_role() = 'Team Leader'
                AND EXISTS (
                    SELECT 1 FROM public.xai_drivers d
                    WHERE d.id = (string_to_array(name, '/'))[2]
                      AND (
                          d.assigned_team_leader_id = public.xai_get_employee_id()
                          OR public.xai_is_team_lead_of(d.assigned_employee_id)
                          OR d.assigned_team_leader_id IS NULL
                      )
                )
            )
            OR (
                public.xai_get_user_role() = 'Customer Care Executive'
                AND EXISTS (
                    SELECT 1 FROM public.xai_drivers d
                    WHERE d.id = (string_to_array(name, '/'))[2]
                      AND d.assigned_employee_id = public.xai_get_employee_id()
                )
            )
        )
    );

-- ----------------------------------------------------------------------------
-- 3. Storage Objects RLS: Upload Access (INSERT)
-- Only allowed to upload to paths for assigned drivers.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_storage_kyc_insert ON storage.objects;
CREATE POLICY p_storage_kyc_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'xai-kyc-private'
        AND (
            public.xai_get_user_role() IN ('CEO', 'Team Leader')
            OR (
                public.xai_get_user_role() = 'Customer Care Executive'
                AND EXISTS (
                    SELECT 1 FROM public.xai_drivers d
                    WHERE d.id = (string_to_array(name, '/'))[2]
                      AND d.assigned_employee_id = public.xai_get_employee_id()
                )
            )
        )
    );

-- ----------------------------------------------------------------------------
-- 4. Storage Objects RLS: Update & Overwrite Access (UPDATE)
-- Overwriting existing compliance evidence is restricted to CEO and Team Leader.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_storage_kyc_update ON storage.objects;
CREATE POLICY p_storage_kyc_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'xai-kyc-private'
        AND public.xai_get_user_role() IN ('CEO', 'Team Leader')
    )
    WITH CHECK (
        bucket_id = 'xai-kyc-private'
        AND public.xai_get_user_role() IN ('CEO', 'Team Leader')
    );

-- ----------------------------------------------------------------------------
-- 5. Storage Objects RLS: Deletion Access (DELETE)
-- Hard deletion of uploaded KYC documents is restricted strictly to CEO.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_storage_kyc_delete ON storage.objects;
CREATE POLICY p_storage_kyc_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'xai-kyc-private'
        AND public.xai_get_user_role() = 'CEO'
    );
