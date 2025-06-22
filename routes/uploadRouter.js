const express = require('express');

const { uploadImage } = require('../controllers/uploadController');
const upload = require('../middlewares/uploadMiddleware');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.route('/').post(authenticate, upload.single('image'), uploadImage);

module.exports = router;
