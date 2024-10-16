const { body, query } = require('express-validator');

class TicketValidator {
    static register() {
        return [
            body('user_id').isString().notEmpty(),
            body('media_type').isString().notEmpty(),
            body('media_id').isString().notEmpty(),
            body('watched_time').isDate(),
        ];
    }

    static unregister() {
        return [
            body('user_id').isString().notEmpty(),
            body('ticket_id').isString().notEmpty(),
        ];
    }
    
    static getAllTickets() {
        return [
            query('user_id').isString().notEmpty(),
            query('order').isInt({ min: 0, max: 1 }),
        ];
    }

    static getTicketUrl() {
        return [
            query('user_id').isString().notEmpty(),
            query('ticket_id').isString().notEmpty(),
        ];
    }
}



module.exports = TicketValidator;