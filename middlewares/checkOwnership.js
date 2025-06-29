const { NotFoundError, UnauthorizedError } = require('../errors');

const checkOwnership = (Model) => {
    return async (req, res, next) => {
        const resource = await Model.findById(req.params.id);

        if (!resource) {
            throw new NotFoundError(`${Model.modelName} with id: ${req.params.id} not found`);
        }

        // check if the user is an admin
        const isAdmin = req.user.userRole === 'admin';
        // normal user? check ownership
        const isOwner = resource.createdBy.equals(req.user.userId);

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedError("you don't have permission to perform this action");
        }

        req.resource = resource;

        next();
    };
};

module.exports = checkOwnership;
