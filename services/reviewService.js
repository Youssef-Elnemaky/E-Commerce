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

const createReview = async (data) => {
    const review = await crudService.createOne(Review)(data);
    const { ratingsQuantity, ratingsAvg } = (await Review.calcAvgRating(review.product._id))[0];
    await productService.updateProduct(review.product._id, { ratingsQuantity, ratingsAvg });
    return review;
};

const updateReview = async (review, updateData) => {
    // update review
    review.set(updateData);
    const ratingChanged = review.isModified('rating');
    await review.save();

    // update ratings on product only if rating was changed
    if (ratingChanged) {
        const { ratingsQuantity, ratingsAvg } = (await Review.calcAvgRating(review.product._id))[0];
        await productService.updateProduct(review.product._id, { ratingsQuantity, ratingsAvg });
    }
    return review;
};

const deleteReview = async (review) => {
    const deletedReview = await review.deleteOne();
    const { ratingsQuantity, ratingsAvg } = (await Review.calcAvgRating(review.product._id))[0];
    await productService.updateProduct(review.product._id, { ratingsQuantity, ratingsAvg });
    return deletedReview;
};

const deleteReviewsOnProduct = async (productId) => {
    console.log('i am here');
    const deletedReviews = await Review.deleteMany({ product: productId });
    return deletedReviews;
};

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    deleteReviewsOnProduct,
};
