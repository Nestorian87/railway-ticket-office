import express from "express";
import {auth} from "../middlewares/authMiddleware";
import {
    deleteProfile, editProfile,
    login, logout,
    register,
    renderIndex,
    renderLogin,
    renderProfile,
    renderRegistration
} from "../controllers/userController";
import {check, validationResult} from "express-validator";


const router = express.Router();

router.get('/', auth, renderIndex);
router.get('/profile', auth, renderProfile);
router.get('/registration', renderRegistration);
router.post("/registration",
    [
        check("email", "Введіть правильну адресу електронної пошти").isEmail(),
        check("password", "Пароль не може бути пустим").not().isEmpty(),
        check("first_name", "Імʼя не може бути пустим").not().isEmpty(),
        check("last_name", "Прізвище не може бути пустим").not().isEmpty(),
        check("phone_number", "Введіть правильний номер телефону").isMobilePhone("uk-UA")
    ],
    register
);
router.get('/login', renderLogin);
router.post("/login",
    [
            check("email", "Введіть правильну адресу електронної пошти").isEmail(),
            check("password", "Пароль не може бути пустим").not().isEmpty()
    ],
    login
);
router.get('/logout', logout);
router.post("/edit-profile",
    [
        check("email", "Введіть правильну адресу електронної пошти").isEmail(),
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("phoneNumber", "Введіть правильний номер телефону").isMobilePhone("uk-UA")
    ],
    auth,
    editProfile
);
router.delete("/profile", auth, deleteProfile);



export default router;
