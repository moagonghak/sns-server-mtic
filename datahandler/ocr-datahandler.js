const logger = require('../config/logger');
const UTCDate = require('../config/utc-date');
const mysqlPool = require("../db/mysql-config");

class OCRDataHandler {
   
    /*
        yearMonth String 형식 : YYYYMM 
    */
    static async GetOCRConsumedCount(yearMonth) {

        // INSERT 쿼리 작성
        const sql_ocr = `
            SELECT ocr_count FROM ocr WHERE year_month_id = ?;
            `;

        let connection = null;

        try {

            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [result] = await connection.query(sql_ocr, [yearMonth]);
            const ocrCount = result.length > 0 ? result[0].ocr_count : 0;

            logger.verbose(`[OCRDataHandler] GetQuotaOCR, year_month: ${yearMonth}, ocr_count: ${ocrCount}`);
            return ocrCount;
            
        } catch (err) {
            logger.error(`[OCRDataHandler] GetQuotaOCR error, year_month: ${yearMonth}, ocr_count: ${ocrCount}, error: ${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    static async addOcrUseHistory(user_id, utcString, ocr_result, ocr_uid) {
        
        const sql_ocr = `
            INSERT INTO ocr_usage (user_id, used_date, ocr_result, ocr_uid)
            VALUES (?, ?, ?, ?)
        `;
        
        let connection = null;

        try {

            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            await connection.query(sql_ocr, [user_id, utcString, ocr_result, ocr_uid]);

            logger.verbose(`[OCRDataHandler] addOcrUseHistory, user_id: ${user_id}, date: ${utcString}, ocr_result: ${ocr_result}, ocr_uid: ${ocr_uid}`);

        } catch (err) {
            logger.error(`[OCRDataHandler] addOcrUseHistory, user_id: ${user_id}, date: ${utcString}, ocr_result: ${ocr_result}, ocr_uid: ${ocr_uid}, error:${err}`);
        } finally {
            if (connection) connection.release();
        }
    }

    /*
        yearMonth String 형식 : YYYYMM 
    */
    static async increaseOCRCount(yearMonth) {
        // INSERT 쿼리 작성
        const sql_ocr = `
            INSERT INTO ocr (year_month_id, ocr_count)
            VALUES (?, 1)
            ON DUPLICATE KEY UPDATE ocr_count = ocr_count + 1;
            `;

        let connection = null;

        try {

            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            const [result] = await connection.query(sql_ocr, [yearMonth]);
            const ocrCount = result.length > 0 ? result[0].ocr_count : 1;

            logger.verbose(`[OCRDataHandler] increaseOCRCount, year_month: ${yearMonth}, ocr_count: ${ocrCount}`);

        } catch (err) {
            logger.error(`[OCRDataHandler] increaseOCRCount, year_month: ${yearMonth}`);
        } finally {
            if (connection) connection.release();
        }
    }

}

module.exports = OCRDataHandler;