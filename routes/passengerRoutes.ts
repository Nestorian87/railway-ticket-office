import express from "express";
import {check} from "express-validator";
import {auth} from "../middlewares/authMiddleware";
import {addPassenger, deletePassenger, editPassenger} from "../controllers/passengerController";

const router = express.Router();

router.post("/add-passenger",
    [
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("benefitDocument", "Номер пільгового документа не може бути пустим").optional()
    ],
    auth,
    addPassenger
);

router.post("/edit-passenger",
    [
        check("passengerId", "ID пасажира є обов'язковим").not().isEmpty(),
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("benefitDocument", "Номер пільгового документа не може бути пустим")
            .optional({checkFalsy: true})
            .isLength({min: 1})
    ],
    auth,
    editPassenger
);
router.delete("/delete-passenger/:id", auth, deletePassenger);



export default router;
