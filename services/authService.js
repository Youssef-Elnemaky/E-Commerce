const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('../utils/jwt');
const { generateRefreshToken, hashToken } = require('../utils/tokenUtil');

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

module.exports = { register };
