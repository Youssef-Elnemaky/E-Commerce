const { NotFoundError, UnauthorizedError } = require('../errors');

const restrictTo = (...allowedRoles) => {
    return async (req, res, next) => {
        // check if the user's role is allowed
        if (!allowedRoles.includes(req.user.userRole)) {
            throw new UnauthorizedError("you don't have permessions to perform this action");
        }

        next();
    };
};

module.exports = restrictTo;
