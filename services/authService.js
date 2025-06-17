const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('../utils/jwt');
const { generateRefreshToken, hashToken } = require('../utils/tokenUtil');
const { UnauthenticatedError } = require('../errors');

const register = async (req) => {
    // creating a user in the database
    const user = await User.create(req.body);

    // access token and refresh token generation
    const accessToken = await jwt.generateToken(
        { name: user.name, userId: user._id },
        process.env.ACCESS_TOKEN_LIFETIME
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
        process.env.ACCESS_TOKEN_LIFETIME
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
    });

    return { user, accessToken, refreshToken };
};

module.exports = { register, login };
