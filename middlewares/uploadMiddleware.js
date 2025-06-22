const multer = require('multer');

const storage = multer.memoryStorage(); // stream buffer

// images only
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Only image files are allowed'), false);
    } else {
        cb(null, true);
    }
};

// set max size to 5 MB
const multerLimits = {
    fileSize: 5 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits: multerLimits });

module.exports = upload;
