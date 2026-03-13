/**
 * Tests for src/middleware/checkPasswordChange.js
 *
 * checkPasswordChange blocks access (403) when profile.mustChangePassword
 * is true and the request path is NOT the password-change endpoint itself.
 */

const { checkPasswordChange } = require('../../src/middleware/checkPasswordChange');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('checkPasswordChange middleware', () => {
  test('calls next when mustChangePassword is false', () => {
    const req = { profile: { mustChangePassword: false }, path: '/api/patients' };
    const res = buildRes();
    const next = jest.fn();

    checkPasswordChange(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('calls next when no profile exists (unauthenticated route)', () => {
    const req = { path: '/api/auth/register' };
    const res = buildRes();
    const next = jest.fn();

    checkPasswordChange(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('blocks non-password-change routes when mustChangePassword is true', () => {
    const req = { profile: { mustChangePassword: true }, path: '/api/patients' };
    const res = buildRes();
    const next = jest.fn();

    checkPasswordChange(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PASSWORD_CHANGE_REQUIRED' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('allows the change-password endpoint even when mustChangePassword is true', () => {
    const req = { profile: { mustChangePassword: true }, path: '/api/auth/change-password' };
    const res = buildRes();
    const next = jest.fn();

    checkPasswordChange(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
