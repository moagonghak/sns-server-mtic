const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const { authenticate } = require("../middlewares/auth-middleware");
const validator = require("../middlewares/validator/validator");

const OCRController = require("../controllers/ocr-controller");
const OCRValidator = require("../middlewares/validator/ocr-validator")



router.post("/upload",
    authenticate,
    upload.single('image'),
    (req, res, next) => {
        req.locals = { validators: OCRValidator.upload() };
        next();
    },
    validator,
    OCRController.Upload
);

module.exports = router;