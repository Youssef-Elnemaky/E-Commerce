const express = require('express');
const authenticate = require('../middlewares/authenticate');
const restrictTo = require('../middlewares/restrictTo');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authenticate, restrictTo('admin'));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
