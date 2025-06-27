const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'name is required'],
            maxLength: [30, 'name cannot exceed 30 characters'],
            minLength: [5, 'name must be at least 5 characters'],
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'email is required'],
            validate: {
                validator: validator.isEmail,
                message: 'Please provide a valid email address',
            },
        },
        password: {
            type: String,
            required: [true, 'password is required'],
            minlength: [8, 'password must be at least 8 characters'],
            maxlength: [64, 'password cannot exceed 64 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'role can either be user or admin',
            },
            default: 'user',
        },
        resetToken: {
            type: String,
            select: false,
        },
        resetTokenExpiresAt: {
            type: Date,
            select: false,
        },
        tokenVersion: {
            type: Number,
            default: 0,
            select: false,
        },
    },
    // options
    { timestamps: true }
);

UserSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, Number(process.env.SALT_ROUNDS));
    }
});

UserSchema.methods.checkPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
