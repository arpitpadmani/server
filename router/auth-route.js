const express = require('express');
const router = express.Router();
const authcontrollers = require('../contoller/auth-controller');
const validate = require('../midellwares/validate_midelware');
const authMiddleware = require('../midellwares/authMiddleware');
const {signUpSchema , loginSchema} = require('../validators/auth-validator');
const forgotPassword = require('../contoller/forgotPassword-controller');

router.route("/").get(authcontrollers.home);


router
    .route('/user')
    .get(authMiddleware,authcontrollers.userdata);

router
    .route("/register")
    .post(validate(signUpSchema), authcontrollers.register);

router
    .route("/user/update/:id")
    .patch(authcontrollers.updatetUserById);
    
router
    .route("/login")
    .post(validate(loginSchema),authcontrollers.login);


module.exports = router;