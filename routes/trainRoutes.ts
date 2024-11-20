import express from "express";
import {renderStationsGraph} from "../controllers/stationController";
import {auth} from "../middlewares/authMiddleware";
import {UserRequest} from "../interfaces/UserRequest";
import {SearchQuery} from "../interfaces/SearchQuery";
import {User} from "../models/User";
import {renderSearch, renderSeats} from "../controllers/trainController";
import {SeatsParams} from "../interfaces/SeatsParams";
import {Train} from "../models/Train";
import {TrainCarriage} from "../models/TrainCarriage";
import {CarriageSeat} from "../models/CarriageSeat";
import {Ticket} from "../models/Ticket";
import {TrainStation} from "../models/TrainStation";

const router = express.Router();

router.get('/search', auth, renderSearch);
router.get('/train/:trainId/category/:carriageCategoryId/seats', auth, renderSeats);

export default router;
