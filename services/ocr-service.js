const logger = require('../config/logger');
const UTCDate = require('../config/utc-date');
const OCRDataHandler = require("../datahandler/ocr-datahandler");
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

/* Definition of Constant Variable */
const MY_OCR_API_URL = process.env.MY_OCR_API_URL;
const MY_OCR_SECRET_KEY = process.env.MY_OCR_SECRET_KEY;
const maxOcrMonthQuota = parseInt(process.env.OCR_MONTH_MAXIMUM_QUOTA);

/* Definition of Headers, Required Variable */
let config = {
    headers: {
        "Content-Type": "application/json",
        "X-OCR-SECRET": MY_OCR_SECRET_KEY
    }
}

class OCRService {

    static async isOverflowOCR(yearMonth) {

        const consumedCount = await OCRDataHandler.GetOCRConsumedCount(yearMonth);
        if ( maxOcrMonthQuota <= consumedCount || maxOcrMonthQuota <= 0 ) {
            return true;
        }

        return false;
    }

    static async Upload(user_id, fileData) {

        try {
            if ( fileData == null || fileData == undefined ) {
                logger.error(`[OCRService] Upload, user_id: ${user_id}'s ticket image file is invalid`);
                return null;
            }

            const now = new UTCDate();
            const yearMonth = parseInt(now.date.format('YYYYMM'));

            const isOverflow = await OCRService.isOverflowOCR(yearMonth);
            if ( isOverflow ) {

                logger.error(`[OCRService] Upload, user_id: ${user_id}, mtic all ocr is consumed`);
                return null;
            }

            // encode the image data as base64
            const base64ImageData = fileData.toString('base64');

            // send the image data to the Naver Clova OCR API server
            const response = await axios.post(MY_OCR_API_URL, {
                "images": [
                    {
                        "format": "jpg",
                        "name": "medium",
                        "data": base64ImageData
                    }
                ],
                "lang": "ko",
                "requestId": "string",
                "timestamp": new Date().getTime(),
                "version": "V2"
            }, config);

            const dateString = now.dateString();
            OCRDataHandler.increaseOCRCount(yearMonth);
            
            if (response.status == StatusCodes.OK && response.data?.images?.length > 0) {
                const ocr_uid = response.data.images[0].uid;
                OCRDataHandler.addOcrUseHistory(user_id, dateString, true, ocr_uid);
                return JSON.stringify(response.data.images[0]);
            } else {
                OCRDataHandler.addOcrUseHistory(user_id, dateString, false, '');
            }
            return null;

        } catch (error) {
            logger.error(`[OCRService] Upload,  user_id: ${user_id} has an error ${error}`);
        }

        return null;
    }

}

module.exports = { OCRService };