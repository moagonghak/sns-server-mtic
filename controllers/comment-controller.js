const CommentService = require("../services/comment-service.js");
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

class CommentController {

    /* 
        registerComment - 코멘트 등록

        @param req.body: {
            user_id: String,        // 사용자의 고유 ID(Firebase Auth user unique id)
            media_type: Number,     // 미디어 타입 (0 - 영화, 1 - TV 시리즈)
            media_id: Number,       // 미디어 고유 ID
            grade : Number,        // 미디어 평점
            comment: String        // 댓글 내용
            origin_comment_id: int        // 원본 댓글 ID (Optional)
        }

        @response: {
            message: String,       // 결과 메시지
            result: JsonObject    // 등록된 코멘트 정보
            {
                comment_id : int,
                register_time : String  (isostring),
                comment_type : Number,
                comment_level : Number
            }
        }

        @httpsCode 
            201 - 성공
            400 - 등록실패
    */

    static async registerComment(req, res) {

        try {

            const { media_type, media_id, user_id, grade, comment, origin_comment_id } = req.body;

            const reulsts = await CommentService.registerComment(media_type, media_id, user_id, grade, comment, origin_comment_id);

            if (reulsts === null) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to register comment",
                    result: null
                });
            } else {
                const [comment_id, register_time, comment_type, comment_level] = reulsts;

                res.status(StatusCodes.CREATED).send({
                    message: "register comment success",
                    result: {
                        comment_id: comment_id,
                        register_time: register_time,
                        comment_type: comment_type,
                        comment_level: comment_level
                    }
                });
            }
        } catch (err) {

            logger.error(`[controller] registerComment, err: ${err}`);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to register comment",
                result: null
            });
        }
    }

    /* 
        modifyComment - 코멘트 수정

        @param req.body: {
            user_id: String,       // 사용자의 고유 ID(Firebase Auth user unique id)
            comment_id: Number,    // comment id
            grade : Number,        // 미디어 평점
            comment: String        // 댓글 내용
        }

        @response: {
            message: String,       // 결과 메시지
            result: JsonObject    // 등록된 코멘트 정보
            {
                comment_id : int,
                modify_time : String  (isostring),
                comment_type : Number
            }
        }

        @httpsCode 
            200 - 성공
            404 - 수정 대상 없음
            400 - 수정 실패
    */

    static async modifyComment(req, res) {

        try {

            const { user_id, comment_id, grade, comment } = req.body;

            const modifiedResults = await CommentService.modifyComment(user_id, comment_id, grade, comment);

            if (modifiedResults !== null) {
                const [modify_time, comment_type] = modifiedResults;

                res.status(StatusCodes.OK).json({
                    message: 'modify comment is success',
                    result: {
                        comment_id: comment_id,
                        modify_time: modify_time,
                        comment_type: comment_type
                    }
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: 'modify comment is failed',
                    result: null
                });
            }

        } catch (err) {

            logger.error(`[controller] modifyComment, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to modify comment",
                result: null
            });
        }
    }

    /* 
        deleteComment - 코멘트 삭제

        @param req.body: {
            user_id: String,       // 사용자의 고유 ID(Firebase Auth user unique id)
            comment_id: Number,    // comment id
        }

        @response: {
            message: String,       // 결과 메시지
            result: Boolean        // 결과
        }

        @httpsCode 
            200 - 성공
            404 - 삭제대상 없음
            500 - 삭제 실패
    */

    static async deleteComment(req, res) {

        try {

            const { user_id, comment_id } = req.query;

            const bDelete = await CommentService.deleteComment(comment_id, user_id);

            if (bDelete) {
                res.status(StatusCodes.OK).json({
                    message: "delte comment successfully",
                    result: true
                });
            } else {

                res.status(StatusCodes.NOT_FOUND).json({
                    message: "comment delte is failed",
                    result: false
                });
            }

        } catch (err) {

            logger.error(`[controller] deleteComment, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "error deleting the comment",
                result: false
            });
        }
    }

    /* 
        getComment - 코멘트 id로 코멘트 조회

        @param req.body: {
            comment_id: Number,    // comment id
        }

        @response: {
            message: String,       // 결과 메시지
            result: JsonObject     // 등록된 코멘트 정보
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */
    static async getComment(req, res) {

        try {

            const { comment_id } = req.query;

            const comment = await CommentService.getComment(comment_id);

            if (comment !== null) {
                res.status(StatusCodes.OK).json({
                    message: "get comment success",
                    result: comment
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "comment is not exist",
                    result: null
                });
            }
        } catch (err) {

            logger.error(`[controller] getComment, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "get comment is failed",
                result: null
            });
        }
    }


    /* 

        getCommentsByUser - 코멘트 id로 코멘트 조회

        @param req.body: {
            user_id : String,       // 사용자의 고유 ID(Firebase Auth user unique id)
            order_type : Number,    // 0 : 최신순, 1 : 좋아요순, 2 : 평점 순
            comment_type : Number,  // 0 : 일반, 1 : 영상 포함
            get_count : Number,     // 한번에 가져올 댓글 갯수
            page : Number,          // Page Index
        }

        @response: {
            message: String,            // 결과 메시지
            result: List<JsonObject>    // 등록된 코멘트 정보
            {
                comment Json, ...
            }
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */

    static async getCommentsByUser(req, res) {

        try {

            const { user_id, order_type, comment_type, get_count, page, with_reply } = req.query;

            const comments = await CommentService.getCommentsByUser(user_id, order_type, comment_type, get_count, page, with_reply);

            if (comments !== null) {
                res.status(StatusCodes.OK).json({
                    message: "get comment success",
                    result: comments
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "comments are not exist",
                    result: null
                });
            }

        } catch (err) {

            logger.error(`[controller] getCommentsByUser, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "get comment is failed",
                result: null
            });
        }
    }


    /* 
        getCommentsByMedia - 코멘트 id로 코멘트 조회

        @param req.body: {
            media_type : Number,    // media type
            media_id : Number,      // media id
            order_type : Number,    // 0 : 최신순, 1 : 좋아요순, 2 : 평점 순
            comment_type : Number,  // 0 : 일반, 1 : 영상 포함
            get_count : Number,     // 한번에 가져올 댓글 갯수
            page : Number,          // Page Index
        }

        @response: {
            message: String,            // 결과 메시지
            result: List<JsonObject>    // 등록된 코멘트 정보
            {
                comment Json, ...
            }
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */

    static async getCommentsByMedia(req, res) {

        try {

            const { media_type, media_id, order_type, comment_type, get_count, page } = req.query;

            const comments = await CommentService.getCommentsByMedia(media_type, media_id, order_type, comment_type, get_count, page);

            if (comments !== null) {
                res.status(StatusCodes.OK).json({
                    message: "get comment success",
                    result: comments
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "comments are not exist",
                    result: null

                });
            }

        } catch (err) {

            logger.error(`[controller] getCommentsByMedia, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "get comment is failed",
                result: null
            });
        }
    }

    static async getReplyComments(req, res) {

        try {

            const { origin_comment_id } = req.query;

            const replyComments = await CommentService.getReplyComments(origin_comment_id);

            if (replyComments !== null) {
                res.status(StatusCodes.OK).json({
                    message: "succes to get reply comments",
                    result: replyComments
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "failed to get reply comments",
                    result: null
                });
            }

        } catch (err) {

            logger.error(`[controller] getReplyComments, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get reply comments",
                result: null
            });
        }
    }

    /* 
        likeComment - comment 좋아요

        @param req.body: {
            user_id : String,       // 사용자의 고유 ID(Firebase Auth user unique id)
            comment_id : Number     // comment id

        @response: {
            message: String,            // 결과 메시지
            result: JsonObject          // 등록된 코멘트 정보
            {
                likeDelta : Number,
                dislikeDelta : Number,
                likeCount : Number
            }

            [likeDelta, dislikeDelta]
            [1, 0] 이면 좋아요만
            [-1, 0] 이면 좋아요 취소
            [1, -1] 이면 싫어요 취소 후 좋아요
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */
    static async likeComment(req, res) {

        try {

            const { user_id, comment_id } = req.body;

            const updatedReactions = await CommentService.updateCommentReaction(user_id, comment_id, true);

            if (updatedReactions !== null) {

                const [likeDelta, dislikeDelta, likeCount] = updatedReactions;

                res.status(StatusCodes.OK).json({
                    message: "like comment success",
                    result: {
                        likeDelta,
                        dislikeDelta,
                        likeCount
                    }
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "like comment failed",
                    result: null
                });
            }
        } catch (err) {

            logger.error(`[controller] likeComment, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "like comment failed",
                result: null
            });
        }
    }

    /* 
        dislikeComment - comment 싫어요

        @param req.body: {
            user_id : String,       // 사용자의 고유 ID(Firebase Auth user unique id)
            comment_id : Number     // comment id

        @response: {
            message: String,            // 결과 메시지
            result: JsonObject          // 등록된 코멘트 정보
            {
                likeDelta : Number,
                dislikeDelta : Number,
                likeCount : Number
            }
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */
    static async dislikeComment(req, res) {

        try {

            const { user_id, comment_id } = req.body;

            const updatedReactions = await CommentService.updateCommentReaction(user_id, comment_id, false);

            if (updatedReactions !== null) {

                const [likeDelta, dislikeDelta, likeCount] = updatedReactions;

                res.status(StatusCodes.OK).json({
                    message: "dislike comment success",
                    result: {
                        likeDelta,
                        dislikeDelta,
                        likeCount
                    }
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "dislike comment failed",
                    result: null
                });
            }
        } catch (err) {

            logger.error(`[controller] dislikeComment, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "dislike comment failed",
                result: null
            });
        }
    }


    /* 
        getUserCommentReactions - user의 comment 좋아요/싫어요 현황 조회

        @param req.query: {
            user_id : String,       // 사용자의 고유 ID(Firebase Auth user unique id)
        }

        @response: {
            message: String,            // 결과 메시지
            result: List<JsonObject>    // 조회된 코멘트 리스트
            {
                comment_id : Number
                is_like : Boolean
            }
        }

        @httpsCode 
            200 - 성공
            404 - comment 없음
            500 - 조회 실패
    */
    static async getUserCommentReactions(req, res) {

        try {

            const { user_id } = req.query;

            const userReactions = await CommentService.getUserCommentReactions(user_id);

            if (userReactions !== null) {

                res.status(StatusCodes.OK).json({
                    message: "get user comment reaction success",
                    result: userReactions
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "user reactions are not exist",
                    result: ''
                });
            }
        } catch (err) {

            logger.error(`[controller] getUserCommentReactions, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "get user comment reaction is failed",
                result: null
            });
        }
    }


    static async reportComment(req, res) {

        try {

            const { user_id, comment_id, report_type } = req.body;

            const updated = await CommentService.updateCommentReportType(user_id, comment_id, report_type);

            if (updated !== null) {

                res.status(StatusCodes.OK).json({
                    message: "report comment success",
                    result: updated
                });
            } else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "dislike comment failed",
                    result: null
                });
            }
        } catch (err) {

            logger.error(`[controller] reportComment, err: ${err}`);
            report
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "report comment failed",
                result: null
            });
        }
    }

}

module.exports = CommentController;
