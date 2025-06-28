const ms = require('ms');

const { UnauthenticatedError } = require('../errors');
const jwt = require('../utils/jwt');
const redisService = require('../services/redisService');
const userService = require('../services/userService');

const authenticate = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        throw new UnauthenticatedError('no access token passed');
    }

    const payload = await jwt.verifyToken(accessToken);

    // checking if the user has changed the password after the token was issued
    // check the cached user
    let tokenVersion = await redisService.getCachedResource('tokenVersion', payload.userId);
    // not hit, Read it from the DB
    if (!tokenVersion) {
        const user = await userService.getUserAndSelect({ _id: payload.userId }, 'tokenVersion');
        tokenVersion = user.tokenVersion;
        // no hit, user was deleted
        if (!user) {
            throw new UnauthenticatedError('user was deleted, register again');
        }
        // cache the tokenVersion
        await redisService.setCachedResource(
            'tokenVersion',
            payload.userId,
            tokenVersion,
            ms(process.env.AT_COOKIE_LIFETIME) / 1000
        );
    }

    if (payload.tokenVersion !== tokenVersion) {
        throw new UnauthenticatedError('password was changed after the token was issued, re-login');
    }

    req.user = { name: payload.name, userId: payload.userId, userRole: payload.userRole };
    next();
};

module.exports = authenticate;
