const express = require('express');
const router = express.Router();

const { register, login, refresh, logout, forgotPassword, resetPassword } = require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh').post(refresh);
router.route('/logout').post(logout);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

module.exports = router;
