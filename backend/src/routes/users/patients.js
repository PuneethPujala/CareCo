const express = require('express');
const mongoose = require('mongoose');
const Patient = require('../../models/Patient');
const CallLog = require('../../models/CallLog');
const MedicineLog = require('../../models/MedicineLog');
const Caller = require('../../models/Caller');
const { authenticate } = require('../../middleware/authenticate');

const router = express.Router();

// ─── Auto-Seed Demo Data ────────────────────────────
async function createDemoPatient(supabaseUid, email, name) {
    // 1. Create a demo Caller
    const orgId = new mongoose.Types.ObjectId();
    const caller = await Caller.create({
        supabase_uid: `demo_caller_${supabaseUid}`,
        name: 'Priya Sharma',
        employee_id: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
        city: 'Hyderabad',
        organization_id: orgId,
        languages_spoken: ['Hindi', 'English', 'Telugu'],
        experience_years: 3,
        phone: '+919876543210',
        email: 'priya.sharma@careco.in',
        performance: { calls_this_week: 12, adherence_rate: 94, escalations: 0 },
        is_active: true,
    });

    // 2. Create the Patient
    const patient = await Patient.create({
        supabase_uid: supabaseUid,
        name: name || email.split('@')[0],
        email,
        city: 'Hyderabad',
        organization_id: orgId,
        assigned_caller_id: caller._id,
        subscription: { status: 'active', plan: 'basic', payment_date: new Date(), next_billing: new Date(Date.now() + 30 * 86400000) },
        profile_complete: true,
        conditions: [
            { name: 'Type 2 Diabetes', diagnosed_on: new Date('2018-01-15'), status: 'active' },
            { name: 'Hypertension', diagnosed_on: new Date('2020-06-10'), status: 'managed' },
            { name: 'Osteoarthritis', diagnosed_on: new Date('2022-03-01'), status: 'active' },
        ],
        medical_history: [
            { event: 'Knee Replacement Surgery', date: new Date('2023-10-15'), notes: 'Right knee, successful recovery.' },
            { event: 'Diagnosed with Type 2 Diabetes', date: new Date('2018-01-15'), notes: 'Started on Metformin protocol.' },
            { event: 'Started BP Medication', date: new Date('2020-06-10'), notes: 'Amlodipine 5mg daily.' },
        ],
        allergies: ['Penicillin', 'Peanuts'],
        medications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'daily', times: ['morning'], prescribed_by: 'Dr. Reddy', instructions: 'Take with food' },
            { name: 'Amlodipine', dosage: '5mg', frequency: 'daily', times: ['afternoon'], prescribed_by: 'Dr. Rao', instructions: 'Take after lunch' },
            { name: 'Atorvastatin', dosage: '10mg', frequency: 'daily', times: ['night'], prescribed_by: 'Dr. Reddy', instructions: 'Take before sleep' },
        ],
        emergency_contact: { name: 'Ramesh Kumar', phone: '+919123456789', relation: 'Son' },
    });

    // Link patient to caller
    caller.patient_ids = [patient._id];
    await caller.save();

    // 3. Seed Call Logs
    const now = new Date();
    const today = new Date(now); today.setHours(10, 30, 0, 0);
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(10, 15, 0, 0);
    const twoDaysAgo = new Date(now); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); twoDaysAgo.setHours(10, 0, 0, 0);
    const threeDaysAgo = new Date(now); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); threeDaysAgo.setHours(10, 0, 0, 0);

    await CallLog.insertMany([
        { patient_id: patient._id, caller_id: caller._id, organization_id: orgId, call_date: today, call_duration_seconds: 480, status: 'completed', ai_summary: 'Patient reported feeling better. Blood pressure normal.' },
        { patient_id: patient._id, caller_id: caller._id, organization_id: orgId, call_date: yesterday, call_duration_seconds: 300, status: 'completed', ai_summary: 'Routine check-in. No issues reported.' },
        { patient_id: patient._id, caller_id: caller._id, organization_id: orgId, call_date: twoDaysAgo, call_duration_seconds: 0, status: 'missed', ai_summary: 'Call was not answered. Left a message.' },
        { patient_id: patient._id, caller_id: caller._id, organization_id: orgId, call_date: threeDaysAgo, call_duration_seconds: 0, status: 'attempted', ai_summary: 'Patient busy, requested reschedule.' },
    ]);

    // 4. Seed today's MedicineLog
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
    await MedicineLog.create({
        patient_id: patient._id,
        date: todayDate,
        medicines: [
            { medicine_name: 'Metformin', scheduled_time: 'morning', taken: false },
            { medicine_name: 'Amlodipine', scheduled_time: 'afternoon', taken: false },
            { medicine_name: 'Atorvastatin', scheduled_time: 'night', taken: false },
        ],
    });

    // 5. Seed past 6 days of MedicineLog for adherence chart
    for (let i = 1; i <= 6; i++) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        const allTaken = i % 3 !== 0; // skip every 3rd day to simulate misses
        await MedicineLog.create({
            patient_id: patient._id,
            date: d,
            medicines: [
                { medicine_name: 'Metformin', scheduled_time: 'morning', taken: allTaken, taken_at: allTaken ? d : null },
                { medicine_name: 'Amlodipine', scheduled_time: 'afternoon', taken: allTaken, taken_at: allTaken ? d : null },
                { medicine_name: 'Atorvastatin', scheduled_time: 'night', taken: i % 2 === 0, taken_at: i % 2 === 0 ? d : null },
            ],
        });
    }

    console.log(`✅ Auto-seeded demo data for patient ${email}`);
    return patient;
}

/**
 * GET /api/users/patients/me
 * Patient reads their own profile — auto-seeds demo data on first visit
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        let patient = await Patient.findOne({ supabase_uid: req.user.id });
        if (!patient) {
            // Auto-seed demo data for new users
            try {
                patient = await createDemoPatient(
                    req.user.id,
                    req.user.email,
                    req.user.user_metadata?.full_name || req.user.user_metadata?.name
                );
            } catch (seedErr) {
                console.error('Auto-seed error:', seedErr);
                return res.status(404).json({ error: 'Patient profile not found' });
            }
        }
        res.json({ patient });
    } catch (error) {
        console.error('Get patient profile error:', error);
        res.status(500).json({ error: 'Failed to get patient profile' });
    }
});

/**
 * PUT /api/users/patients/me/emergency-contact
 * Patient updates their own emergency contact (only editable personal field)
 */
router.put('/me/emergency-contact', authenticate, async (req, res) => {
    try {
        const { name, phone, relation } = req.body;
        const patient = await Patient.findOneAndUpdate(
            { supabase_uid: req.user.id },
            { emergency_contact: { name, phone, relation } },
            { new: true }
        );
        if (!patient) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }
        res.json({ patient });
    } catch (error) {
        console.error('Update emergency contact error:', error);
        res.status(500).json({ error: 'Failed to update emergency contact' });
    }
});

/**
 * GET /api/users/patients/me/caller
 * Patient gets their assigned caller's info
 */
router.get('/me/caller', authenticate, async (req, res) => {
    try {
        const patient = await Patient.findOne({ supabase_uid: req.user.id });
        if (!patient || !patient.assigned_caller_id) {
            return res.status(404).json({ error: 'No caller assigned yet' });
        }

        const caller = await Caller.findById(patient.assigned_caller_id)
            .select('name employee_id profile_photo_url languages_spoken experience_years phone city');

        if (!caller) {
            return res.status(404).json({ error: 'Assigned caller not found' });
        }

        res.json({ caller });
    } catch (error) {
        console.error('Get assigned caller error:', error);
        res.status(500).json({ error: 'Failed to get assigned caller' });
    }
});

/**
 * GET /api/users/patients/me/calls
 * Patient gets their call history — caller_notes and admin_notes are STRIPPED
 */
router.get('/me/calls', authenticate, async (req, res) => {
    try {
        const patient = await Patient.findOne({ supabase_uid: req.user.id });
        if (!patient) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }

        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const calls = await CallLog.find({ patient_id: patient._id })
            .select('-caller_notes -admin_notes') // SECURITY: strip private fields
            .sort({ call_date: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('caller_id', 'name profile_photo_url');

        const total = await CallLog.countDocuments({ patient_id: patient._id });

        res.json({
            calls,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get patient calls error:', error);
        res.status(500).json({ error: 'Failed to get call history' });
    }
});

/**
 * GET /api/users/patients/me/medications
 * Patient gets their medication schedule
 */
router.get('/me/medications', authenticate, async (req, res) => {
    try {
        const patient = await Patient.findOne({ supabase_uid: req.user.id })
            .select('medications');
        if (!patient) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }
        res.json({ medications: patient.medications });
    } catch (error) {
        console.error('Get medications error:', error);
        res.status(500).json({ error: 'Failed to get medications' });
    }
});

/**
 * POST /api/users/patients/me/flag-issue
 * Patient flags a missed call or complaint
 */
router.post('/me/flag-issue', authenticate, async (req, res) => {
    try {
        const { type, description } = req.body;
        const patient = await Patient.findOne({ supabase_uid: req.user.id });
        if (!patient) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }

        const Alert = require('../../models/Alert');
        const alert = new Alert({
            type: type || 'missed_call',
            patient_id: patient._id,
            caller_id: patient.assigned_caller_id,
            manager_id: patient.assigned_manager_id,
            organization_id: patient.organization_id,
            description,
            auto_generated: false,
        });
        await alert.save();

        res.status(201).json({ message: 'Issue flagged successfully', alert });
    } catch (error) {
        console.error('Flag issue error:', error);
        res.status(500).json({ error: 'Failed to flag issue' });
    }
});

module.exports = router;
