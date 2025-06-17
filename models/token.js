const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    },
    { timestamps: true }
);

TokenSchema.pre('save', async function () {
    if (this.isModified('token')) {
        this.token = await bcrypt.hash(this.token, Number(process.env.SALT_ROUNDS));
    }
});

module.exports = mongoose.model('Token', TokenSchema);
