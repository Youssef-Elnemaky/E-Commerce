const Image = require('../models/image');
const crudService = require('./crudService');

module.exports = {
    getAllImages: crudService.getAll(Image),
    getImage: crudService.getOne(Image),
    updateImage: crudService.updateOne(Image),
    deleteImage: crudService.deleteOne(Image),
    createImage: crudService.createOne(Image),
};
