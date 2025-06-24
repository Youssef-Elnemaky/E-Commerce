const User = require('../models/user');
const crudService = require('../services/crudService');

module.exports = {
    getAllUsers: crudService.getAll(User),
    createUser: crudService.createOne(User),
    getUser: crudService.getOne(User),
    updateUser: crudService.updateOne(User),
    deleteUser: crudService.deleteOne(User),
};
