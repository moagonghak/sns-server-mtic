const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment-controller");
const { authenticate } = require("../middlewares/auth-middleware");

const validator = require("../middlewares/validator/validator");
const CommentValidator = require("../middlewares/validator/comment-validator");

router.post("/register", (req, res, next) => {
    req.locals = { validators: CommentValidator.register() };
    next();
},
    validator,
    authenticate,
    CommentController.registerComment
);

// 코멘트 수정
router.put("/modify", (req, res, next) => {
    req.locals = { validators: CommentValidator.modify() };
    next();
},
    validator,
    authenticate,
    CommentController.modifyComment
);

// 코멘트 삭제
router.delete("/delete", (req, res, next) => {
    req.locals = { validators: CommentValidator.delete() };
    next();
},
    validator,
    authenticate,
    CommentController.deleteComment
);

// 코멘트 ID로 코멘트 조회
router.get("/getById", (req, res, next) => {
    req.locals = { validators: CommentValidator.getById() };
    next();
},
    validator,
    CommentController.getComment
);

// 사용자별 코멘트 조회
router.get("/getByUser", (req, res, next) => {
    req.locals = { validators: CommentValidator.getByUser() };
    next();
},
    validator,
    CommentController.getCommentsByUser
);

// 미디어별 코멘트 조회
router.get("/getByMedia", (req, res, next) => {
    req.locals = { validators: CommentValidator.getByMedia() };
    next();
},
    validator,
    CommentController.getCommentsByMedia
);

// 답글 조회
router.get("/getReplyComments", (req, res, next) => {
    req.locals = { validators: CommentValidator.getReplyComments() };
    next();
},
    validator,
    CommentController.getReplyComments
);

// 코멘트 좋아요
router.post("/likeComment", (req, res, next) => {
    req.locals = { validators: CommentValidator.like() };
    next();
},
    validator,
    authenticate,
    CommentController.likeComment
);

// 코멘트 싫어요
router.post("/dislikeComment", (req, res, next) => {
    req.locals = { validators: CommentValidator.dislike() };
    next();
},
    validator,
    authenticate,
    CommentController.dislikeComment
);

// 유저별 코멘트 리액션(좋아요, 싫어요) 조회
router.get("/getCommentReactionByUser", (req, res, next) => {
    req.locals = { validators: CommentValidator.getReactionByUser() };
    next();
},
    validator,
    CommentController.getUserCommentReactions
);

// 코멘트 신고
router.post("/reportComment", (req, res, next) => {
    req.locals = { validators: CommentValidator.reportComment() };
    next();
},
    validator,
    CommentController.reportComment
);

module.exports = router;
