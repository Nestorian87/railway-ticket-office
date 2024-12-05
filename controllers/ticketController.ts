import {UserRequest} from "../interfaces/UserRequest";
import express from "express";
import {TicketService} from "../services/ticketService";
import {BuyTicketsData} from "../interfaces/BuyTicketsData";
import {TrainService} from "../services/trainService";
import {SeatsAreNotFreeError} from "../utils/errors/SeatsAreNotFreeError";
import {PassengerService} from "../services/passengerService";
import {UserService} from "../services/userService";
import {BenefitService} from "../services/benefitService";
import helpers from "../utils/helpers";

export async function getUserTickets(req: UserRequest, res: express.Response) {
    try {
        const tickets = await TicketService.getUserTickets(req.userId!);
        res.status(200).json({data: tickets});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Помилка сервера"});
    }
}

export async function renderTicketPassengers(req: UserRequest, res: express.Response) {
    res.render('ticketPassengers', {
        data: JSON.parse(req.body.data),
        userPassengers: await PassengerService.getUserPassengers(req.userId!),
        user: await UserService.getUser(req.userId!),
        benefits: await BenefitService.getAllBenefits(),
        helpers
    });
}

export async function buyTickets(req: UserRequest, res: express.Response) {
    const data = req.body as BuyTicketsData;

    try {
        res.status(200).json({tickets: await TrainService.buyTickets(data, req.userId!)});
    } catch (err: Error | any) {
        if (err instanceof SeatsAreNotFreeError) {
            res.status(409).json({error: err.message});
            return
        }
        res.status(500).json({error: err.message});
    }
}