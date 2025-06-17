const CustomAPIError = require('./custom-api');
const UnauthenticatedError = require('./unauthenticated');
const NotFoundError = require('./not-found');
const BadRequestError = require('./bad-request');
const UnauthroizedError = require('./unauthroized');

module.exports = {
    CustomAPIError,
    UnauthenticatedError,
    NotFoundError,
    BadRequestError,
    UnauthroizedError,
};
