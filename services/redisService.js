const redisClient = require('../utils/redisClient');

const getCachedResource = async (resourceName, key) => {
    const fullKey = `${resourceName}:${key}`; // e.g., 'user:123'
    const resource = await redisClient.get(fullKey);
    return resource ? JSON.parse(resource) : null;
};

const setCachedResource = async (resourceName, key, data, ttl = 60) => {
    const fullKey = `${resourceName}:${key}`;
    await redisClient.set(fullKey, JSON.stringify(data), { EX: ttl });
};

const invalidateCachedResource = async (resourceName, key) => {
    const fullKey = `${resourceName}:${key}`;
    await redisClient.del(fullKey);
};

module.exports = {
    getCachedResource,
    setCachedResource,
    invalidateCachedResource,
};
