const Product = require('../models/product');
const crudService = require('./crudService');
const jwt = require('../utils/jwt');
const imageService = require('./imageService');
const { UnauthorizedError } = require('../errors');
const uploadService = require('./uploadService');

const createProduct = async (req, data) => {
    // read the token from cookies
    const imageToken = req.cookies.imageToken;
    // check if the cookie is still there and hasn't expired
    if (!imageToken) {
        throw new UnauthorizedError('image token expired. Please, upload the image again');
    }

    // verify the image token
    const payload = await jwt.verifyToken(imageToken);
    const { url, public_id, imageId } = payload;

    // get the image from the DB
    const image = await imageService.getImage(imageId);

    // attach the data from the token to the data passed later on to the product
    data.imageUrl = url;
    data.imagePublicId = public_id;
    data.image = imageId;
    // create the product
    const newProduct = await crudService.createOne(Product)(data);

    // marking the image as used to skip CRON job of removing unused images later on
    image.isUsed = true;
    await image.save();
    return newProduct;
};

const updateProduct = async (req, productId, updateData) => {
    // read the token from cookies
    const imageToken = req.cookies.imageToken;

    // If no image token, skip image logic and just update product
    if (!imageToken) {
        // update the product
        return await crudService.updateOne(Product)(productId, updateData);
    }

    // verify the image token
    const payload = await jwt.verifyToken(imageToken);
    const { url, public_id, imageId } = payload;

    // get uploaded image from DB
    const image = await imageService.getImage(imageId);

    // get the old image before updating the product
    const product = await crudService.getOne(Product)(productId);
    const { image: oldImageId, imagePublicId: oldImagePublicId } = product;

    // update the product
    Object.assign(product, {
        ...updateData,
        imageUrl: url,
        imagePublicId: public_id,
        image: imageId,
    });

    const newProduct = await product.save();

    // marking the image as used to skip CRON job of removing unused images later on
    image.isUsed = true;
    await image.save();

    // only delete if the image has changed. (cookie not cleared due to client/network issues)
    if (oldImageId?.toString() !== imageId) {
        await imageService.deleteImage(oldImageId);
        await uploadService.removeFromCloudinary(oldImagePublicId);
    }

    return newProduct;
};

const deleteProduct = async (productId) => {
    const product = await crudService.getOne(Product)(productId);

    // delete the image from the DB
    await imageService.deleteImage(product.image);
    // delete the image from cloudinary
    await uploadService.removeFromCloudinary(product.imagePublicId);

    await product.deleteOne();
};

module.exports = {
    getAllProducts: crudService.getAll(Product),
    getProduct: crudService.getOne(Product),
    updateProduct,
    createProduct,
    deleteProduct,
};
