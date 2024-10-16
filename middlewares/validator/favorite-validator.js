const { body, query } = require('express-validator');

class FavoriteValidator {
    static register() {
        return [
            body('user_id').isString().notEmpty(),
            body('media_type').isInt({ min: 0, max: 1 }),
            body('media_id').isInt({ min: 1 }),
        ];
    }

    static unregister() {
        return [
            body('user_id').isString().notEmpty(),
            body('media_type').isInt({ min: 0, max: 1 }),
            body('media_id').isInt({ min: 1 }),
        ];
    }
    
    static getUserFavorites() {
        return [
            query('user_id').isString().notEmpty()
        ];
    }
}



module.exports = FavoriteValidator;