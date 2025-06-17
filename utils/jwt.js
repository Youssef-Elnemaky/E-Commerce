const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signJwt = promisify(jwt.sign);
const verifyJwt = promisify(jwt.verify);

const generateToken = async (payload, lifeTime) => {
    const token = await signJwt(payload, process.env.JWT_SECRET, { expiresIn: lifeTime });
    return token;
};

module.exports = { generateToken };
