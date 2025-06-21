const Product = require('../models/product');
const crudService = require('./crudService');

module.exports = {
    getAllProducts: crudService.getAll(Product),
    getProduct: crudService.getOne(Product),
    updateProduct: crudService.updateOne(Product),
    createProduct: crudService.createOne(Product),
    deleteProduct: crudService.deleteOne(Product),
};
