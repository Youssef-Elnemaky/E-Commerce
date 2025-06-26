const express = require('express');
const router = express.Router();

const { register, login, refresh, logout, forgotPassword } = require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh').post(refresh);
router.route('/logout').post(logout);
router.route('/forgot-password').post(forgotPassword);

module.exports = router;
