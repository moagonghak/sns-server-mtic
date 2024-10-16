const logger = require('../config/logger');
const mysqlPool = require("../db/mysql-config");

class TicketDataHandler {


    /*
        function : registerTicket
        description: ticket 정보를 db에 추가

        @param
            ticket_id : String
            media_type : Number
            media_id : Number
            user_id : String
            ticket_path : String
            watched_time : Date
            update_time : Date

        @return
            result : Boolean
    */
    static async registerTicket(ticket_id, media_type, media_id, user_id, ticket_path, watched_time, update_time) {
        // INSERT 쿼리 작성
        const sql_ticket = `
              INSERT INTO media_tickets (ticket_id, media_type, media_id, user_id, ticket_image_path, watched_time, update_time)
              VALUES (?, ?, ?, ?, ?, ?, ?);
            `;

        let connection = null;

        try {
            
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [result] = await connection.query(sql_ticket, [ticket_id, media_type, media_id, user_id, ticket_path, watched_time, update_time]);

            logger.verbose(`[datahandler] registerTicket, user_id: ${user_id}, ticket_id: ${ticket_id}, ticket_path: ${ticket_path}`);

            return true;

        } catch (err) {
            logger.error(`[datahandler] registerTicket, user_id: ${user_id}, ticket_id: ${ticket_id}, ticket_path: ${ticket_path}`);
        } finally {
            if (connection) connection.release();
        }
    }

    /*
        function : unregisterTicket
        description: ticket 정보를 db에서 제거

        @param
            ticket_id : String
            user_id : String

        @return
            result : Boolean
    */
    static async unregisterTicket(user_id, ticket_id) {
        // DELETE 쿼리 작성
        const sql_ticket = `
              DELETE FROM media_tickets
              WHERE user_id = ? AND ticket_id = ?;
            `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const [result] = await connection.query(sql_ticket, [user_id, ticket_id]);

            // 결과 확인 및 반환
            if (result.affectedRows === 1) {
                logger.verbose(`[datahandler] unregisterTicket, user_id: ${user_id}, ticket_id: ${ticket_id}`);
                return true;
            } else {
                logger.verbose(`[datahandler] unregisterTicket, no matched ticket, user_id: ${user_id}, ticket_id: ${ticket_id}`);
                return false;
            }

        } catch (err) {
            logger.error(`[datahandler] unregisterTicket, user_id: ${user_id}, ticket_id: ${ticket_id}`);
            throw err;            
        } finally {
            if (connection) connection.release();
        }
    }


    /*
        function : getAllTickets
        description: ticket path 정보를 mysql db에서 얻어옴

        @param
            user_id : String
            order : Number      // 0 : 관람순, 1 : 등록순

        @return
            result : List<JsonObject>
                ticket_id: String,
                media_type: Number,
                media_id: Number,
                ticket_image_path: String,
                watched_time: String (date),
                update_time: String (date)
    */
    static async getAllTickets(user_id, order) {

        const orderBy = order == 0 ? "watched_time DESC" : "update_time DESC";

        // SELECT 쿼리 작성
        const sql_ticket = `
              SELECT * FROM media_tickets 
              WHERE user_id = ?
              ORDER BY ${orderBy};
            `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const [rows] = await connection.query(sql_ticket, [user_id]);

            // 결과 확인 및 반환
            if (rows.length > 0) {
                logger.verbose(`[datahandler] getAllTickets, user_id: ${user_id} get tickets count : ${rows.length}`);
                return rows.map(row => (
                    {
                        ticket_id: row.ticket_id,
                        media_type: row.media_type,
                        media_id: row.media_id,
                        ticket_image_path: row.ticket_image_path,
                        watched_time: row.watched_time,
                        update_time: row.update_time
                    }));
            } else {
                logger.verbose("[datahandler] getAllTickets, No ticket paths found for the given user_id");
                return [];
            }

        } catch (err) {
            logger.error(`[datahandler] getAllTickets, user_id: ${user_id}, order : ${order}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    /*
        function : getTicketPath
        description: ticket path 정보를 mysql db에서 얻어옴

        @param
            user_id : String
            ticket_id : String

        @return
            result : String or null
    */    
    static async getTicketPath(user_id, ticket_id) {
        // SELECT 쿼리 작성
        const sql_ticket = `
              SELECT ticket_image_path FROM media_tickets 
              WHERE user_id = ? AND ticket_id = ?
            `;

        let connection = null;
        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // 쿼리 실행
            const [rows] = await connection.query(sql_ticket, [user_id, ticket_id]);

            // 결과 확인 및 반환
            if (rows.length > 0) {
                logger.verbose(`[datahandler] getTicketPath, ticket_id: ${ticket_id}, user_id: ${user_id}, ticket_path: ${rows[0].ticket_image_path}`);
                return rows[0].ticket_image_path;
            } else {
                logger.verbose(`[datahandler] getTicketPath, no matched ticket, ticket_id: ${ticket_id}, user_id: ${user_id}`);
                return null;
            }

        } catch (err) {
            logger.error(`[datahandler] getTicketPath, ticket_id: ${ticket_id}, user_id: ${user_id}`);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = TicketDataHandler;