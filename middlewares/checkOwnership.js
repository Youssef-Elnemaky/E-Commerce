const { NotFoundError, UnauthorizedError } = require('../errors');

const checkOwnership = (Model) => {
    return async (req, res, next) => {
        const resource = await Model.findById(req.params.id);

        if (!resource) {
            throw new NotFoundError(`${resoruce.modelName} with id: ${req.params.id} not found`);
        }

        // check the ownership
        if (resource.createdBy.toString() !== req.user.userId) {
            throw new UnauthorizedError("you don't have permission to perform this action");
        }

        next();
    };
};

module.exports = checkOwnership;
