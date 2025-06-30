const Review = require('../models/review');
const crudService = require('./crudService');
const productService = require('./productService');

const getAllReviews = async (user, queryParams = {}, customFilter = {}) => {
    const populate = [
        { path: 'product', select: 'name imageUrl' },
        { path: 'createdBy', select: 'name' },
    ];

    // admin can get all reviews, user can get only their reviews
    if (user.userRole !== 'admin') {
        queryParams.createdBy = user.userId;
    }

    const reviews = await crudService.getAll(Review)(queryParams, customFilter, populate);
    return reviews;
};

const getReview = async (reviewId) => {
    const populate = [
        { path: 'createdBy', select: 'name' },
        { path: 'product', select: 'name imageUrl' },
    ];

    const review = crudService.getOne(Review)(reviewId, populate);
    return review;
};

const updateReview = async (review, updateData) => {
    review.set(updateData);
    await review.save();
    return review;
};

const deleteReview = async (review) => {
    const deletedReview = await review.deleteOne();
    return deletedReview;
};

module.exports = {
    getAllReviews,
    getReview,
    createReview: crudService.createOne(Review),
    updateReview,
    deleteReview,
};
