const { StatusCodes } = require('http-status-codes');
const ms = require('ms');

const uploadService = require('../services/uploadService');
const attachToCookie = require('../utils/attachToCookie');
const jwt = require('../utils/jwt');
const imageService = require('../services/imageService');

const uploadImage = async (req, res) => {
    // local storage example
    // const uploadResult = await uploadService.uploadToLocal(req.file, 'upload-test');

    // cloudinary storage (cloud)
    const uploadResult = await uploadService.uploadToCloudinary(req.file.buffer, process.env.CLOUDINARY_FOLDER_NAME);

    // attaching userId to createdBy
    uploadResult.createdBy = req.user.userId;

    // signing the results with JWT
    const uploadResultToken = await jwt.generateToken(uploadResult, ms(process.env.TEMP_IMAGE_TOKEN_LIFETIME) / 1000);
    // attaching upload result token to a cookie
    attachToCookie.attachSingle(res, uploadResultToken, 'imageToken');

    // tracking the image in the DB
    imageService.createImage(uploadResult);

    res.status(StatusCodes.OK).json({ status: 'success', msg: 'image uploaded' });
};

module.exports = { uploadImage };
