const Product = require('../models/product');
const crudService = require('./crudService');
const jwt = require('../utils/jwt');
const imageService = require('./imageService');
const { UnauthorizedError } = require('../errors');

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

module.exports = {
    getAllProducts: crudService.getAll(Product),
    getProduct: crudService.getOne(Product),
    updateProduct: crudService.updateOne(Product),
    createProduct,
    deleteProduct: crudService.deleteOne(Product),
};
