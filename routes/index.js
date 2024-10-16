const express = require("express");
const router = express.Router();


const commentRouter = require("./comment-router");
router.use("/comment", commentRouter);

const ticketRouter = require("./ticket-router");
router.use("/ticket", ticketRouter);

const favoriteRouter = require("./favorite-router");
router.use("/favorite", favoriteRouter);

const authRouter = require("./auth-router");
router.use("/auth", authRouter);

const recommandRouter = require("./recommand-router");
router.use("/recommand", recommandRouter);

const ocrRouter = require("./ocr-router");
router.use("/ocr", ocrRouter);

module.exports = router;
