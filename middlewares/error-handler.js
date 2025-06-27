const { StatusCodes } = require('http-status-codes');
const multer = require('multer');

const errorHandlerMiddleware = (err, req, res, next) => {
    console.log(err);
    let customError = {
        message: err.message || 'Something went wrong',
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    };

    //check for mongoose validation errors
    if (err.name == 'ValidationError') {
        customError.statusCode = StatusCodes.BAD_REQUEST;
        customError.message = Object.values(err.errors)
            .map((item) => item.message)
            .join(' & ');
    }

    //check for duplicate key values
    if (err.code && err.code == 11000) {
        customError.message = `This ${Object.keys(err.keyValue)} is already in use. Please choose a different one.`;
        customError.statusCode = StatusCodes.CONFLICT;
    }

    //check for cast error (bad id values)
    if (err.name == 'CastError') {
        customError.message = `No item found with id: ${err.value}.`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }

    //check for JWT expired error
    if (err.name == 'TokenExpiredError') {
        customError.message += '. Please login again.';
        customError.statusCode = StatusCodes.UNAUTHORIZED;
    }

    //check for JWT invalid token error
    if (err.name == 'JsonWebTokenError') {
        customError.statusCode = StatusCodes.UNAUTHORIZED;
    }

    // Multer errors
    // File size
    if (err.code === 'LIMIT_FILE_SIZE') {
        customError.statusCode = StatusCodes.BAD_REQUEST;
        customError.message += '. Max file size is 5 MB.';
    }
    // File type
    if (err.message === 'Only image files are allowed') {
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }
    // Generic error for multer
    if (err instanceof multer.MulterError) {
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    return res.status(customError.statusCode).json({ error: customError.message });
};

module.exports = errorHandlerMiddleware;
