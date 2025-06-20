const { UnauthenticatedError } = require('../errors');
const jwt = require('../utils/jwt');

const authenticate = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        throw new UnauthenticatedError('no access token passed');
    }

    const payload = await jwt.verifyToken(accessToken);

    req.user = { name: payload.name, userId: payload.userId };
    next();
};

module.exports = authenticate;
