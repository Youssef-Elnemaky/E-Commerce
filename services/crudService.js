const { NotFoundError } = require('../errors');
const APIFeatures = require('../utils/apiFeatures');

const getAll =
    (Model) =>
    async (queryParams = {}, customFilter = {}) => {
        const features = new APIFeatures(Model.find(customFilter), queryParams)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const docs = features.execute();
        return docs;
    };

const createOne = (Model) => async (data) => {
    return await Model.create(data);
};

const getOne =
    (Model) =>
    async (id, populate = '') => {
        const doc = await Model.findById(id).populate(populate);
        if (!doc) {
            throw new NotFoundError(`${Model.modelName} with id: ${id} not found`);
        }
        return doc;
    };

const updateOne = (Model) => async (id, updateData) => {
    const updatedDoc = await Model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedDoc) {
        throw new NotFoundError(`${Model.modelName} with id: ${id} not found`);
    }
    return updatedDoc;
};

const deleteOne = (Model) => async (id) => {
    const deletedDoc = await Model.findByIdAndDelete(id);
    if (!deletedDoc) {
        throw new NotFoundError(`${Model.modelName} with id: ${id} not found`);
    }
    return deletedDoc;
};

module.exports = { getAll, createOne, getOne, updateOne, deleteOne };
