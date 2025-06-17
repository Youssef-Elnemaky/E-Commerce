const { StatusCodes } = require('http-status-codes');

const authService = require('../services/authService');
const attachTokensToCookie = require('../utils/attachTokensToCookie');

const register = async (req, res) => {
    // registering the user
    const { user, accessToken, refreshToken } = await authService.register(req);

    // attaching the tokens to cookie
    attachTokensToCookie(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const login = (req, res) => {
    res.status(StatusCodes.OK).send('login route');
};

module.exports = { register, login };
