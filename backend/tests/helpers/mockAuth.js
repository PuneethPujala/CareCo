const mongoose = require('mongoose');

/**
 * Build a realistic Profile object for use in tests.
 * Callers can override any field.
 */
function mockProfile(overrides = {}) {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    supabaseUid: overrides.supabaseUid || 'sup-uid-' + id.toHexString().slice(0, 8),
    email: overrides.email || 'test@careco.in',
    fullName: overrides.fullName || 'Test User',
    role: overrides.role || 'care_manager',
    organizationId: overrides.organizationId || new mongoose.Types.ObjectId(),
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    mustChangePassword: overrides.mustChangePassword || false,
    emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
    failedLoginAttempts: overrides.failedLoginAttempts || 0,
    accountLockedUntil: overrides.accountLockedUntil || null,
    metadata: overrides.metadata || {},
    // Mongoose-like helpers
    hasRole(role) { return this.role === role; },
    hasAnyRole(roles) { return roles.includes(this.role); },
    get isLocked() {
      return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
    },
    ...overrides,
  };
}

/**
 * Build a fake Supabase user (the shape returned by supabase.auth.getUser).
 */
function mockSupabaseUser(overrides = {}) {
  return {
    id: overrides.id || 'sup-uid-12345678',
    email: overrides.email || 'test@careco.in',
    user_metadata: overrides.user_metadata || { full_name: 'Test User', role: 'care_manager' },
    ...overrides,
  };
}

/**
 * Middleware that injects a fake authenticated user + profile into the request.
 * Use this in tests INSTEAD of the real authenticate middleware.
 *
 * Usage:
 *   jest.mock('../../src/middleware/authenticate', () => ({
 *       authenticate: fakeAuthenticate(profileOverrides),
 *       requireRole: () => (req, res, next) => next(),
 *       ...
 *   }));
 */
function fakeAuthenticate(profileOverrides = {}) {
  const profile = mockProfile(profileOverrides);
  const user = mockSupabaseUser({
    id: profile.supabaseUid,
    email: profile.email,
  });
  return (req, _res, next) => {
    req.user = user;
    req.profile = profile;
    next();
  };
}

/**
 * A pass-through middleware — just calls next().
 * Used to stub out authorize, requireRole, etc.
 */
function passThrough() {
  return (_req, _res, next) => next();
}

module.exports = {
  mockProfile,
  mockSupabaseUser,
  fakeAuthenticate,
  passThrough,
};
