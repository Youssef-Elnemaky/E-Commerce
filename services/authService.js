const ms = require('ms');

const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('../utils/jwt');
const { generateRefreshToken, hashToken } = require('../utils/tokenUtil');
const { UnauthenticatedError, BadRequestError, UnauthorizedError } = require('../errors');

const register = async (req) => {
    // creating a user in the database
    const user = await User.create(req.body);

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // generate the refresh token as random bytes
    const refreshToken = await generateRefreshToken();
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

    return { user, accessToken, refreshToken };
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
        { name: user.name, userId: user._id },
        ms(process.env.ACCESS_TOKEN_LIFETIME) / 1000
    );

    // generate the refresh token as random bytes
    const refreshToken = await generateRefreshToken();
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

    return { user, accessToken, refreshToken };
};

const rotateRefreshToken = async (req) => {
    // read refresh token from cookies
    const refreshToken = req.signedCookies.refreshToken;

    // if refresh token expired, throw an error
    if (!refreshToken) {
        throw new UnauthenticatedError('1 expired/invalid refresh token, relogin');
    }

    // hash the token before querying the database
    const hashedRefreshToken = await hashToken(refreshToken);

    // query the database for that refreshToken
    const token = await Token.findOne({ token: hashedRefreshToken });

    // if token was not found, throw an error
    if (!token || token.expiresAt < Date.now() || !token.isValid) {
        throw new UnauthorizedError('invalid refresh token, relogin');
    }
    // check if the ip and also the user-agent changed (as user might be using dynamic ip provided from their ISP we use AND)
    if (req.ip !== token.ip && req.get('user-agent') !== token.userAgent) {
        // invalidate the old token
        token.isValid = false;
        await token.save();
        throw new UnauthorizedError('invalid refresh token, relogin');
    }
    // refresh token rotation (issue a new one, save it to DB, delete the old one, and a get a new access token)

    // get the user from the DB
    const user = await User.findById(token.user);
    if (!user) {
        throw UnauthorizedError('user deleted, relogin');
    }

    // issue a new refresh token and access token
    const newRefreshToken = await generateRefreshToken();
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id },
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

module.exports = { register, login, rotateRefreshToken };
