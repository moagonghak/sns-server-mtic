const logger = require('../config/logger');
const CommentService = require("../services/comment-service.js");
const { StatusCodes } = require('http-status-codes');


class RecommandController {


    /* 
        getRecentComments - 최신 comment 조회

        @param req.query: {
            get_count : Number,     // 한번에 가져올 댓글 갯수
            page : Number,          // Page Index
        }

        @response: {
            message: String,            // 결과 메시지
            result: List<JsonObject>    // 최신 코멘트 정보
            {
                comment Json, ...
            }
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */

    static async getRecentComments(req, res) {

        try {

            const { get_count, page } = req.query;

            const recentComments = await CommentService.getRecentComments(get_count, page);

            if ( recentComments !== null ) {
                res.status(StatusCodes.OK).json({ 
                    message: "succes to get recent comments",
                    result: recentComments
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({ 
                    message: "failed to get recent comments",
                    result: null
                });
            }

        } catch (err) {

            logger.error(`[controller] getRecentComments, err: ${err}`);
            
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: "failed to get recent comments",
                result: null
             });
        }
    }
}

module.exports = RecommandController;