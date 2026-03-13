/**
 * Tests for src/middleware/scopeFilter.js
 *
 * scopeFilter(resourceType) adds req.scopeFilter — a Mongo query object —
 * based on the authenticated user's role:
 *   super_admin    → {} (no restriction)
 *   org_admin      → { organizationId: profile.organizationId }
 *   care_manager   → { organizationId: profile.organizationId }
 *   caretaker      → { organizationId: profile.organizationId }
 *   patient_mentor → { organizationId: profile.organizationId }
 *   patient        → { supabaseUid: profile.supabaseUid }
 */

const mongoose = require('mongoose');

// We need to read the middleware directly — no external deps to mock
const { scopeFilter } = require('../../src/middleware/scopeFilter');

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('scopeFilter middleware', () => {
  const orgId = new mongoose.Types.ObjectId();

  test('returns 401 when no profile', () => {
    const mw = scopeFilter('patients');
    const req = {};
    const res = buildRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('super_admin gets empty scope (unrestricted)', () => {
    const mw = scopeFilter('patients');
    const req = { profile: { role: 'super_admin', organizationId: orgId } };
    const res = buildRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.scopeFilter).toEqual({});
  });

  test.each(['org_admin', 'care_manager', 'caretaker', 'patient_mentor'])(
    '%s is scoped to their organization',
    (role) => {
      const mw = scopeFilter('patients');
      const req = { profile: { role, organizationId: orgId, supabaseUid: 'uid-1' } };
      const res = buildRes();
      const next = jest.fn();

      mw(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.scopeFilter).toMatchObject({ organizationId: orgId });
    },
  );

  test('patient is scoped to their own supabaseUid', () => {
    const mw = scopeFilter('patients');
    const req = { profile: { role: 'patient', organizationId: orgId, supabaseUid: 'uid-pat' } };
    const res = buildRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.scopeFilter).toMatchObject({ supabaseUid: 'uid-pat' });
  });
});
