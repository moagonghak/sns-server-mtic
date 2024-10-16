const express = require("express");
const router = express.Router();
const FavoriteController = require("../controllers/favorite-controller");
const { authenticate } = require("../middlewares/auth-middleware");


const validator = require("../middlewares/validator/validator");
const FavoriteValidator = require("../middlewares/validator/favorite-validator")

// firebase user 검증 미들웨어
//router.use(authenticate);

// 코멘트 등록
router.post("/register", 
    (req, res, next) => {
        req.locals = { validators: FavoriteValidator.register() };
        next();
    },
    validator,
    authenticate,
    FavoriteController.registerFavorite
);

router.delete("/unregister", 
    (req, res, next) => {
        req.locals = { validators: FavoriteValidator.unregister() };
        next();
    },
    validator,
    authenticate, 
    FavoriteController.unregisterFavorite
);

router.get("/getUserFavorites",     
    (req, res, next) => {
        req.locals = { validators: FavoriteValidator.getUserFavorites() };
        next();
    },
    validator,
    authenticate, 
    FavoriteController.getUserFavorites
);

module.exports = router;
