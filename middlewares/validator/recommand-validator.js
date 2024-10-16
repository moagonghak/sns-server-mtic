const { SocialPlatform } = require("../../services/auth-service.js");
const { StatusCodes } = require('http-status-codes');
const { body, query } = require('express-validator');

class RecommandValidators {
    static RecentComments() {
        return [
            query('get_count').isInt({ min: 1, max: 30 }),
            query('page').isIn({min: 0, max: 3000}),
        ];
    }
}



module.exports = RecommandValidators;