const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');

const reviewService = require('../services/reviewService');
const filterRequestBody = require('../utils/filterRequestBody');

const getAllReviews = async (req, res) => {
    const user = req.user;

    // check if a user was passed in query
    if (req.query.createdBy) throw new BadRequestError('createdBy should not passed as a query');

    let filter = {};
    if (req.params.productId) {
        filter = { product: req.params.productId };
    }
    const reviews = await reviewService.getAllReviews(user, req.query, filter);

    res.status(StatusCodes.OK).json({ status: 'success', reviews, length: reviews.length });
};

const getReview = async (req, res) => {
    const review = await reviewService.getReview(req.params.id);
    res.status(StatusCodes.OK).json({ status: 'success', review });
};

const createReview = async (req, res) => {
    const reviewData = req.body;
    reviewData.createdBy = req.user.userId; // attach user id or overwrite it if it exists
    reviewData.product = req.params.productId || req.body.product;

    const review = await reviewService.createReview(reviewData);
    res.status(StatusCodes.CREATED).json({ status: 'success', review });
};

const updateReview = async (req, res) => {
    // get review from checkOwnership middleware
    const review = req.resource;

    // overwrite passed values as createdBy and product shouldn't change
    const updateData = {
        ...req.body,
        createdBy: review.createdBy,
        product: review.product,
    };

    const updatedReview = await reviewService.updateReview(review, updateData);

    res.status(StatusCodes.OK).json({ status: 'success', updatedReview });
};

const deleteReview = async (req, res) => {
    // get review from checkOwnership middleware
    const review = req.resource;
    await reviewService.deleteReview(review);
    res.status(StatusCodes.NO_CONTENT).json({ status: 'success', msg: 'review deleted' });
};

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
};
