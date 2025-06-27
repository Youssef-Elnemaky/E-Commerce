const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

const {
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh').post(refresh);
router.route('/logout').post(logout);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

router.use(authenticate);
router.route('/update-password').post(updatePassword);

module.exports = router;
