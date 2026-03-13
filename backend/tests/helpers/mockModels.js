const mongoose = require('mongoose');

/**
 * Build a fake Patient document matching the Mongoose schema shape.
 */
function mockPatient(overrides = {}) {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    supabase_uid: overrides.supabase_uid || 'sup-uid-pat-' + id.toHexString().slice(0, 6),
    profile_id: overrides.profile_id || new mongoose.Types.ObjectId(),
    name: overrides.name || 'Test Patient',
    email: overrides.email || 'patient@careco.in',
    city: overrides.city || 'Hyderabad',
    organization_id: overrides.organization_id || new mongoose.Types.ObjectId(),
    assigned_caller_id: overrides.assigned_caller_id || null,
    conditions: overrides.conditions || [],
    medications: overrides.medications || [],
    medical_history: overrides.medical_history || [],
    allergies: overrides.allergies || [],
    subscription: overrides.subscription || { status: 'active', plan: 'basic' },
    paid: overrides.paid !== undefined ? overrides.paid : 1,
    profile_complete: overrides.profile_complete !== undefined ? overrides.profile_complete : true,
    toJSON() { return { ...this, toJSON: undefined }; },
    ...overrides,
  };
}

/**
 * Build a fake Organization document.
 */
function mockOrganization(overrides = {}) {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    name: overrides.name || 'Test Org',
    city: overrides.city || 'Hyderabad',
    email: overrides.email || 'admin@testorg.in',
    phone: overrides.phone || '+919999999999',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    subscriptionPlan: overrides.subscriptionPlan || 'basic',
    counts: overrides.counts || { patients: 0, callers: 0, care_managers: 0 },
    limits: overrides.limits || { maxPatients: 500, maxCallers: 20, maxCareManagers: 5 },
    settings: overrides.settings || {},
    canAdd(type) {
      const limitMap = { patient: 'maxPatients', caller: 'maxCallers', care_manager: 'maxCareManagers' };
      const countMap = { patient: 'patients', caller: 'callers', care_manager: 'care_managers' };
      return (this.counts[countMap[type]] || 0) < (this.limits[limitMap[type]] || 999);
    },
    ...overrides,
  };
}

/**
 * Build a fake Caller document.
 */
function mockCaller(overrides = {}) {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    supabase_uid: overrides.supabase_uid || 'sup-uid-call-' + id.toHexString().slice(0, 6),
    name: overrides.name || 'Test Caller',
    email: overrides.email || 'caller@careco.in',
    employee_id: overrides.employee_id || 'CC-1234',
    city: overrides.city || 'Hyderabad',
    organization_id: overrides.organization_id || new mongoose.Types.ObjectId(),
    patient_ids: overrides.patient_ids || [],
    is_active: overrides.is_active !== undefined ? overrides.is_active : true,
    ...overrides,
  };
}

/**
 * Build a fake MedicineLog document.
 */
function mockMedicineLog(overrides = {}) {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    patient_id: overrides.patient_id || new mongoose.Types.ObjectId(),
    date: overrides.date || new Date(),
    medicines: overrides.medicines || [
      { medicine_name: 'Aspirin', scheduled_time: '08:00', taken: false, taken_at: null },
      { medicine_name: 'Metformin', scheduled_time: '20:00', taken: false, taken_at: null },
    ],
    save: overrides.save || jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

module.exports = {
  mockPatient,
  mockOrganization,
  mockCaller,
  mockMedicineLog,
};
