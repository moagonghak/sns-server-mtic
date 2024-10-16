const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth-controller");
const { authenticate } = require("../middlewares/auth-middleware");

const validator = require("../middlewares/validator/validator");
const AuthValidator = require("../middlewares/validator/auth-validator");

// firebase user 검증 미들웨어
//router.use(authenticate);

// 회원가입
router.post("/SignUpOrSignIn",
    (req, res, next) => {
        req.locals = AuthValidator.SignUpOrSignIn();
        next();
    },
    validator,
    AuthController.SignUpOrSignIn
);


router.post("/SigninOnly",
    (req, res, next) => {
        req.locals = AuthValidator.Signin();
        next();
    },
    validator,
    authenticate,
    AuthController.SignIn
);

router.post("/GetUser",
    (req, res, next) => {
        req.locals = AuthValidator.GetUser();
        next();
    },
    validator,
    AuthController.GetUser
);

router.post("/UpdateDisplayName",
    (req, res, next) => {
        req.locals = AuthValidator.UpdateDisplayName();
        next();
    },
    validator,
    AuthController.UpdateDisplayName
);

router.post("/DeleteUser",
    (req, res, next) => {
        req.locals = AuthValidator.DeleteUser();
        next();
    },
    validator,
    AuthController.DeleteUser
);

router.post("/IsAdminUser",
    (req, res, next) => {
        req.locals = AuthValidator.IsAdminUser();
        next();
    },
    validator,
    AuthController.IsAdminUser
);


module.exports = router;