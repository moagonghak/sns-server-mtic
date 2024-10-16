const logger = require('../config/logger');

const UTCDate = require('../config/utc-date');
const CommentDataHandler = require("../datahandler/comment-datahandler");
const { ADMIN_UIDS, AuthService } = require("../services/auth-service.js");


class CommentService {

    static getCommentType(comment) {
        const comment_type = comment.toLowerCase().includes('https://www.youtube.com/') == 1 || comment.toLowerCase().includes('https://youtu.be/') == 1 ? 1 : 0;
        return comment_type;
    }

    /*
        function : registerComment
        description: comment를 db에 추가

        @param
            media_type : Number
            media_id : Number
            user_id : String
            grade : Number
            comment : String

        @return List<Object>
            0, comment_id : Number,
            1, register_time : Date,
            2, comment_type : Number,
            3, comment_level : Number
    */
    static async registerComment(media_type, media_id, user_id, grade, comment, origin_comment_id) {

        try {
            const register_time = await new UTCDate().dateString();

            const comment_type = CommentService.getCommentType(comment);
            const comment_level = AuthService.IsAdminUser(user_id) ? 1 : 0;

            const comment_id = await CommentDataHandler.insertComment(media_type, media_id, user_id, grade, comment, register_time, comment_type, comment_level, origin_comment_id);

            return [comment_id, register_time, comment_type, comment_level];
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    /*
        function : modifyComment
        description: db에 저장된 comment 내용 수정

        @param
            user_id : String
            grade : Number
            comment : String
            modify_time : Date
            comment_type : Number

        @return
            result : Boolean
    */
    static async modifyComment(user_id, comment_id, grade, comment) {

        const orgComment = await CommentService.getComment(comment_id);
        if (null == orgComment) {
            logger.log(`[service] modifyComment, comment is not exist, ${comment_id}`);
            return false;
        }

        if (orgComment.user_id != user_id) {
            logger.log(`[service] modifyComment, user not matched, comment user_id : ${orgComment.user_id}, request user_id ${user_id}`);
            return false;
        }

        const modify_time = await new UTCDate().dateString();
        const comment_type = CommentService.getCommentType(comment);

        try {
            const bResult = await CommentDataHandler.modifyComment(user_id, comment_id, grade, comment, modify_time, comment_type);
            if (bResult === true) {
                return [modify_time, comment_type];
            }
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    /*
        function : deleteComment
        description: comment 제거

        @param
            comment_id : Number
            user_id : String
        @return
            result : Boolean
    */
    static async deleteComment(comment_id, user_id) {
        try {
            const bDelete = await CommentDataHandler.deleteComment(comment_id, user_id);
            return bDelete;
        } catch (err) {
            logger.error(err);
        }

        return false;
    }

    /*
        function : getCommentByUserId
        description: User가 영화 or TV 시리즈에 단 댓글을 가져옴

        @param
            user_id : String
            order_type : Number
            comment_type : Number
            count : Number
            page : Number

        @return
            comments : List<JsonObject>

    */
    static async getCommentsByUser(userId, order_type, comment_type, count, page, with_reply) {
        try {
            const comments = await CommentDataHandler.getCommentsByUser(userId, order_type, comment_type, count, page, with_reply);
            return comments;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    /*
        function : getCommentsByMedia
        description: 영화 or TV 시리즈에 달린 댓글을 가져옴

        @param
            media_type : Number
            media_id : Number
            order_type : Number
            has_video : Boolean
            count : Number
            page : Number

        @return
            comments : List<JsonObject>
    */
    static async getCommentsByMedia(media_type, media_id, order_type, comment_type, count, page) {
        try {
            return await CommentDataHandler.getCommentsByMedia(media_type, media_id, order_type, comment_type, count, page);
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    /*
        function : getRecentComments
        description: 영화 or TV 시리즈에 달린 최신 댓글을 가져옴

        @param
            media_type : Number
            media_id : Number
            order_type : Number
            has_video : Boolean
            count : Number
            page : Number

        @return
            comments : List<JsonObject>
    */
    static async getRecentComments(count, page) {
        try {
            const comments = await CommentDataHandler.getComments(count, page);
            if (comments !== null) {
                return comments;
            }
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    static async getReplyComments(originCommentId) {
        try {
            const comments = await CommentDataHandler.getReplyComments(originCommentId);
            if (comments !== null) {
                return comments;
            }
        } catch (err) {
            logger.error(err);
        }

        return null;
    }


    /*
        function : getComment
        description: comment_id에 해당하는 comment를 가져옴

        @param
            comment_id : Number
        @return
            comment : JsonObject
    */
    static async getComment(comment_id) {
        try {
            const comment = await CommentDataHandler.getComment(comment_id);
            return comment;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }


    /*
        function : updateCommentReaction
        description: comment 좋아요 혹은 싫어요

        @param
            user_id : String
            comment_id : Number
            is_like : Boolean
            
        @return - list<Number>
            likeDelta : Number
            dislikeDelta : Number
            likeCount : Number
    */
    static async updateCommentReaction(user_id, comment_id, is_like) {
        try {
            const updatedReactions = await CommentDataHandler.updateCommentReaction(user_id, comment_id, is_like);
            return updatedReactions;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }


    /*
        function : getUserCommentReactions
        description: user가 댓글에 좋아요, 싫어요 누른 현황

        @param
            user_id : String
            
        @return - list<JsonObject>
            {
                comment_id : Number
                is_like : Boolean
            }
    */
    static async getUserCommentReactions(user_id) {
        try {
            const reactions = await CommentDataHandler.getUserCommentReactions(user_id);
            return reactions;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    static async updateCommentReportType(user_id, comment_id, report_type) {
        try {
            return await CommentDataHandler.updateCommentReportType(user_id, comment_id, report_type);
        } catch (err) {
            logger.error(err);
        }

        return null;
    }
}

module.exports = CommentService;
