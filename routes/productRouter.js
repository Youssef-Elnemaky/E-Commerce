const express = require('express');
const authenticate = require('../middlewares/authenticate');
const restrictTo = require('../middlewares/restrictTo');
const reviewRouter = require('./reviewRouter');

const {
    getAllProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

router
    .route('/')
    .get(getAllProducts)
    .post([authenticate, restrictTo('admin'), createProduct]);

router.use('/:productId/reviews', reviewRouter); // handle nested routes

router
    .route('/:id')
    .get(getProduct)
    .patch([authenticate, restrictTo('admin'), updateProduct])
    .delete([authenticate, restrictTo('admin'), deleteProduct]);

module.exports = router;
