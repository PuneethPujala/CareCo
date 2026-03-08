const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
    {
        supabase_uid: {
            type: String,
            required: true,
            unique: true,
            index: true,
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
        city: {
            type: String,
            required: true,
            trim: true,
        },
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
        subscription: {
            status: {
                type: String,
                enum: ['active', 'inactive', 'pending_payment', 'cancelled'],
                default: 'inactive',
            },
            plan: {
                type: String,
                enum: ['free', 'basic', 'explore'],
                default: 'free',
            },
            payment_date: Date,
            next_billing: Date,
        },
        profile_complete: {
            type: Boolean,
            default: false,
        },
        paid: {
            type: Number,
            default: 0,
            enum: [0, 1]
        },
        conditions: [
            {
                name: { type: String, required: true },
                diagnosed_on: Date,
                status: {
                    type: String,
                    enum: ['active', 'managed', 'resolved'],
                    default: 'active',
                },
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
                        enum: ['morning', 'afternoon', 'night'],
                    },
                ],
                prescribed_by: String,
                instructions: String,
            },
        ],
        emergency_contact: {
            name: String,
            phone: String,
            relation: String,
        },
        expireAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
PatientSchema.index({ organization_id: 1, assigned_caller_id: 1 });
PatientSchema.index({ 'subscription.status': 1 });
PatientSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Patient', PatientSchema);
