const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
    {
        // ── Core Identity ─────────────────────────────
        supabase_uid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        profile_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            index: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        date_of_birth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        },
        avatar_url: {
            type: String,
        },
        profile_complete: {
            type: Boolean,
            default: false,
        },

        // ── Location ──────────────────────────────────
        city: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        address: {
            street: { type: String, trim: true },
            state: { type: String, trim: true },
            postcode: { type: String, trim: true },
            country: { type: String, trim: true, default: 'UK' },
        },

        // ── Relationships ─────────────────────────────
        organization_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        assigned_caller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Caller',
            index: true,
        },
        assigned_manager_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            index: true,
        },
        assigned_at: {
            type: Date, // when the current caller was assigned
        },
        previous_callers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Caller',
            },
        ],

        // ── Scheduling / Time Slots ───────────────────
        timezone: {
            type: String,
            default: 'Europe/London',
        },
        preferred_call_times: [
            {
                day_of_week: {
                    type: String,
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    required: true,
                },
                start_time: { type: String, required: true }, // "HH:MM" 24hr
                end_time: { type: String, required: true },
                slot_type: {
                    type: String,
                    enum: ['call', 'visit', 'checkin'],
                    default: 'call',
                },
                is_active: { type: Boolean, default: true },
                notes: { type: String },
            },
        ],
        last_called_at: { type: Date },
        next_call_scheduled: { type: Date },
        call_frequency_days: { type: Number, default: 7 },

        // ── Subscription / Billing ────────────────────
        subscription: {
            status: {
                type: String,
                enum: ['active', 'pending_payment', 'cancelled', 'expired'],
                default: 'pending_payment',
            },
            plan: {
                type: String,
                enum: ['basic', 'premium', 'explore'],
                default: 'basic',
            },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'GBP' },
            payment_date: Date,
            started_at: Date,
            expires_at: Date,
            next_billing: Date,
            stripe_customer_id: { type: String },
            stripe_subscription_id: { type: String },
        },
        paid: {
            type: Number,
            default: 0,
            enum: [0, 1],
        },

        // ── Medical Data ──────────────────────────────
        conditions: [
            {
                name: { type: String, required: true },
                diagnosed_on: Date,
                status: {
                    type: String,
                    enum: ['active', 'managed', 'resolved'],
                    default: 'active',
                },
                notes: { type: String },
            },
        ],
        medical_history: [
            {
                event: { type: String, required: true },
                date: Date,
                notes: String,
            },
        ],
        allergies: [String],
        medications: [
            {
                name: { type: String, required: true },
                dosage: String,
                frequency: String,
                times: [
                    {
                        type: String,
                        enum: ['morning', 'afternoon', 'evening', 'night', 'as_needed'],
                    },
                ],
                start_date: { type: Date },
                end_date: { type: Date },   // null = ongoing
                is_active: { type: Boolean, default: true },
                refill_due: { type: Date },
                prescribed_by: String,
                instructions: String,
            },
        ],
        trusted_contacts: [
            {
                name: String,
                phone: String,
                relation: String,
                email: String,
                is_primary: { type: Boolean, default: false },
                can_view_data: { type: Boolean, default: false },
                permissions: [String], // e.g. ['medications', 'mood', 'bp']
            },
        ],
        care_instructions: {
            type: String,
            trim: true,
        },
        gp_name: { type: String, trim: true },
        gp_phone: { type: String, trim: true },
        blood_type: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
            default: 'unknown',
        },
        mobility_level: {
            type: String,
            enum: ['full', 'limited', 'wheelchair', 'bedridden'],
            default: 'full',
        },

        // ── Notes & Flags ─────────────────────────────
        notes: { type: String },
        risk_level: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
            index: true,
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true,
        },
        deactivated_at: { type: Date },
        deactivated_reason: { type: String },

        // ── TTL / Cleanup ─────────────────────────────
        // Auto-deletes incomplete/unpaid patients after 24h
        expireAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes ───────────────────────────────────────
PatientSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });           // TTL
PatientSchema.index({ organization_id: 1, is_active: 1 });
PatientSchema.index({ organization_id: 1, assigned_caller_id: 1 });
PatientSchema.index({ assigned_caller_id: 1, next_call_scheduled: 1 });
PatientSchema.index({ city: 1, assigned_caller_id: 1 });
PatientSchema.index({ risk_level: 1, is_active: 1 });
PatientSchema.index({ 'subscription.status': 1 });
PatientSchema.index({ 'subscription.status': 1, 'subscription.expires_at': 1 });

// ── Middleware ────────────────────────────────────
// Clear TTL once patient has paid and completed profile
PatientSchema.pre('save', function (next) {
    if (this.paid === 1 && this.profile_complete) {
        this.expireAt = undefined;
    }
    next();
});

// ── Virtuals ──────────────────────────────────────
PatientSchema.virtual('age').get(function () {
    if (!this.date_of_birth) return null;
    const diff = Date.now() - this.date_of_birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

PatientSchema.virtual('active_medications').get(function () {
    return this.medications.filter((m) => m.is_active);
});

module.exports = mongoose.model('Patient', PatientSchema);