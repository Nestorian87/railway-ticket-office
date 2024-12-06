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
import pdf, {CreateOptions} from "html-pdf";
import ejs from "ejs";
import path from "node:path";
import {TrainStationRepository} from "../repositories/trainStationRepository";
import {TicketSearchQuery} from "../interfaces/TicketSearchQuery";

export async function getUserTickets(req: UserRequest, res: express.Response) {
    try {
        const query = req.query as unknown as TicketSearchQuery;
        const tickets = await TicketService.getUserTickets(req.userId!, query);
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

async function renderPdf(
    templatePath: string,
    data: object,
    options: CreateOptions,
    filename: string,
    res: express.Response
) {
    ejs.renderFile(templatePath, data, (err, htmlContent) => {
        if (err) {
            return res.status(500).send(err);
        }

        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                return res.status(500).send("Error generating PDF.");
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}.pdf`);
            res.send(buffer);
        });
    });
}

async function getTicketData(ticketId: number, userId: number, res: express.Response) {
    const ticket = await TicketService.getTicket(ticketId, userId);
    if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return null;
    }
    return ticket;
}

export async function getTicketPdf(req: UserRequest, res: express.Response) {
    const ticket = await getTicketData(+req.params.id, req.userId!, res);
    if (!ticket) return;

    const templatePath = path.join(__dirname, '../views', 'ticket.ejs');
    const options: CreateOptions = {
        orientation: 'landscape',
        format: 'A4',
        header: { height: '5mm' },
        footer: { height: '5mm' },
        border: { top: '30px', bottom: '30px' },
    };

    const filename = `Квиток №${ticket.ticket_id} ${ticket.passenger_last_name} ${ticket.passenger_first_name} ${new Date(ticket.trip_start_date).toLocaleDateString('uk-UA')}`;
    await renderPdf(templatePath, { ticket, helpers }, options, filename, res);
}

export async function getTicketRoutePdf(req: UserRequest, res: express.Response) {
    const ticket = await getTicketData(+req.params.id, req.userId!, res);
    if (!ticket) return;

    const routeStops = await TrainStationRepository.findRouteStops(
        [ticket.train_id],
        ticket.departure_train_station_id,
        ticket.arrival_train_station_id
    );

    const templatePath = path.join(__dirname, '../views', 'ticket-route.ejs');
    const options: CreateOptions = { format: 'A4' };

    const filename = `Маршрут ${ticket.train_number} ${ticket.departure_station_name} – ${ticket.arrival_station_name}`;
    await renderPdf(templatePath, { routeStops, ticket, helpers }, options, filename, res);
}