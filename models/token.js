const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, 'token is required'],
        },
        ip: {
            type: String,
            required: [true, 'ip is required'],
        },
        userAgent: {
            type: String,
            required: [true, 'user-agent is required'],
        },
        isValid: {
            type: Boolean,
            default: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user is required'],
        },
        expiresAt: {
            type: Date,
            required: [true, 'expires at is required'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Token', TokenSchema);
