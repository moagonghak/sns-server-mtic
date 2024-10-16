const logger = require('../config/logger');
const FavoriteService = require("../services/favorite-service.js");
const { StatusCodes } = require('http-status-codes');

class FavoriteController {

    /* 
        registerFavorite - 즐겨찾기 미디어로 등록

        @param req.body: {
            user_id: String,        // 사용자의 고유 ID(Firebase Auth user unique id)
            media_type: Number,     // 미디어 타입 (0 - 영화, 1 - TV 시리즈)
            media_id: Number,       // 미디어 고유 ID
        }

        @response: {
            message: String,       // 결과 메시지
            result: String         // favorite 등록 시간
        }

        @httpsCode 
            200 - 성공
            400 - 등록 실패
    */

    static async registerFavorite(req, res) {

        try {

            const { user_id, media_type, media_id } = req.body;

            const update_time = await FavoriteService.registerFavorite(user_id, media_type, media_id);

            if (update_time !== null) {
                res.status(StatusCodes.OK).json({
                    message: "succes to register Favorite",
                    result: update_time
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to register Favorite",
                    result: null
                });
            }

        } catch (err) {
            logger.error(`[controller] registerFavorite, err: ${err}`);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to register favorite",
                result: null
            });
        }
    }

    /* 
        unregisterFavorite - 즐겨찾기 해제

        @param req.body: {
            user_id: String,        // 사용자의 고유 ID(Firebase Auth user unique id)
            media_type: Number,     // 미디어 타입 (0 - 영화, 1 - TV 시리즈)
            media_id: Number,       // 미디어 고유 ID
        }

        @response: {
            message: String,       // 결과 메시지
            result: Boolean        // 결과
        }

        @httpsCode 
            200 - 해제 성공
            400 - 해제 실패
    */
    static async unregisterFavorite(req, res) {

        try {

            const { media_type, media_id, user_id } = req.body;

            const result = await FavoriteService.unregisterFavorite(user_id, media_type, media_id);
            if (result === true) {
                res.status(StatusCodes.OK).json({
                    message: "succes to unregister Favorite",
                    result: true
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to unregister Favorite",
                    result: false
                });
            }

        } catch (err) {
            logger.error(`[controller] unregisterFavorite, err: ${err}`);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to unregister favorite",
                result: false
            });
        }
    }

    /* 
        getUserFavorites - 즐겨찾기 가져오기

        @param req.body: {
            user_id: String,        // 사용자의 고유 ID(Firebase Auth user unique id)
        }

        @response: {
            message: String,            // 결과 메시지
            result: List<JsonObject>    // 결과
            {
                media_type : Number,
                media_id : Number,
                update_time : String (date)
            }
        }

        @httpsCode 
            200 - 해제 성공
            404 - 해제 실패
    */
    static async getUserFavorites(req, res) {

        try {

            const { user_id } = req.query;

            const favorites = await FavoriteService.getUesrFavorites(user_id);
            if (favorites !== null) {
                res.status(StatusCodes.OK).json({
                    message: "succes to get user Favorites",
                    result: favorites
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "user favorites are not exist",
                    result: null
                });
            }

        } catch (err) {
            logger.error(`[controller] getUserFavorites, err: ${err}`);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get user favorites",
                result: null
            });
        }
    }
}


module.exports = FavoriteController;