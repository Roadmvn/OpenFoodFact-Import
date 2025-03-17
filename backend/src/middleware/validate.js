const AppError = require('../utils/AppError');

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (!error) return next();

        const errors = error.details.map(detail => detail.message);
        next(new AppError(errors.join(', '), 400));
    };
};

module.exports = validate;
