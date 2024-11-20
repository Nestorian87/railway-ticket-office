import express from "express";
import {UserRequest} from "../interfaces/UserRequest";
import {SearchQuery} from "../interfaces/SearchQuery";
import {TrainService} from "../services/trainService";
import {UserService} from "../services/userService";
import {SeatsParams} from "../interfaces/SeatsParams";
import {NotFoundError} from "../utils/errors/NotFoundError";
import {TrainStationService} from "../services/trainStationService";
import helpers from "../utils/helpers";

export async function renderSearch(req: UserRequest, res: express.Response) {
    const query = req.query as unknown as SearchQuery;

    res.render('trains', {
        trains: await TrainService.searchTrains(query),
        fromStationId: query.fromStationId,
        toStationId: query.toStationId,
        date: query.date,
        user: await UserService.getUser(req.userId!),
        helpers
    });
}

export async function renderSeats(req: UserRequest, res: express.Response){
    const query = req.query as unknown as SearchQuery;
    const {trainId, carriageCategoryId} = req.params as unknown as SeatsParams;

    try {
        res.render('seats', {
            train: await TrainService.getTrainWithCarriagesAndSeats(trainId, carriageCategoryId, query),
            date: query.date,
            fromStation: await TrainStationService.getTrainStation(trainId, query.fromStationId),
            toStation: await TrainStationService.getTrainStation(trainId, query.toStationId),
            user: await UserService.getUser(req.userId!),
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