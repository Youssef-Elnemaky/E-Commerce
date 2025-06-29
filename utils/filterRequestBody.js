const filterRequestBody = (requestBody, ...requiredFields) => {
    const filteredBody = {};

    Object.keys(requestBody).map((key) => {
        if (requiredFields.includes(key)) {
            filteredBody[key] = requestBody[key];
        }
    });
    return filteredBody;
};

module.exports = filterRequestBody;
