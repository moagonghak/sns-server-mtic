const logger = require('../config/logger');
const mysqlPool = require("../db/mysql-config");


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


function generateQueryOrder(order_type) {

    // 기본 최신 순
    let query = "register_time DESC";

    if (order_type == 1) {
        query = "likes DESC";
    } else if (order_type == 2) {
        query = "grade DESC";
    }

    return query;
}

/*
    - count: Number
        한 번에 가져오는 댓글 갯수

    - page: Number
        예를 들어, user_id 작성된 코멘트 25개가 데이터베이스에 있다고 가정하면 getCount 10, page 1 일 때 
        order_type 정렬된 댓글 중 10~19 인덱스의 댓글을 가져옴. page가 2라면 20~24번째 댓글을 가져옴.
*/

function getPageQueryInfo(count, page) {

    page = Math.max(-1, page);

    const limit = page === -1 ? undefined : clamp(count, 2, 10);
    const offset = page === -1 ? undefined : limit * page;

    return [limit, offset];
}

class CommentDataHandler {

    /*
        function : insertComment
        description: comment를 db에 추가

        @param
            media_type : Number
            media_id : Number
            user_id : String
            grade : Number
            comment : String
            register_time : Date
            has_video : Boolean
            comment_level : Number

        @return
            comment_id : Number
    */
    static async insertComment(media_type, media_id, user_id, grade, comment, register_time, comment_type, comment_level, origin_comment_id) {

        // INSERT 쿼리 작성
        const sql = `
                INSERT INTO media_comments (media_type, media_id, user_id, grade, comment, register_time, comment_type, comment_level, origin_comment_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
              `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [result] = await connection.query(sql, [media_type, media_id, user_id, grade, comment, register_time, comment_type, comment_level, origin_comment_id]);
            const comment_id = result.insertId;

            // 결과 확인 및 반환
            logger.verbose(`[datahandler] insertComment, user_id: ${user_id}, comment_id : ${comment_id}`);
            return comment_id;

        } catch (err) {
            logger.error(`[datahandler] insertComment, user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}, grade : ${grade}, comment: ${comment}`);
            throw err;
        } finally {
            if (connection) connection.release();

            if (origin_comment_id != null) {
                this.increseCommentReplyCount(origin_comment_id);
            }
        }
    }

    static async increseCommentReplyCount(origin_comment_id) {

        const sql = `
                UPDATE media_comments
                SET reply_count = reply_count + 1
                WHERE comment_id = ?;
              `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [result] = await connection.query(sql, [origin_comment_id]);

            // 결과 확인 및 반환
            logger.verbose(`[datahandler] increseCommentReplyCount, comment_id : ${origin_comment_id}`);
        } catch (err) {
            logger.error(`[datahandler] increseCommentReplyCount, comment_id: ${origin_comment_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
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
    static async modifyComment(user_id, comment_id, grade, comment, modify_time, comment_type) {
        // UPDATE 쿼리 작성
        const sql = `
                UPDATE media_comments
                SET grade = ?, comment = ?, modify_time = ?, comment_type = ?
                WHERE comment_id = ? AND user_id = ?;
              `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행 (매개변수를 배열로 전달)
            const [results] = await connection.query(sql, [grade, comment, modify_time, comment_type, comment_id, user_id]);

            // 결과 확인 및 반환
            if (results.affectedRows === 1) {
                logger.verbose(`[datahandler] modifyComment, comment_id : ${comment_id}, user_id : ${user_id}`);
                return true;
            } else {
                logger.warn(`[datahandler] modifyComment, comment_id: ${comment_id}, user_id : ${user_id}`);
                return false;
            }
        } catch (err) {
            logger.error(`[datahandler] modifyComment, user: ${user_id}, comment_id : ${comment_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
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
        const sqlSelect = "SELECT origin_comment_id FROM media_comments WHERE comment_id = ? AND user_id = ?;";
        const sqlDelete = "UPDATE media_comments SET deleted = 1 WHERE comment_id = ? AND user_id = ?;";

        let connection = null;
        let originCommentId = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [rows] = await connection.query(sqlSelect, [comment_id, user_id]);
            originCommentId = rows[0]?.origin_comment_id;

            await connection.query(sqlDelete, [comment_id, user_id]);

            logger.verbose(`[datahandler] deleteComment, comment_id : ${comment_id}, user_id : ${user_id}`);
            return true;

        } catch (err) {
            logger.error(`[datahandler] deleteComment,, comment_id : ${comment_id}, user_id : ${user_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
            if (originCommentId != null) {
                this.decreseCommentReplyCount(originCommentId);
            }
        }
    }

    static async decreseCommentReplyCount(origin_comment_id) {

        const sql = `
                UPDATE media_comments
                SET reply_count = reply_count - 1
                WHERE comment_id = ?;
              `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [result] = await connection.query(sql, [origin_comment_id]);

            // 결과 확인 및 반환
            logger.verbose(`[datahandler] decreseCommentReplyCount, comment_id : ${origin_comment_id}`);
        } catch (err) {
            logger.error(`[datahandler] decreseCommentReplyCount, comment_id: ${origin_comment_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }




    /*
        function : getCommentsByUser
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
    static async getCommentsByUser(user_id, order_type, comment_type, count, page, with_reply) {

        // 정렬 옵션 설정
        const orderQuery = generateQueryOrder(order_type);
        const [limit, offset] = getPageQueryInfo(count, page);

        const isCommentFiltered = comment_type > 0;
        const isWithReplyComment = with_reply > 0;

        // SELECT 쿼리 작성
        const sql = `
                    SELECT * FROM media_comments
                    WHERE user_id = ? AND deleted = 0 ${isWithReplyComment ? "" : "AND origin_comment_id IS NULL"} ${isCommentFiltered ? "AND comment_type = ?" : ""} 
                    ORDER BY ${orderQuery}
                    ${limit !== undefined ? "LIMIT ? OFFSET ?" : ""};
                `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const params = isCommentFiltered ? [user_id, comment_type, limit, offset] : [user_id, limit, offset];
            const [results] = await connection.query(sql, params);

            logger.verbose(`[datahandler] getCommentsByUser, ${results.length} comments, page : ${page}, user_id : ${user_id}, comment_type : ${comment_type}`);

            // 결과 반환
            return results;
        } catch (err) {
            logger.error(`[datahandler] getCommentsByUser, page : ${page}, user_id : ${user_id}, comment_type : ${comment_type}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
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

        // 정렬 옵션 설정
        const orderQuery = generateQueryOrder(order_type);
        const [limit, offset] = getPageQueryInfo(count, page);

        const isCommentFiltered = comment_type > 0;

        // SELECT 쿼리 작성
        const sql = `
            SELECT * FROM media_comments
            WHERE media_type = ? AND deleted = 0 AND media_id = ? AND origin_comment_id IS NULL ${isCommentFiltered ? "AND comment_type = ?" : ""}
            ORDER BY ${orderQuery}
            ${limit !== undefined ? "LIMIT ? OFFSET ?" : ""};
        `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const params = isCommentFiltered ? [media_type, media_id, comment_type, limit, offset] : [media_type, media_id, limit, offset];
            const [results] = await connection.query(sql, params);

            logger.verbose(`[datahandler] getCommentsByMedia, ${results.length} comments, page : ${page}, media_type : ${media_type}, media_id : ${media_id}, comment_type : ${comment_type}`);

            // 결과 반환
            return results;
        } catch (err) {
            logger.error(`[datahandler] getCommentsByMedia, page : ${page}, media_type : ${media_type}, media_id : ${media_id}, comment_type : ${comment_type}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    /*
        function : getComments
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
    static async getComments(count, page) {

        const [limit, offset] = getPageQueryInfo(count, page);
        // SELECT 쿼리 작성

        const sql = `
            SELECT * FROM media_comments
            WHERE origin_comment_id IS NULL AND deleted = 0
            ORDER BY register_time DESC
            ${limit !== undefined ? "LIMIT ? OFFSET ?" : ""};
            `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const [results] = await connection.query(sql, [limit, offset]);
            logger.verbose(`[datahandler] getComments, ${results.length} comments, page : ${page}, count : ${count}`);

            // 결과 반환
            return results;
        } catch (err) {
            logger.error(`[datahandler] getComments, page : ${page}, count : ${count}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getReplyComments(originCommentId) {

        //유튜브는 오래된 시간 순으로 보여주길래 그거 따라함.
        const sql = `
            SELECT * FROM media_comments
            WHERE origin_comment_id = ? AND deleted = 0
            ORDER BY register_time ASC
            `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const [results] = await connection.query(sql, [originCommentId]);
            logger.verbose(`[datahandler] getReplyComments, ${results.length} comments, originCommentId : ${originCommentId}`);

            // 결과 반환
            return results;
        } catch (err) {
            logger.error(`[datahandler] getReplyComments, originCommentId : ${originCommentId}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
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
        const sql = "SELECT * FROM media_comments WHERE comment_id = ?;";

        let connection = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [result] = await connection.query(sql, [comment_id]);
            if (result.length > 0) {
                logger.verbose(`[datahandler] getComment, comment_id : ${comment_id}`);

                return result[0];
            }
            return null;
        } catch (err) {
            logger.error(`[datahandler] getComment, comment_id : ${comment_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
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
        const findReactionSql = `
            SELECT * FROM comment_reactions
            WHERE user_id = ? AND comment_id = ?;
        `;

        const insertReactionSql = `
            INSERT INTO comment_reactions (user_id, comment_id, is_like)
            VALUES (?, ?, ?);
        `;

        const deleteReactionSql = "DELETE FROM comment_reactions WHERE user_id = ? AND comment_id = ?;";

        const updateMediaCommentSql = `
            UPDATE media_comments
            SET likes = likes + ?, dislikes = dislikes + ?
            WHERE comment_id = ?;
        `;

        const getUpdatedCountsSql = `
            SELECT likes
            FROM media_comments
            WHERE comment_id = ?;
        `;

        let connection = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // Start a transaction
            await connection.beginTransaction();

            const [findReactionResult] = await connection.query(findReactionSql, [user_id, comment_id]);

            let likeDelta = 0;
            let dislikeDelta = 0;

            if (findReactionResult.length === 0) {
                await connection.query(insertReactionSql, [user_id, comment_id, is_like]);
                if (is_like) {
                    likeDelta = 1;
                } else {
                    dislikeDelta = 1;
                }
            } else {
                const action = findReactionResult[0];
                if (action.is_like == is_like) {
                    await connection.query(deleteReactionSql, [user_id, comment_id]);
                    if (is_like) {
                        likeDelta = -1;
                    } else {
                        dislikeDelta = -1;
                    }
                } else {
                    await connection.query(deleteReactionSql, [user_id, comment_id]);
                    await connection.query(insertReactionSql, [user_id, comment_id, is_like]);
                    if (is_like) {
                        likeDelta = 1;
                        dislikeDelta = -1;
                    } else {
                        likeDelta = -1;
                        dislikeDelta = 1;
                    }
                }
            }

            await connection.query(updateMediaCommentSql, [likeDelta, dislikeDelta, comment_id]);

            const [updatedCountsResult] = await connection.query(getUpdatedCountsSql, [comment_id]);
            const likeCount = updatedCountsResult[0].likes;
            // Commit the transaction
            await connection.commit();

            logger.verbose(`[datahandler] updateCommentReaction, comment_id : ${comment_id}, user_id : ${user_id}, like : ${is_like}, result_like : ${likeCount}`);

            return [likeDelta, dislikeDelta, likeCount];
        } catch (err) {

            // Rollback the transaction in case of an error
            if (connection) {
                await connection.rollback();
            }

            logger.error(`[datahandler] updateCommentReaction, comment_id : ${comment_id}, user_id : ${user_id}, like : ${is_like}`);
            throw err;

        } finally {
            if (connection) connection.release();
        }
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
        const sql = `
            SELECT comment_id, is_like 
            FROM comment_reactions
            WHERE user_id = ?;
        `;

        let connection = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [reactions] = await connection.query(sql, [user_id]);

            logger.verbose(`[datahandler] getUserCommentReactions, length : ${reactions.length}`);

            return reactions;
        } catch (err) {
            logger.error(`datahandler] getUserCommentReactions, user_id : ${user_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async updateCommentReportType(user_id, comment_id, report_type) {
        let connection = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);

            const sqlReportCount = `
            SELECT COUNT(*) AS count
            FROM comment_reports
            WHERE user_id = ? AND comment_id = ?;
            `;
            const [resultsReportCount] = await connection.query(sqlReportCount, [user_id, comment_id]);
            const reportCount = resultsReportCount[0].count;

            // 1. comment_reports 테이블에 레코드 삽입 또는 업데이트
            const sqlInsertOrUpdateReport = `
            INSERT INTO comment_reports (user_id, comment_id, report_type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE report_type = VALUES(report_type);
            `;

            const [resultsInsertOrUpdateReport] = await connection.query(sqlInsertOrUpdateReport, [user_id, comment_id, report_type]);


            if (reportCount == 0) {
                // 2. media_comments 테이블 업데이트
                const sqlUpdateComments = `
                UPDATE media_comments
                SET report_count = report_count + 1
                WHERE comment_id = ?;
                `;

                const [resultsUpdateComments] = await connection.query(sqlUpdateComments, [comment_id]);
            }


            logger.verbose(`[datahandler] updateCommentReport - Updated comment report: user_id: ${user_id}, comment_id: ${comment_id}, report_type: ${report_type}`);
            return true;

        } catch (err) {
            logger.error(`[datahandler] updateCommentReport - Error updating comment report: user_id: ${user_id}, comment_id: ${comment_id}, report_type: ${report_type}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

}

module.exports = CommentDataHandler;