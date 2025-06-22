const fs = require('fs/promises');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const slugify = require('slugify');
const crypto = require('crypto');

exports.uploadToCloudinary = (buffer, folder = 'uploads') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder }, (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
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
