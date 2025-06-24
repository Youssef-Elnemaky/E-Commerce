const { StatusCodes } = require('http-status-codes');

const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers(req.query);
    res.status(StatusCodes.OK).json({ status: 'success', length: users.length, users });
};

const createUser = async (req, res) => {
    const newUser = await userService.createUser(req.body);
    res.status(StatusCodes.CREATED).json({ status: 'success', user: newUser });
};

const getUser = async (req, res) => {
    const user = await userService.getUser(req.params.id);
    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const updateUser = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const deleteUser = async (req, res) => {
    const deletedUser = await userService.deleteUser(req.params.id);
    res.status(StatusCodes.NO_CONTENT).json({ status: 'success', msg: 'delete user route' });
};

const getMe = async (req, res) => {
    const user = await userService.getMe(req);
    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const updateMe = async (req, res) => {
    const user = await userService.updateMe(req, req.body);
    res.status(StatusCodes.OK).json({ status: 'success', user });
};

module.exports = { getAllUsers, createUser, getUser, updateUser, deleteUser, getMe, updateMe };
