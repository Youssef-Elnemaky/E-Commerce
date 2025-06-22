const { StatusCodes } = require('http-status-codes');

const uploadService = require('../services/uploadService');

const uploadImage = async (req, res) => {
    // const uploadResult = await uploadService.uploadToLocal(req.file, 'upload-test');
    const uploadResult = await uploadService.uploadToCloudinary(req.file.buffer, process.env.CLOUDINARY_FOLDER_NAME);
    console.log(uploadResult);
    res.status(StatusCodes.OK).json({ status: 'success', uploadResult });
};

module.exports = { uploadImage };
