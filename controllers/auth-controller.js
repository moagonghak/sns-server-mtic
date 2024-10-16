const { SocialPlatform, AuthService } = require("../services/auth-service.js");
const { StatusCodes } = require('http-status-codes');
const { body, query, validationResult } = require('express-validator');


class AuthController {

    /* 
        @post

        signup - 회원 가입 
    */

    static async SignUpOrSignIn(req, res) {

        console.log("SignUpOrSignIn function call ", req.body);

        const { platform, platform_user_id, nick_name, email } = req.body;

        try {
            if (platform == SocialPlatform.Google) {
                // google
                const result = await AuthService.SignUpOrSignInGoogle(platform_user_id, nick_name, email);

                res.status(StatusCodes.OK).send({
                    message: "success to sign in google",
                    result: {
                        custom_token: null,
                        verified_nickname: result["verifiedNickName"],
                        error: result["error"],
                    }
                });
            }
            else if (platform == SocialPlatform.Apple) {
                // google
                const result = await AuthService.SignUpOrSignInApple(platform_user_id, nick_name, email);

                res.status(StatusCodes.OK).send({
                    message: "success to sign in apple",
                    result: {
                        custom_token: null,
                        verified_nickname: result["verifiedNickName"],
                        error: result["error"],
                    }
                });
            }
            else {
                // naver, kakao
                const result = await AuthService.SignUpOrSignIn(platform, platform_user_id, nick_name, email);
                const customToken = result["customToken"];
                if (customToken != null) {
                    res.status(StatusCodes.OK).send({
                        message: "success to sign in",
                        result: {
                            custom_token: customToken,
                            verified_nickname: result["verifiedNickName"],
                            error: result["error"],
                        }
                    });
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send({
                        message: "sign in failed, token is not exist",
                        result: {
                            custom_token: customToken,
                            verified_nickname: result["verifiedNickName"],
                            error: result["error"],
                        }
                    });
                }
            }

        } catch (err) {
            console.log("sign in failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                message: "sign in  failed",
                result: {
                    custom_token: null,
                    verified_nickname: null,
                    error: result["error"],
                }
            });
        }
    }

    static async SignIn(req, res) {
        console.log("SignIn function call ", req.body);

        const { user_id } = req.body;

        try {

            const success = await AuthService.SignIn(user_id);
            if (success) {
                res.status(StatusCodes.ACCEPTED).send({
                    message: "success login"
                });
            } else {
                res.status(StatusCodes.NOT_ACCEPTABLE).send({
                    message: "failed to login"
                });
            }

        } catch (err) {
            console.log("siginin failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "siginin failed" });
        }
    }

    static async GetUser(req, res) {
        console.log("GetUser function call ", req.body);

        const { user_id } = req.body;

        try {

            const user = await AuthService.GetUser(user_id);
            if (user != null) {
                res.status(StatusCodes.OK).send({
                    message: "success get user",
                    result: user
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).send({
                    message: "failed to get user"
                });
            }

        } catch (err) {
            console.log("get user failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "get user failed" });
        }
    }

    static async UpdateDisplayName(req, res) {
        console.log("UpdateDisplayName function call ", req.body);

        const { user_id, display_name } = req.body;

        try {

            const result = await AuthService.UpdateDisplayName(user_id, display_name);
            if (result["value"]) {
                res.status(StatusCodes.ACCEPTED).send({
                    message: "success update display name",
                    result: result
                });
            } else {
                res.status(StatusCodes.NOT_ACCEPTABLE).send({
                    message: "failed to update display name",
                    result: result
                });
            }

        } catch (err) {
            console.log("update display name failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                message: "update display name failed", result: {
                    value: false,
                    error: err,
                }
            });
        }
    }

    static async DeleteUser(req, res) {
        console.log("DeleteUser function call ", req.body);

        const { user_id } = req.body;

        try {

            const success = await AuthService.DeleteUser(user_id);
            if (success) {
                res.status(StatusCodes.ACCEPTED).send({
                    message: "success delete user",
                });
            } else {
                res.status(StatusCodes.NOT_ACCEPTABLE).send({
                    message: "failed to delete user"
                });
            }

        } catch (err) {
            console.log("delete user failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "delete user failed" });
        }
    }

    static IsAdminUser(req, res) {
        console.log("IsAdminUser function call ", req.body);

        const { user_id } = req.body;

        try {

            const result = AuthService.IsAdminUser(user_id);
            res.status(StatusCodes.OK).send({
                message: "is admin user success",
                result: result ? 1 : 0
            });

        } catch (err) {
            console.log("is admin user failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "is admin user failed" });
        }
    }
}

module.exports = AuthController;