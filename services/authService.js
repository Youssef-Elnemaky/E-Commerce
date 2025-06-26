const ms = require('ms');

const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('../utils/jwt');
const { generateRandomToken, hashToken } = require('../utils/tokenUtil');
const { UnauthenticatedError, BadRequestError, UnauthorizedError } = require('../errors');
const emailService = require('./emailService');
const userService = require('./userService');

const register = async (req) => {
    // creating a user in the database
    const user = await User.create(req.body);

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // generate the refresh token as random bytes
    const refreshToken = await generateRandomToken();
    // hash the refresh token before saving to the database
    const hashedRefreshToken = await hashToken(refreshToken);
    // saving refresh token to the database
    await Token.create({
        token: hashedRefreshToken,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        user: user._id,
        expiresAt: new Date(Date.now() + ms(process.env.RT_COOKIE_LIFETIME)),
    });

    // send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    return {
        user: { userId: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
    };
};

const login = async (req, email, password) => {
    // query the database with the passed email
    const user = await User.findOne({ email }).select('+password');

    // generic error so we don't leak that email is not stored in the database or not
    if (!user) {
        throw new UnauthenticatedError('invalid credentials');
    }

    // check the passed password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
        throw new UnauthenticatedError('invalid credentials');
    }

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // generate the refresh token as random bytes
    const refreshToken = await generateRandomToken();
    // hash the refresh token before saving to the database
    const hashedRefreshToken = await hashToken(refreshToken);
    // saving refresh token to the database
    await Token.create({
        token: hashedRefreshToken,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        user: user._id,
        expiresAt: new Date(Date.now() + ms(process.env.RT_COOKIE_LIFETIME)),
    });

    // safe guard: the user can only have N active sessions
    // get all user tokens and sort them (newest first)
    const userTokens = await Token.find({ user: user._id }).sort({ createdAt: -1 });

    const MAX_SESSIONS = Number(process.env.MAX_SESSIONS);
    // check if the number of sessions exceeded the MAX_SESSIONS value
    if (userTokens.length >= MAX_SESSIONS) {
        // slice userTokens to get the excess ones
        const excessTokens = userTokens.slice(MAX_SESSIONS);
        // remove excessTokens
        await Token.deleteMany({ _id: { $in: excessTokens.map((token) => token._id) } });
    }

    const { _id, name, role } = user;
    return { user: { _id, name, email, role }, accessToken, refreshToken };
};

const rotateRefreshToken = async (req) => {
    // read refresh token from cookies
    const refreshToken = req.signedCookies.refreshToken;

    // if refresh token expired, throw an error
    if (!refreshToken) {
        throw new UnauthenticatedError('invalid refresh token, relogin');
    }

    // hash the token before querying the database
    const hashedRefreshToken = await hashToken(refreshToken);

    // query the database for that refreshToken
    const token = await Token.findOne({ token: hashedRefreshToken });

    // if token was not found, throw an error
    if (!token || token.expiresAt < Date.now() || !token.isValid) {
        throw new UnauthenticatedError('invalid refresh token, relogin');
    }
    // // require both IP and User-Agent to change before invalidating (to reduce false positives from dynamic IPs)
    if (req.ip !== token.ip && req.get('user-agent') !== token.userAgent) {
        // invalidate the old token
        token.isValid = false;
        await token.save();
        throw new UnauthenticatedError('invalid refresh token, relogin');
    }

    // get the user from the DB
    const user = await User.findById(token.user);
    if (!user) {
        throw new UnauthenticatedError('user deleted, relogin');
    }

    // refresh token rotation (issue a new one, save it to DB, delete the old one, and a get a new access token)
    // issue a new refresh token and access token
    const newRefreshToken = await generateRandomToken();
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );
    // hash and store it to the DB
    const hashedNewRefreshToken = await hashToken(newRefreshToken);

    await Token.create({
        token: hashedNewRefreshToken,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        user: user.id,
        expiresAt: new Date(Date.now() + ms(process.env.RT_COOKIE_LIFETIME)),
    });

    // delete the old token
    await Token.findByIdAndDelete(token._id);

    return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (req) => {
    // read access token from cookies
    const accessToken = req.cookies.accessToken;

    // check if acccess token cookie hasn't expired
    if (!accessToken) {
        throw new UnauthenticatedError('invalid access token');
    }

    // verify JWT token
    const payload = await jwt.verifyToken(accessToken);

    // delete refresh token from the database
    await Token.deleteOne({ user: payload.userId });
};

const forgotPassword = async (email) => {
    const user = (await userService.getAllUsers({}, { email }))[0];
    if (!user) {
        return;
    }
    const resetToken = await generateRandomToken();
    const hashedResetToken = await hashToken(resetToken);

    user.resetToken = hashedResetToken;
    user.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_HOST}/reset-password?token=${resetToken}`;

    await emailService.sendForgotPasswordEmail(email, user.name, resetLink);
};

module.exports = { register, login, rotateRefreshToken, logout, forgotPassword };
