const Product = require('../models/product');
const crudService = require('./crudService');
const jwt = require('../utils/jwt');
const imageService = require('./imageService');
const uploadService = require('./uploadService');

const createProduct = async (data, imageToken) => {
    // verify the image token
    const payload = await jwt.verifyToken(imageToken);
    const { url, public_id, imageId } = payload;

    // get the image from the DB
    const image = await imageService.getImage(imageId);

    // attach the data from the token to the data passed later on to the product
    data.imageUrl = url;
    data.imagePublicId = public_id;
    data.image = imageId;

    const newProduct = await crudService.createOne(Product)(data);

    // marking the image as used to skip CRON job of removing unused images later on
    image.isUsed = true;
    await image.save();
    return newProduct;
};

const updateProduct = async (productId, updateData, imageToken) => {
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

    // delete reviews from the DB
    const reviewService = require('./reviewService'); // only require here to fix circular require
    await reviewService.deleteReviewsOnProduct(productId);
    await product.deleteOne();
};

const getProduct = async (productId) => {
    const populate = [
        {
            path: 'reviews',
            select: '-__v -updatedAt -_id', // all excluded
            options: { limit: 20, sort: { createdAt: -1 } },
            populate: {
                path: 'createdBy', // this is the field inside Review
                select: 'name',
            },
        },
    ];
    const product = await crudService.getOne(Product)(productId, populate);
    return product;
};

module.exports = {
    getAllProducts: crudService.getAll(Product),
    getProduct,
    updateProduct,
    createProduct,
    deleteProduct,
};
