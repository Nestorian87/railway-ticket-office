import express from "express";
import {UserRequest} from "../interfaces/UserRequest";
import {SearchQuery} from "../interfaces/SearchQuery";
import {TrainService} from "../services/trainService";
import {UserService} from "../services/userService";
import {SeatsParams} from "../interfaces/SeatsParams";
import {NotFoundError} from "../utils/errors/NotFoundError";
import {TrainStationService} from "../services/trainStationService";
import helpers from "../utils/helpers";
import {CarriageCategoryService} from "../services/carriageCategoryService";
import {StationService} from "../services/stationService";

export async function renderSearch(req: UserRequest, res: express.Response) {
    const query = req.query as unknown as SearchQuery;

    res.render('trains', {
        fromStationId: +query.fromStationId,
        toStationId: +query.toStationId,
        date: query.date,
        user: await UserService.getUser(req.userId!),
        stations: await StationService.getAllStations(),
        helpers
    });
}

export async function searchTrains(req: UserRequest, res: express.Response) {
    const query = req.query as unknown as SearchQuery;
    if (!query.fromStationId || !query.toStationId || !query.date) {
        res.status(400).json({error: "Invalid query"});
        return;
    }

    res.status(200).json({trains: await TrainService.searchTrains(query)})
}

export async function renderSeats(req: UserRequest, res: express.Response) {
    const query = req.query as unknown as SearchQuery;
    const {trainId, carriageCategoryId} = req.params as unknown as SeatsParams;

    try {
        res.render('seats', {
            train: await TrainService.getTrainWithCarriagesAndSeats(trainId, query),
            date: query.date,
            fromStation: await TrainStationService.getTrainStation(trainId, query.fromStationId),
            toStation: await TrainStationService.getTrainStation(trainId, query.toStationId),
            user: await UserService.getUser(req.userId!),
            carriageCategories: await CarriageCategoryService.getTrainCarriageCategories(trainId, query),
            selectedCarriageCategoryId: carriageCategoryId,
            helpers
        });
    } catch (err) {
        if (err instanceof NotFoundError) {
            res.status(404).send();
        }
        res.status(500).send();
        console.error(err);
    }
}