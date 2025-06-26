const crypto = require('crypto');

const generateRandomToken = async () => {
    return crypto.randomBytes(40).toString('hex');
};

const hashToken = async (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateRandomToken, hashToken };
