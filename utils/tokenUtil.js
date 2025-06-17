const crypto = require('crypto');

const generateRefreshToken = async () => {
    return crypto.randomBytes(40).toString('hex');
};

const hashToken = async (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateRefreshToken, hashToken };
