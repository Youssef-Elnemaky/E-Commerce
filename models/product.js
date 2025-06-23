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
        ratingAvg: {
            type: Number,
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
    },
    { timestamps: true }
);

ProductSchema.pre('save', function () {
    this.slug = slugify(this.name);
});

module.exports = mongoose.model('Product', ProductSchema);
