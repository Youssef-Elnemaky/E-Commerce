const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            maxLength: [100, 'name cannot exceed 100 characters'],
            minLength: [3, 'name must be at least 3 characters'],
            required: [true, 'name is required'],
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, 'description cannot exceed 100 characters'],
            minLength: [3, 'description must be at least 3 characters'],
            required: [true, 'description is required'],
        },
        price: {
            type: Number,
            required: [true, 'price is required'],
        },
        slug: {
            type: String,
        },
        ratingsAvg: {
            type: Number,
            default: 0,
            set: (v) => Math.round(v * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        stockQuantity: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image',
        },
        imageUrl: String,
        imagePublicId: String,
        tags: [String],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false }
);

ProductSchema.pre('save', function () {
    this.slug = slugify(this.name);
});

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
});

module.exports = mongoose.model('Product', ProductSchema);
