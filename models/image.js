const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: [true, 'image url is required'],
            unqiue: [true, 'image was already added before'],
        },
        public_id: {
            type: String,
            required: [true, 'image public_id is required'],
            unique: [true, 'image public_id was already used before'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Image', ImageSchema);
