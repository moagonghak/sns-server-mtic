const TicketService = require("../services/ticket-service.js");
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

class LibraryController {

    /* 
        registerTicket - 티켓 이미지 등록

        @param req.body: {
            media_type: Number,      // 미디어 타입 (0 - 영화, 1 - TV 시리즈)
            media_id: Number,        // 미디어 고유 ID
            watched_time: String     // 미디어 관람 일자 - iso8601 - utc타임
        }

        @param req.file: {
            image: File,             // 티켓 이미지 파일 (선택 사항)
        }

        @response: {
            message: String,       // 결과 메시지
            result: JsonObject    // 등록된 코멘트 정보
            {
                ticket_id: String,        // 티켓 고유 Id
                ticket_path: String,      // Firebase Storage 접근 가능한 TicketPath
                update_time: String,      // 라이브러리 업데이트 시간 (ISO 8601 형식)
            }
        }

        @httpsCode 
            201 - 성공
            400 - 등록실패

                
        티켓 이미지를 Firebase CloudStorage에 등록하고 등록 정보를 media_tickets db에 저장
        Storage에 등록될 고유 id 및 Client에서 접속 가능한 path를 반환
    */
    static async registerTicket(req, res) {

        try {

            let { user_id, media_type, media_id, watched_time } = req.body;
            const image = req.file;

            media_type = parseInt(media_type, 10);
            media_id = parseInt(media_id, 10);

            const results = await TicketService.registerTicket(media_type, media_id, user_id, image, watched_time);

            if (results !== null) {

                const [ticket_id, ticket_path, update_time] = results;

                res.status(StatusCodes.CREATED).json({
                    message: "success to register ticket",
                    result: {
                        ticket_id: ticket_id,
                        ticket_path: ticket_path,
                        update_time: update_time
                    }
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to register ticket",
                    result: null
                });
            }
        } catch (err) {
            logger.error(`[controller] registerTicket, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to register ticket",
                result: null
            });
        }
    }

    /* 
        unregisterTicket - 티켓 제거

        @param req.body: {
            user_id: String,
            ticket_id: String
        }

        @response: {
            message: String,       // 결과 메시지
            result: Boolean        // 삭제 결과
        }

        @httpsCode 
            200 - 성공
            400 - 등록실패
    */
    static async unregisterTicket(req, res) {

        try {

            const { user_id, ticket_id } = req.body;

            const result = await TicketService.unregisterTicket(user_id, ticket_id);

            if (result === true) {
                res.status(StatusCodes.OK).json({
                    message: "ticket unregistered",
                    result: true,
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to unregister ticket",
                    result: false
                });
            }
        } catch (err) {
            logger.error(`[controller] unregisterTicket, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to unregister ticket",
                result: false
            });
        }
    }


    /* 
        getAllTickets - 티켓 제거

        @param req.query: {
            user_id: String,
            ticket_id: String
        }

        @response: {
            message: String,                // 결과 메시지
            result: List<JsonObject>        // Ticket 리스트
        }

        @httpsCode 
            200 - 성공
            400 - 등록실패
    */
    static async getAllTickets(req, res) {

        try {
            const { user_id, order } = req.query;

            const results = await TicketService.getAllTickets(user_id, order);
            if (results !== null) {
                res.status(StatusCodes.OK).json({
                    message: "success get tickets",
                    result: results
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to get tickets",
                    result: null
                });
            }

        } catch (err) {
            logger.error(`[controller] getAllTickets, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get tickets",
                result: null
            });
        }
    }

    /*
        getTicketUrl - 티켓 이미지 다운로드 URL 가져오기

        @param req.body: {
            user_id: String,         // 사용자의 고유 ID(Firebase Auth user unique id)
            ticket_id: String,       // 티켓 이미지 고유 ID
        }

        @response: {
            message: String,          // 결과 메시지
            result: String            // download_url
        }

        @httpsCode 
            200 - 성공
            400 - 등록실패

        주어진 티켓 이미지 ID를 사용하여 티켓 이미지의 다운로드 URL을 가져옵니다.
    */
    static async getTicketUrl(req, res) {

        try {

            const { user_id, ticket_id } = req.query;

            const expireSec = 600; // 10분동안 image를 받을 수 있는 url 생성
            const download_url = await TicketService.getTicketUrl(user_id, ticket_id, expireSec);

            if (download_url != null) {
                res.status(StatusCodes.OK).json({
                    message: "success to get download ticket url",
                    result: download_url
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "failed to get ticket download url",
                    result: null
                });
            }

        } catch (err) {
            logger.error(`[controller] getTicketUrl, err: ${err}`);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "failed to get ticket download url",
                result: null
            });
        }
    }
}

module.exports = LibraryController;

