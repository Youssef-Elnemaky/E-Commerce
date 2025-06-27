const User = require('../models/user');
const crudService = require('../services/crudService');
const { UnauthenticatedError, BadRequestError, NotFoundError } = require('../errors');

const getMe = async (req) => {
    const userId = req.user.userId;
    const user = await crudService.getOne(User)(userId);
    return user;
};

const updateMe = async (req, updateData) => {
    if (updateData.role || updateData.password) {
        throw new BadRequestError('this route is not for password or role updates');
    }

    const userId = req.user.userId;
    const user = await crudService.updateOne(User)(userId, updateData);
    return user;
};

const getUserWithPassword = async (userId) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError(`user with id: ${userId} not found`);
    return user;
};

module.exports = {
    getAllUsers: crudService.getAll(User),
    createUser: crudService.createOne(User),
    getUser: crudService.getOne(User),
    updateUser: crudService.updateOne(User),
    deleteUser: crudService.deleteOne(User),
    getUserWithPassword,
    getMe,
    updateMe,
};
