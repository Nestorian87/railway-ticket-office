import express from "express";
import {check} from "express-validator";
import {auth} from "../middlewares/authMiddleware";
import {addPassenger, deletePassenger, editPassenger, getUserPassengers} from "../controllers/passengerController";

const router = express.Router();

router.post("/passenger",
    [
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("benefitDocument", "Номер пільгового документа не може бути пустим").optional()
    ],
    auth,
    addPassenger
);

router.put("/passenger/:id",
    [
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("benefitDocument", "Номер пільгового документа не може бути пустим")
            .optional({checkFalsy: true})
            .isLength({min: 1})
    ],
    auth,
    editPassenger
);
router.delete("/passenger/:id", auth, deletePassenger);

router.get('/passengers', auth, getUserPassengers);



export default router;
