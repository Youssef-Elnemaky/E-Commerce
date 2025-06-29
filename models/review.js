const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            minlength: [3, 'review must be at least 8 characters'],
            maxlength: [500, 'review cannot exceed 64 characters'],
            required: [true, 'review is required'],
        },
        rating: {
            type: Number,
            required: [true, 'review rating is required'],
            min: [1, 'review must be at least 1'],
            max: [5, 'review cannot exceed 5'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'review must belong to a user'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'review must belong to a product'],
        },
    },
    { timestamps: true }
);

//use it later to make sure that only 1 user can post 1 review per product
// ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
