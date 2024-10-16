const express = require("express");
const router = express.Router();
const RecommandController = require("../controllers/recommand-controller");

const validator = require("../middlewares/validator/validator");
const RecommandValidator = require("../middlewares/validator/recommand-validator");

// firebase user 검증 미들웨어
//router.use(authenticate);

// 회원가입
router.get("/getRecentComments", 
    (req, res, next) => {
        req.locals = RecommandValidator.RecentComments();
        next();
    },
    validator,
    RecommandController.getRecentComments
);

module.exports = router;