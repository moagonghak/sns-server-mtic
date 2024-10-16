const { OCRService } = require("../services/ocr-service.js");
const { StatusCodes } = require('http-status-codes');

class OCRController {
    static async Upload(req, res) {

        try {

            const { user_id } = req.body;
            const file = req.file;

            const movieJson = await OCRService.Upload(user_id, file.buffer);
            if (movieJson != null) {
                res.status(StatusCodes.OK).json({
                    message: "success ocr",
                    result: movieJson
                });
            } else {
                res.status(StatusCodes.NOT_ACCEPTABLE).send({
                    message: "failed to ocr",
                    result: null
                });
            }

        } catch (err) {
            console.log("ocr failed");
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                message: "ocr failed",
                result: null
            });
        }
    }

}

module.exports = OCRController;