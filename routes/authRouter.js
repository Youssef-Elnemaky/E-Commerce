const express = require('express');
const router = express.Router();

const { register, login, refresh } = require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh').post(refresh);

module.exports = router;
