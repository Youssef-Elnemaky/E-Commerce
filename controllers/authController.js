const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');

const authService = require('../services/authService');
const attachTokensToCookie = require('../utils/attachTokensToCookie');

const register = async (req, res) => {
    // registering the user
    const { user, accessToken, refreshToken } = await authService.register(req);

    // attach tokens to cookie
    attachTokensToCookie(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    // check if both email & password are passed or not
    if (!email || !password) {
        throw new BadRequestError('email & password are required');
    }

    // logging in the user
    const { user, accessToken, refreshToken } = await authService.login(req, email, password);

    // attach tokens to cookie
    attachTokensToCookie(res, accessToken, refreshToken);

    user.password = undefined;
    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const refresh = async (req, res) => {
    const { accessToken, refreshToken } = await authService.rotateRefreshToken(req);

    // attach tokens to cookie
    attachTokensToCookie(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', msg: 'refreshed the token' });
};

module.exports = { register, login, refresh };
