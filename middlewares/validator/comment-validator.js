const { body, query } = require('express-validator');

class CommentValidator {
    static register() {
        return [
            body('media_type').isInt({ min: 0, max: 1 }),
            body('media_id').isInt({ min: 1 }),
            body('user_id').isString().notEmpty(),
            body('grade').isInt({ min: 0, max: 10 }),
            body('comment').isString().notEmpty(),
        ];
    }

    static modify() {
        return [
            body('user_id').isString().notEmpty(),
            body('comment_id').isInt({ min: 1 }),
            body('grade').isInt({ min: 1, max: 10 }),
            body('comment').isString().notEmpty(),
        ];
    }

    static delete() {
        return [
            body('user_id').isString().notEmpty(),
            body('comment_id').isInt({ min: 1 })
        ];
    }

    static getById() {
        return [
            query('comment_id').isInt({ min: 1 }),
        ];
    }

    static getByUser() {
        return [
            query('user_id').isString().notEmpty(),
            query('order_type').isInt({ min: 0, max: 2 }),
            query('comment_type').isInt({ min: 0, max: 1 }),
            query('get_count').isInt({ min: 1, max: 30 }),
            query('page').isInt({ min: 0, max: 3000 })
        ];
    }

    static getReplyComments() {
        return [
            query('origin_comment_id').isInt({ min: 1 })
        ];
    }

    static getByMedia() {
        return [
            query('media_type').isInt({ min: 0, max: 1 }),
            query('media_id').isInt({ min: 1 }),
            query('order_type').isInt({ min: 0, max: 2 }),
            query('get_count').isInt({ min: 1, max: 30 }),
            query('comment_type').isInt({ min: 0, max: 1 }),
            query('page').isInt({ min: 0, max: 3000 })
        ];
    }

    static like() {
        return [
            body('user_id').isString().notEmpty(),
            body('comment_id').isInt({ min: 1 }),
        ];
    }

    static dislike() {
        return [
            body('user_id').isString().notEmpty(),
            body('comment_id').isInt({ min: 1 }),
        ];
    }

    static getReactionByUser() {
        return [
            query('user_id').isString().notEmpty()
        ];
    }

    static reportComment() {
        return [
            body('user_id').isString().notEmpty(),
            body('comment_id').isInt({ min: 1 }),
        ];
    }
}



module.exports = CommentValidator;