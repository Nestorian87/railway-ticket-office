import express from "express";
import {renderStationsGraph} from "../controllers/stationController";

const router = express.Router();

router.get('/stations-graph', renderStationsGraph);

export default router;
