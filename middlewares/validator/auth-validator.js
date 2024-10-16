const { SocialPlatform } = require("../../services/auth-service.js");
const { StatusCodes } = require('http-status-codes');
const { body, query } = require('express-validator');

class AuthValidators {
    static SignUpOrSignIn() {
        return [
            body('platform').isInt({ min: SocialPlatform.Google, max: SocialPlatform.CustomEmail }),
            body('platform_user_id').isString().notEmpty(),
            body('nick_name').isString().notEmpty(),
            body('email').isEmail(),
        ];
    }

    static Signin() {
        return [
            body('user_id').isString().notEmpty(),
        ];
    }

    static GetUser() {
        return [
            body('user_id').isString().notEmpty(),
        ];
    }

    static UpdateDisplayName() {
        return [
            body('user_id').isString().notEmpty(),
        ];
    }

    static DeleteUser() {
        return [
            body('user_id').isString().notEmpty(),
        ];
    }

    static IsAdminUser() {
        return [
            body('user_id').isString().notEmpty(),
        ];
    }
}



module.exports = AuthValidators;