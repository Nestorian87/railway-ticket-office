import {StationService} from "../services/stationService";
import express from "express";

export async function renderStationsGraph(_req: express.Request, res: express.Response) {
    const stationDistances = await StationService.getAllAdjacentStationDistances();
    res.render('stations-graph', {stations: stationDistances});
}