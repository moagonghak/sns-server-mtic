const logger = require('../config/logger');
const mysqlPool = require("../db/mysql-config");


class FavoriteDataHandler {

    /*
        function : registerFavorite
        description: 관심 추가

        @param
            user_id : String
            media_type : Number
            media_id : Number
            update_time : Date

        @return
            result : Boolean
    */
    static async registerFavorite(user_id, media_type, media_id, update_time) {
        const sql_insert = `
          INSERT INTO media_favorites (user_id, media_type, media_id, update_time)
          VALUES (?, ?, ?, ?)
        `;
    
        let connection = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);
    
            const [result] = await connection.query(sql_insert, [user_id, media_type, media_id,  update_time]);
            if ( result.affectedRows == 1 ) {
                logger.verbose(`[datahandler] registerFavorite, user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}`);
                return true;
            } else {
                logger.warn(`[datahandler] registerFavorite, failed - user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}`);
            }
        } catch (err) {
            logger.error(`[datahandler] registerFavorite, user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}`);
            logger.error(err);
            return false;
        } finally {
            if (connection) connection.release();
        }
    }

    /*
        function : unregisterFavorite
        description: 관심 제거

        @param
            user_id : String
            media_type : Number
            media_id : Number

        @return
            result : Boolean
    */    
    static async unregisterFavorite(user_id, media_type, media_id) {
        const sql_delete = `
            DELETE FROM media_favorites
            WHERE user_id = ? AND media_type = ? AND media_id = ?;
        `;
    
        let connection = null;
        try {
            connection = await mysqlPool.getConnection(async (conn) => conn);
    
            const [result] = await connection.query(sql_delete, [user_id, media_type, media_id]);
    
            if (result.affectedRows == 1) {
                logger.verbose(`[datahandler] unregisterFavorite, user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}`);
                return true;
            } else {
                logger.warn(`[datahandler] unregisterFavorite, failed - user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}`);
                return false;
            }
        } catch (err) {
            logger.error(`[datahandler] unregisterFavorite, user_id: ${user_id}, media_type: ${media_type}, media_id: ${media_id}`);
            logger.error(err);
            return false;
        } finally {
            if (connection) connection.release();
        }
    }

    /*
        function : getUesrFavorites
        description: 관심 리스트 추출

        @param
            user_id : String

        @return
            result : List<JsonObject>
            {
                media_type : Number,
                media_id : Number,
                update_time : String (date)
            }
    */      
    static async getUesrFavorites(user_id) {

        const sql_select = `
          SELECT media_type, media_id, update_time
          FROM media_favorites
          WHERE user_id = ?
          ORDER BY update_time DESC;
        `;
    
        let connection = null;
        try {

            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [rows] = await connection.query(sql_select, [user_id]);
    
            logger.verbose(`[datahandler] getUserFavorites,  user_id: ${user_id} get favorites count: ${rows.length}`);

            return rows;

        } catch (err) {
            logger.error(`[datahandler] getUserFavorites, user_id: ${user_id}`);
            logger.error(err);
            return null;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = FavoriteDataHandler;