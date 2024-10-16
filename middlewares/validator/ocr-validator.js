const { body, query, check } = require('express-validator');

class OCRValidator {

    static upload() {
        return [
            body('user_id').isString().notEmpty(),
            check('file').custom((value, { req }) => {
                if (!req.file) {
                    throw new Error('Image file is required');
                }
                // You can also check the file type, size, etc.
                return true;
            })
        ];
    }
}



module.exports = OCRValidator;