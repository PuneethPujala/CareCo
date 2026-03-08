const mongoose = require('mongoose');

const PasswordResetOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL: auto-delete when expired
    },
}, {
    timestamps: { createdAt: 'created_at' },
});

module.exports = mongoose.model('PasswordResetOtp', PasswordResetOtpSchema);
