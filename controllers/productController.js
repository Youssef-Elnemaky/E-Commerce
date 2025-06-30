const { StatusCodes } = require('http-status-codes');
const productService = require('../services/productService');
const { UnauthorizedError } = require('../errors');

exports.getAllProducts = async (req, res) => {
    const products = await productService.getAllProducts(req.query);
    res.status(StatusCodes.OK).json({ status: 'success', length: products.length, products });
};

exports.getProduct = async (req, res) => {
    const productId = req.params.id;
    const product = await productService.getProduct(productId);
    res.status(StatusCodes.OK).json({ status: 'success', product });
};

exports.createProduct = async (req, res) => {
    // read the token from cookies
    const imageToken = req.cookies.imageToken;
    // check if the cookie is still there and hasn't expired
    if (!imageToken) {
        throw new UnauthorizedError('image token expired. Please, upload the image again');
    }
    // overwrite createdBy
    req.body.createdBy = req.user.userId;
    const product = await productService.createProduct(req.body, imageToken);
    res.clearCookie('imageToken'); // clear the cookie after a successful creation
    res.status(StatusCodes.CREATED).json({ status: 'success', product });
};

exports.updateProduct = async (req, res) => {
    // read the token from cookies
    const imageToken = req.cookies.imageToken;
    // overwrite createdBy if it was changed
    req.body.createdBy = req.user.userId;
    const updatedProduct = await productService.updateProduct(req.params.id, req.body, imageToken);
    res.clearCookie('imageToken'); // clear the cookie after a successful update
    res.status(StatusCodes.OK).json({ status: 'success', updatedProduct });
};

exports.deleteProduct = async (req, res) => {
    await productService.deleteProduct(req.params.id);
    res.status(StatusCodes.NO_CONTENT).json({ status: 'success', msg: 'product deleted' });
};
