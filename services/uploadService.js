const fs = require('fs/promises');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const slugify = require('slugify');
const crypto = require('crypto');
const imageService = require('./imageService');

exports.uploadToCloudinary = (buffer, folder = 'uploads') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder }, async (error, result) => {
                if (error) return reject(error);
                try {
                    const { secure_url: url, public_id } = result;
                    const image = await imageService.createImage({ url, public_id });
                    resolve({ url, public_id, imageId: image._id });
                } catch (err) {
                    reject(err);
                }
            })
            .end(buffer);
    });
};

exports.uploadToLocal = async (file, destinationFolder = 'uploads') => {
    const cleanName = slugify(file.originalname, { lower: true, strict: true });

    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${cleanName}`;
    const targetPath = path.join(__dirname, '..', 'public', destinationFolder, filename);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, file.buffer); // file.buffer from multer.memoryStorage()

    return {
        url: `/public/${destinationFolder}/${filename}`,
        filename,
        path: targetPath,
    };
};

exports.removeFromClouidnary = async (public_id) => {
    await cloudinary.uploader.destroy(public_id);
};
