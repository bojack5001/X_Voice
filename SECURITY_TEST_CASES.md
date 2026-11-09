# XPOOL AI CONNECT (XAI) — SECURITY TEST SUITE & VERIFICATION PROOFS

**Version:** 3.6  
**Dialect:** PostgreSQL 15+ (Supabase)  
**Safety Status:** Test specifications for sandbox verification (DO NOT EXECUTE IN PRODUCTION)

---

## 1. Test Harness Setup Overview

In Supabase, client sessions are evaluated under the `authenticated` role with session identity injected via the JWT claim `request.jwt.claim.sub`. The test transactions below use PostgreSQL's `SET LOCAL` within a transaction block (`BEGIN ... ROLLBACK`) to simulate exact user contexts without persisting test data.

---

## 2. Test Case Specifications

### Test 1: HR Cannot Promote Themselves to CEO

**Security Objective:** Verify that an employee holding the `HR` role cannot change their own role to `'CEO'`, nor promote other employees to `'CEO'`.

```sql
BEGIN;
-- Setup test HR employee
INSERT INTO public.xai_employees (id, auth_user_id, name, email, phone, role, department, status)
VALUES ('EMP-HR-01', '11111111-1111-1111-1111-111111111111', 'Test HR Officer', 'hr.test@xpool.internal', '+919800000001', 'HR', 'People Operations', 'Active');

-- Simulate HR authenticated session
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

-- Attempt A: HR tries to promote themselves to CEO
DO $$
BEGIN
    UPDATE public.xai_employees
    SET role = 'CEO'
    WHERE id = 'EMP-HR-01';
    
    RAISE EXCEPTION 'TEST FAILED: HR was able to update their role to CEO';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Access Denied%' THEN
        RAISE NOTICE 'TEST 1A PASSED: HR self-promotion to CEO was blocked by trigger with message: %', SQLERRM;
    ELSE
        RAISE;
    END IF;
END $$;

-- Attempt B: HR tries to alter their own status or permissions
DO $$
BEGIN
    UPDATE public.xai_employees
    SET status = 'Inactive', permissions = ARRAY['superadmin']
    WHERE id = 'EMP-HR-01';
    
    RAISE EXCEPTION 'TEST FAILED: HR was able to alter their own governance attributes';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Access Denied%' THEN
        RAISE NOTICE 'TEST 1B PASSED: HR self-governance modification was blocked with message: %', SQLERRM;
    ELSE
        RAISE;
    END IF;
END $$;

ROLLBACK;
```

---

### Test 2: Customer Care Executive Cannot Read Unassigned Contacts

**Security Objective:** Verify that a Customer Care Executive can only see contacts assigned to their employee ID, and receives 0 rows when querying contacts assigned to other executives.

```sql
BEGIN;
-- Setup two CCEs and two drivers
INSERT INTO public.xai_employees (id, auth_user_id, name, email, phone, role, department, status) VALUES
('EMP-CCE-01', '22222222-2222-2222-2222-222222222221', 'Agent Alice', 'alice@xpool.internal', '+919800000021', 'Customer Care Executive', 'Operations', 'Active'),
('EMP-CCE-02', '22222222-2222-2222-2222-222222222222', 'Agent Bob',   'bob@xpool.internal',   '+919800000022', 'Customer Care Executive', 'Operations', 'Active');

INSERT INTO public.xai_drivers (id, name, phone, city, vehicle_type, vehicle_number, assigned_employee_id) VALUES
('DRV-ALICE', 'Alice Driver', '+919900000001', 'Chennai', 'Auto', 'TN-01-AB-1001', 'EMP-CCE-01'),
('DRV-BOB',   'Bob Driver',   '+919900000002', 'Chennai', 'Auto', 'TN-01-AB-1002', 'EMP-CCE-02');

-- Simulate Agent Alice session
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222221';

-- Attempt: Query drivers
DO $$
DECLARE
    v_count INT;
    v_has_bob BOOLEAN;
BEGIN
    SELECT COUNT(*), EXISTS(SELECT 1 FROM public.xai_drivers WHERE id = 'DRV-BOB')
    INTO v_count, v_has_bob
    FROM public.xai_drivers;

    IF v_has_bob THEN
        RAISE EXCEPTION 'TEST FAILED: Agent Alice was able to read Agent Bob assigned driver';
    END IF;

    IF v_count = 1 THEN
        RAISE NOTICE 'TEST 2 PASSED: RLS filtered out unassigned driver. Alice only sees assigned contacts.';
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Unexpected row count %', v_count;
    END IF;
END $$;

ROLLBACK;
```

---

### Test 3: Revoked Consent Cannot Be Changed Back to Granted

**Security Objective:** Verify that an existing revoked consent record is immutable and cannot be updated to `'Granted'`. New consent requires a separate evidence-backed insertion.

```sql
BEGIN;
-- Setup active employee and revoked consent record
INSERT INTO public.xai_employees (id, auth_user_id, name, email, phone, role, department, status)
VALUES ('EMP-CCE-01', '33333333-3333-3333-3333-333333333333', 'Agent Consent', 'agent.c@xpool.internal', '+919800000031', 'Customer Care Executive', 'Operations', 'Active');

INSERT INTO public.xai_contact_consents (id, contact_id, contact_type, contact_phone, purpose, consent_status, consent_source, evidence_reference, captured_at, revoked_at)
VALUES ('44444444-4444-4444-4444-444444444444', 'DRV-101', 'Driver', '+919900000101', 'onboarding', 'Revoked', 'Inbound Call', 'TICKET-REVOKE-881', now() - INTERVAL '2 days', now() - INTERVAL '1 day');

-- Simulate employee session
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

-- Attempt: Try to restore revoked consent by updating the row
DO $$
BEGIN
    UPDATE public.xai_contact_consents
    SET consent_status = 'Granted', revoked_at = NULL
    WHERE id = '44444444-4444-4444-4444-444444444444';

    RAISE EXCEPTION 'TEST FAILED: System permitted updating a Revoked consent record back to Granted';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Revoked consent cannot be re-granted on an existing record%' THEN
        RAISE NOTICE 'TEST 3 PASSED: Consent record immutability enforced. Error: %', SQLERRM;
    ELSE
        RAISE;
    END IF;
END $$;

ROLLBACK;
```

---

### Test 4: Unauthorized User Cannot Execute Call Dispatch Function

**Security Objective:** Verify that `xai_dispatch_call_job` has execute permission revoked from `PUBLIC`, `anon`, and `authenticated` roles, preventing frontend or malicious users from directly triggering calls.

```sql
BEGIN;
-- Simulate standard authenticated frontend user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '55555555-5555-5555-5555-555555555555';

-- Attempt: Client calls xai_dispatch_call_job directly
DO $$
BEGIN
    PERFORM public.xai_dispatch_call_job('00000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'TEST FAILED: Authenticated user was able to execute privileged dispatch function';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%permission denied for function xai_dispatch_call_job%' THEN
        RAISE NOTICE 'TEST 4 PASSED: Direct frontend call dispatch was blocked by PostgreSQL: %', SQLERRM;
    ELSE
        RAISE;
    END IF;
END $$;

ROLLBACK;
```

---

### Test 5: A Suppressed / DNC Number Cannot Be Called

**Security Objective:** Verify that attempting to schedule a call job for a phone number on `xai_suppression_list` is automatically rejected with `authorization_status = 'Rejected DNC'`.

```sql
BEGIN;
-- Setup active employee, verified driver, and DNC entry
INSERT INTO public.xai_employees (id, auth_user_id, name, email, phone, role, department, status)
VALUES ('EMP-CCE-01', '66666666-6666-6666-6666-666666666666', 'Agent Call', 'agent.call@xpool.internal', '+919800000041', 'Customer Care Executive', 'Operations', 'Active');

INSERT INTO public.xai_drivers (id, name, phone, city, vehicle_type, vehicle_number, assigned_employee_id)
VALUES ('DRV-DNC-01', 'Suppressed Driver', '+919999999999', 'Chennai', 'Auto', 'TN-01-DNC-9999', 'EMP-CCE-01');

INSERT INTO public.xai_suppression_list (phone_e164, reason, source)
VALUES ('+919999999999', 'National DNC Registry Block', 'National DNC');

-- Provide valid consent (suppression must take precedence)
INSERT INTO public.xai_contact_consents (contact_id, contact_type, contact_phone, purpose, consent_status, consent_source, evidence_reference)
VALUES ('DRV-DNC-01', 'Driver', '+919999999999', 'onboarding', 'Granted', 'Web Form', 'FORM-VALID-01');

UPDATE public.xai_company_profile SET is_configured = true;

-- Simulate CCE session
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '66666666-6666-6666-6666-666666666666';

-- Attempt: Create a call job
INSERT INTO public.xai_call_jobs (
    idempotency_key, contact_id, contact_type, contact_phone,
    initiated_by_employee_id, agent_type, language, call_purpose
) VALUES (
    'IDEM-TEST-DNC-001', 'DRV-DNC-01', 'Driver', '+919999999999',
    'EMP-CCE-01', 'Maya Onboarding Specialist', 'Tamil', 'onboarding'
);

-- Verify status
DO $$
DECLARE
    v_auth_status VARCHAR(32);
    v_call_status VARCHAR(32);
    v_reason TEXT;
BEGIN
    SELECT authorization_status, call_status, rejection_reason
    INTO v_auth_status, v_call_status, v_reason
    FROM public.xai_call_jobs
    WHERE idempotency_key = 'IDEM-TEST-DNC-001';

    IF v_auth_status = 'Rejected DNC' AND v_call_status = 'cancelled' THEN
        RAISE NOTICE 'TEST 5 PASSED: DNC check intercepted call. Auth: %, Status: %, Reason: %', v_auth_status, v_call_status, v_reason;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Call was not rejected for DNC. Auth: %, Status: %', v_auth_status, v_call_status;
    END IF;
END $$;

ROLLBACK;
```

---

### Test 6: Duplicate Concurrent Call Is Rejected by Partial Unique Index

**Security Objective:** Verify that `uq_xai_call_jobs_active_phone` prevents inserting a second active call job for a phone number that already has an in-progress or queued call.

```sql
BEGIN;
INSERT INTO public.xai_employees (id, auth_user_id, name, email, phone, role, department, status)
VALUES ('EMP-LEAD-01', '77777777-7777-7777-7777-777777777777', 'Lead Caller', 'lead@xpool.internal', '+919800000051', 'Team Leader', 'Operations', 'Active');

INSERT INTO public.xai_drivers (id, name, phone, city, vehicle_type, vehicle_number, assigned_team_leader_id)
VALUES ('DRV-CONC-01', 'Active Driver', '+919988776655', 'Chennai', 'Auto', 'TN-01-CC-1122', 'EMP-LEAD-01');

INSERT INTO public.xai_contact_consents (contact_id, contact_type, contact_phone, purpose, consent_status, consent_source, evidence_reference)
VALUES ('DRV-CONC-01', 'Driver', '+919988776655', 'onboarding', 'Granted', 'Web Form', 'FORM-CONC-01');

UPDATE public.xai_company_profile SET is_configured = true;

-- Insert First Job (status = queued)
INSERT INTO public.xai_call_jobs (
    idempotency_key, contact_id, contact_type, contact_phone,
    initiated_by_employee_id, agent_type, language, call_purpose, call_status
) VALUES (
    'IDEM-CONC-001', 'DRV-CONC-01', 'Driver', '+919988776655',
    'EMP-LEAD-01', 'Maya Specialist', 'Tamil', 'onboarding', 'queued'
);

-- Attempt: Insert Second Concurrent Job for the exact same phone number
DO $$
BEGIN
    INSERT INTO public.xai_call_jobs (
        idempotency_key, contact_id, contact_type, contact_phone,
        initiated_by_employee_id, agent_type, language, call_purpose, call_status
    ) VALUES (
        'IDEM-CONC-002', 'DRV-CONC-01', 'Driver', '+919988776655',
        'EMP-LEAD-01', 'Maya Specialist', 'Tamil', 'onboarding', 'queued'
    );

    RAISE EXCEPTION 'TEST FAILED: Duplicate concurrent call was permitted for active phone number';
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'TEST 6 PASSED: Concurrency constraint uq_xai_call_jobs_active_phone rejected duplicate call';
END $$;

ROLLBACK;
```

---

### Test 7: KYC Document Cannot Be Accessed by Unauthorized Employees

**Security Objective:** Verify that a Customer Care Executive cannot view KYC documents belonging to a driver assigned to another employee, and cannot read raw document numbers.

```sql
BEGIN;
INSERT INTO public.xai_employees (id, auth_user_id, name, email, phone, role, department, status) VALUES
('EMP-CCE-10', '88888888-8888-8888-8888-888888888881', 'Agent Ten', 'agent10@xpool.internal', '+919800000081', 'Customer Care Executive', 'Operations', 'Active'),
('EMP-CCE-20', '88888888-8888-8888-8888-888888888882', 'Agent Twenty', 'agent20@xpool.internal', '+919800000082', 'Customer Care Executive', 'Operations', 'Active');

INSERT INTO public.xai_drivers (id, name, phone, city, vehicle_type, vehicle_number, assigned_employee_id)
VALUES ('DRV-KYC-20', 'Driver Twenty', '+919988112233', 'Chennai', 'Auto', 'TN-01-KY-2020', 'EMP-CCE-20');

INSERT INTO public.xai_kyc_documents (id, driver_id, document_type, document_number_masked, document_number_secure, storage_bucket, storage_path, status)
VALUES ('99999999-9999-9999-9999-999999999999', 'DRV-KYC-20', 'Aadhaar', 'XXXX-XXXX-9999', '9999-8888-7777-6666', 'xai-kyc-private', 'drivers/DRV-KYC-20/aadhaar_01.pdf', 'Verified');

-- Simulate Agent Ten session (unassigned)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '88888888-8888-8888-8888-888888888881';

-- Attempt A: Query document row (Should return 0 rows via RLS)
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.xai_kyc_documents
    WHERE driver_id = 'DRV-KYC-20';

    IF v_count = 0 THEN
        RAISE NOTICE 'TEST 7A PASSED: Unassigned CCE cannot view KYC document metadata via RLS (0 rows returned)';
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Unassigned CCE read KYC row of driver assigned to someone else';
    END IF;
END $$;

-- Attempt B: Even assigned staff cannot select document_number_secure column
-- Switch to Agent Twenty (assigned)
SET LOCAL "request.jwt.claim.sub" = '88888888-8888-8888-8888-888888888882';

DO $$
BEGIN
    -- This query attempts to read the restricted column
    PERFORM document_number_secure FROM public.xai_kyc_documents;
    RAISE EXCEPTION 'TEST FAILED: Ordinary staff was able to select document_number_secure column';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%permission denied for column document_number_secure%' THEN
        RAISE NOTICE 'TEST 7B PASSED: Column-level revocation prevented reading raw document identifier: %', SQLERRM;
    ELSE
        RAISE;
    END IF;
END $$;

ROLLBACK;
```

