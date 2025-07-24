const joi = require('joi');
const postUrlRequestModel = joi.object({
    url: joi.string().uri().required().max(300),
    expire: joi.number(),
});

const getLongURLRequest = joi.object({
    shortId: joi.string().required().min(6).max(8),
});

const map = {
    postUrlRequestModel,
    getLongURLRequest,
}

const validate = (object, modelName) => {
    const schema = map[modelName];
    if (!schema) {
        throw new Error('Invalid schema');
    }
    return schema.validate(object);
}

module.exports = validate;