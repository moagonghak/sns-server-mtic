const express = require("express");
const router = express.Router();
const multer = require('multer');
const TicketController = require("../controllers/ticket-controller");
const { authenticate } = require("../middlewares/auth-middleware");

const validator = require("../middlewares/validator/validator");
const TicketValidator = require("../middlewares/validator/ticket-validator")

const upload = multer();

router.post("/register", 
    upload.single('image'),
    (req, res, next) => {
        req.locals = { validators: TicketValidator.register() };
        next();
    },
    validator,
    authenticate,
    TicketController.registerTicket
);

// ticket 제거
router.delete('/unregister',     
    (req, res, next) => {
        req.locals = { validators: TicketValidator.unregister() };
        next();
    },
    validator,
    authenticate,
    TicketController.unregisterTicket
);

// user_id에 등록된 모든 ticket 가져오기
router.get('/getAllTickets', 
    (req, res, next) => {
        req.locals = { validators: TicketValidator.getAllTickets() };
        next();
    },
    validator,
    authenticate,
    TicketController.getAllTickets
);

// ticket_id로 한시동안 ticket image를 down받을 수 있는 url 발급
router.get('/getTicketUrl', 
    (req, res, next) => {
        req.locals = { validators: TicketValidator.getTicketUrl() };
        next();
    },
    validator,
    authenticate,
    TicketController.getTicketUrl
);

module.exports = router;
