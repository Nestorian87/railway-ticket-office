import {UserRequest} from "../interfaces/UserRequest";
import express from "express";
import {validationResult} from "express-validator";
import {PassengerService} from "../services/passengerService";
import {NotFoundError} from "../utils/errors/NotFoundError";

export async function addPassenger(req: UserRequest, res: express.Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return
    }

    const {firstName, lastName, benefitId, benefitDocument} = req.body;

    try {
        await PassengerService.addPassenger(req.userId!, firstName, lastName, benefitId, benefitDocument);
        res.status(201).redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).json({errors: [{msg: "Помилка сервера"}]});
    }
}

export async function editPassenger(req: UserRequest, res: express.Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }

    const {passengerId, firstName, lastName, benefitId, benefitDocument} = req.body;

    try {
        await PassengerService.editPassenger(req.userId!, passengerId, firstName, lastName, benefitId, benefitDocument);
        res.status(200).redirect('/profile');
    } catch (err) {
        if (err instanceof NotFoundError) {
            res.status(404).json({errors: [{msg: "Пасажир не знайдений"}]});
            return;
        }
        console.error(err);
        res.status(500).json({errors: [{msg: "Помилка сервера"}]});
    }
}

export async function deletePassenger(req: UserRequest, res: express.Response){
    try {
        const passengerId = +req.params.id;
        await PassengerService.deletePassenger(req.userId!, passengerId);
        res.status(200).json({message: "Пасажира успішно видалено"});
    } catch (err) {
        if (err instanceof NotFoundError) {
            res.status(404).json({error: "Пасажира не знайдено"});
            return
        }
        console.error(err);
        res.status(500).json({error: "Помилка сервера"});
    }
}