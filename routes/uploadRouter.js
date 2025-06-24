const express = require('express');

const { uploadImage } = require('../controllers/uploadController');
const upload = require('../middlewares/uploadMiddleware');
const authenticate = require('../middlewares/authenticate');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.route('/').post(authenticate, restrictTo('admin'), upload.single('image'), uploadImage);

module.exports = router;
