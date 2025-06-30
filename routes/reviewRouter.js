const express = require('express');

const review = require('../models/review');

const authenticate = require('../middlewares/authenticate');
const checkOwnership = require('../middlewares/checkOwnership');

const {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.route('/').get(getAllReviews).post(createReview);

router.use('/:id', checkOwnership(review));
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
