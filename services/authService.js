const ms = require('ms');

const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('../utils/jwt');
const { generateRandomToken, hashToken } = require('../utils/tokenUtil');
const { UnauthenticatedError, BadRequestError, UnauthorizedError } = require('../errors');
const emailService = require('./emailService');
const userService = require('./userService');

const register = async (name, email, password, ip, userAgent) => {
    // creating a user in the database
    const user = await userService.createUser({ name, email, password });

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role, tokenVersion: 0 },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // generate the refresh token as random bytes
    const refreshToken = await generateRandomToken();
    // hash the refresh token before saving to the database
    const hashedRefreshToken = await hashToken(refreshToken);
    // saving refresh token to the database
    await Token.create({
        token: hashedRefreshToken,
        ip,
        userAgent,
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

const login = async (email, password, ip, userAgent) => {
    // query the database with the passed email
    const user = await userService.getUserAndSelect({ email }, '+password +tokenVersion');

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
        { name: user.name, userId: user._id, userRole: user.role, tokenVersion: user.tokenVersion },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // generate the refresh token as random bytes
    const refreshToken = await generateRandomToken();
    // hash the refresh token before saving to the database
    const hashedRefreshToken = await hashToken(refreshToken);
    // saving refresh token to the database
    await Token.create({
        token: hashedRefreshToken,
        ip,
        userAgent,
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

const rotateRefreshToken = async (refreshToken, ip, userAgent) => {
    // hash the token before querying the database
    const hashedRefreshToken = await hashToken(refreshToken);

    // query the database for that refreshToken
    const token = await Token.findOne({ token: hashedRefreshToken });

    // if token was not found, throw an error
    if (!token || token.expiresAt < Date.now() || !token.isValid) {
        throw new UnauthenticatedError('invalid refresh token, relogin');
    }
    // // require both IP and User-Agent to change before invalidating (to reduce false positives from dynamic IPs)
    if (ip !== token.ip && userAgent !== token.userAgent) {
        // invalidate the old token
        token.isValid = false;
        await token.save();
        throw new UnauthenticatedError('invalid refresh token, relogin');
    }

    // get the user from the DB
    const user = await userService.getUserAndSelect({ _id: token.user }, '+tokenVersion');
    if (!user) {
        throw new UnauthenticatedError('user deleted, relogin');
    }

    // refresh token rotation (issue a new one, save it to DB, delete the old one, and a get a new access token)
    // issue a new refresh token and access token
    const newRefreshToken = await generateRandomToken();
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role, tokenVersion: user.tokenVersion },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );
    // hash and store it to the DB
    const hashedNewRefreshToken = await hashToken(newRefreshToken);

    await Token.create({
        token: hashedNewRefreshToken,
        ip,
        userAgent,
        user: user.id,
        expiresAt: new Date(Date.now() + ms(process.env.RT_COOKIE_LIFETIME)),
    });

    // delete the old token
    await Token.findByIdAndDelete(token._id);

    return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (refreshToken) => {
    const hashedRefreshToken = await hashToken(refreshToken);

    // delete refresh token from the database
    await Token.deleteOne({ token: hashedRefreshToken });
};

const forgotPassword = async (email) => {
    const user = (await userService.getAllUsers({}, { email }))[0];
    if (!user) {
        return;
    }
    const resetToken = await generateRandomToken();
    const hashedResetToken = await hashToken(resetToken);

    user.resetToken = hashedResetToken;
    user.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000; // after 10 minutes
    await user.save();

    const resetLink = `${process.env.FRONTEND_HOST}/reset-password?token=${resetToken}`;

    await emailService.sendForgotPasswordEmail(email, user.name, resetLink);
};

const resetPassword = async (token, ip, userAgent, newPassword) => {
    // hash the token
    const hashedToken = await hashToken(token);
    // get the user from the DB.
    const user = await userService.getUserAndSelect({ resetToken: hashedToken }, (select = '+tokenVersion'));

    // check if the user exists (valid token)
    if (!user) throw new BadRequestError('invalid reset token');
    // check if the token hasn't expired
    if (user.resetTokenExpiresAt < Date.now()) throw new BadRequestError('expired reset token');

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role, tokenVersion: user.tokenVersion + 1 },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // remove all refresh tokens related to that user from the DB
    await Token.deleteMany({ user: user.id });

    // generate new refresh token as random bytes
    const refreshToken = await generateRandomToken();
    // hash the refresh token before saving to the database
    const hashedRefreshToken = await hashToken(refreshToken);
    // saving refresh token to the database
    await Token.create({
        token: hashedRefreshToken,
        ip,
        userAgent,
        user: user._id,
        expiresAt: new Date(Date.now() + ms(process.env.RT_COOKIE_LIFETIME)),
    });

    // updating the user password
    user.password = newPassword;
    // making sure that the reset token cannot be used again
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    // update tokenVersion
    console.log(`tokenVersion is ${user.tokenVersion}`);
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();

    const { _id, name, email, role } = user;
    return { user: { _id, name, email, role }, accessToken, refreshToken };
};

const updatePassword = async (userId, ip, userAgent, currentPassword, newPassword) => {
    const user = await userService.getUserAndSelect({ _id: userId }, '+password +tokenVersion');

    const isPasswordCorrect = await user.checkPassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('invalid credentials');
    }

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id, userRole: user.role, tokenVersion: user.tokenVersion + 1 },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // remove all refresh tokens related to that user from the DB
    await Token.deleteMany({ user: user.id });

    // generate new refresh token as random bytes
    const refreshToken = await generateRandomToken();
    // hash the refresh token before saving to the database
    const hashedRefreshToken = await hashToken(refreshToken);
    // saving refresh token to the database
    await Token.create({
        token: hashedRefreshToken,
        ip,
        userAgent,
        user: user._id,
        expiresAt: new Date(Date.now() + ms(process.env.RT_COOKIE_LIFETIME)),
    });

    // updating the user password
    user.password = newPassword;
    // making sure that the reset token cannot be used again
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    // update token version
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();
    const { _id, name, email, role } = user;
    return { user: { _id, name, email, role }, accessToken, refreshToken };
};

module.exports = { register, login, rotateRefreshToken, logout, forgotPassword, resetPassword, updatePassword };
