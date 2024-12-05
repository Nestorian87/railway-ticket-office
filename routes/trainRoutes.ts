import express from "express";
import {auth} from "../middlewares/authMiddleware";
import {renderSearch, renderSeats} from "../controllers/trainController";

const router = express.Router();

router.get('/search', auth, renderSearch);
router.get('/train/:trainId/category/:carriageCategoryId/seats', auth, renderSeats);

export default router;
