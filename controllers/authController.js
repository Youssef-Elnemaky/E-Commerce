const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const authService = require('../services/authService');
const attachToCookie = require('../utils/attachToCookie');

const register = async (req, res) => {
    // registering the user
    const { name, email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('user-agent');
    const { user, accessToken, refreshToken } = await authService.register(name, email, password, ip, userAgent);

    // attach tokens to cookie
    attachToCookie.attachTokens(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    // check if both email & password are passed or not
    if (!email || !password) {
        throw new BadRequestError('email & password are required');
    }

    // logging in the user
    const { user, accessToken, refreshToken } = await authService.login(email, password, ip, userAgent);

    // attach tokens to cookie
    attachToCookie.attachTokens(res, accessToken, refreshToken);

    user.password = undefined;
    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const refresh = async (req, res) => {
    // read refresh token from cookies
    const currentRefreshToken = req.signedCookies.refreshToken;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    // if refresh token expired, throw an error
    if (!currentRefreshToken) {
        throw new UnauthenticatedError('invalid refresh token, relogin');
    }

    const { accessToken, refreshToken } = await authService.rotateRefreshToken(currentRefreshToken, ip, userAgent);

    // attach tokens to cookie
    attachToCookie.attachTokens(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', msg: 'refreshed the token' });
};

const logout = async (req, res) => {
    // read refresh token from cookies
    const refreshToken = req.signedCookies.refreshToken;

    // check if refreshToken token cookie hasn't expired
    if (!refreshToken) {
        throw new UnauthenticatedError('invalid refresh token');
    }

    // call authService to logout by deleting the refresh token from the database.
    await authService.logout(refreshToken);

    // remove accessToken cookie
    res.cookie('accessToken', 'logout', {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: 0,
    });

    // remove refreshToken cookie
    res.cookie('refreshToken', 'logout', {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: 0,
        signed: true,
    });

    res.status(StatusCodes.OK).json({ status: 'success', msg: 'logged out successfully' });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new BadRequestError('email must be provided');
    }

    await authService.forgotPassword(email);
    res.status(StatusCodes.OK).json({ status: 'success', msg: 'a reset password email was sent' });
};

const resetPassword = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        throw new BadRequestError('token was not passed');
    }
    const newPassword = req.body.newPassword;
    if (!newPassword) {
        throw new BadRequestError('new password was not passed');
    }
    const ip = req.ip;
    const userAgent = req.get('user-agent');
    const { user, accessToken, refreshToken } = await authService.resetPassword(token, ip, userAgent, newPassword);

    // attach tokens to cookie
    attachToCookie.attachTokens(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', user });
};

const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    if (!currentPassword || !newPassword) {
        throw new BadRequestError('both current password and new password are required');
    }

    const { user, accessToken, refreshToken } = await authService.updatePassword(
        userId,
        ip,
        userAgent,
        currentPassword,
        newPassword
    );

    // attach tokens to cookie
    attachToCookie.attachTokens(res, accessToken, refreshToken);

    res.status(StatusCodes.OK).json({ status: 'success', user });
};
module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, updatePassword };
