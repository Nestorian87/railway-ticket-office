import {SearchQuery} from "../interfaces/SearchQuery";
import {checkIsDateBeforeToday} from "../utils/dateUtil";
import {TrainRepository} from "../repositories/trainRepository";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {CarriageCategoryRepository} from "../repositories/carriageCategoryRepository";
import {TrainStationRepository} from "../repositories/trainStationRepository";
import {NotFoundError} from "../utils/errors/NotFoundError";
import {TrainCarriageRepository} from "../repositories/trainCarriageRepository";
import {CarriageSeatRepository} from "../repositories/carriageSeatRepository";
import {TrainCarriageWithSeats} from "../interfaces/TrainCarriageWithSeats";
import {TrainWithCarriagesAndSeats} from "../interfaces/TrainWithCarriagesAndSeats";
import {BuyTicketsData} from "../interfaces/BuyTicketsData";
import {TrainCarriageService} from "./trainCarriageService";
import {TicketRepository} from "../repositories/ticketRepository";
import {Ticket} from "../models/Ticket";
import {CarriageCategoryService} from "./carriageCategoryService";
import {Station} from "../models/Station";
import {User} from "../models/User";
import {Passenger} from "../models/Passenger";
import {CarriageSeat} from "../models/CarriageSeat";
import {TrainCarriage} from "../models/TrainCarriage";
import {Fare} from "../models/Fare";
import {SeatsAreNotFreeError} from "../utils/errors/SeatsAreNotFreeError";

export const TrainService = {

    async searchTrains(query: SearchQuery): Promise<TrainSearchResult[]> {
        if (checkIsDateBeforeToday(new Date(query.date))) {
            return [];
        }

        const trains = await TrainRepository.findBetweenTwoStations(
            query.fromStationId, query.toStationId, query.date
        ) as TrainSearchResult[];

        if (trains.length == 0) {
            return [];
        }

        const trainIds = trains.map(t => t.train_id);

        const carriageCategories =
            await CarriageCategoryRepository.findForTrainsBetweenTwoStations(
                trainIds,
                query.fromStationId,
                query.toStationId,
                query.date
            );

        const routeStops = await TrainStationRepository.findRouteStops(trainIds);

        for (const train of trains) {
            const [depHours, depMinutes] = train.departure_time.split(':').map(Number);
            const [arrHours, arrMinutes] = train.arrival_time.split(':').map(Number);

            const departureDate = new Date(new Date(Date.parse(query.date)).setHours(depHours, depMinutes, 0, 0));
            const arrivalDate = new Date(new Date(Date.parse(query.date)).setHours(arrHours, arrMinutes, 0, 0));

            if (arrivalDate < departureDate) {
                arrivalDate.setDate(arrivalDate.getDate() + 1);
            }

            train.departure_date = query.date
            train.arrival_date = new Date(arrivalDate.getTime() - arrivalDate.getTimezoneOffset() * 60000)
                .toISOString().split('T')[0]

            train.carriage_categories = carriageCategories.filter(c => c.train_id == train.train_id)
            train.route_stations = routeStops.filter(s => s.train_id == train.train_id)
        }

        return trains;
    },

    async getTrainWithCarriagesAndSeats(
        trainId: number,
        query: SearchQuery
    ): Promise<TrainWithCarriagesAndSeats> {
        const train = await TrainRepository.findWithTrainStations(trainId) as TrainWithCarriagesAndSeats;

        const fromStation = train?.trainStations.find(s => s.station.station_id == query.fromStationId);
        const toStation = train?.trainStations.find(s => s.station.station_id == query.toStationId);

        if (!train ||
            !fromStation ||
            !toStation ||
            fromStation.station_number >= toStation.station_number ||
            checkIsDateBeforeToday(new Date(query.date))
        ) {
            throw new NotFoundError("Train is not found");
        }

        const carriages = await TrainCarriageRepository.findForTrain(trainId) as TrainCarriageWithSeats[];
        const seats = await CarriageSeatRepository.findForTrain(
            trainId,
            query.date,
            query.fromStationId,
            query.toStationId
        );

        for (const carriage of carriages) {
            carriage.seats = seats.filter(s => s.train_carriage_id == carriage.train_carriage_id);
        }

        train.carriages = carriages;

        return train;
    },

    async buyTickets(
        data: BuyTicketsData,
        userId: number,
    ) {
        const searchQuery: SearchQuery = {
            fromStationId: data.fromStationId,
            toStationId: data.toStationId,
            date: data.date,
        }

        const trainCarriages = await Promise.all(
            data.tickets.map(ticket =>
                TrainCarriageService.getTrainCarriageWithTrainAndCarriage(ticket.trainCarriageId)
            )
        );

        const trainId = trainCarriages[0]!.train.train_id;

        if (trainCarriages.some(carriage => carriage?.train.train_id !== trainId)) {
            throw new Error("Not all tickets belong to the same train");
        }

        const train = await TrainService.getTrainWithCarriagesAndSeats(trainId, searchQuery);

        const isSeatFree = (trainCarriageId: number, carriageSeatId: number) => {
            const carriage = train.carriages.find(c => c.train_carriage_id === trainCarriageId);
            if (!carriage) {
                return false;
            }

            const seat = carriage.seats.find(s => s.carriage_seat_id === carriageSeatId);
            return seat?.is_free == true;
        };

        if (
            data.tickets.some(ticket =>
                !isSeatFree(ticket.trainCarriageId, ticket.carriageSeatId)
            )
        ) {
            throw new SeatsAreNotFreeError("Місце або місця вже зайняті");
        }

        const carriageCategories = await CarriageCategoryRepository.findForTrainsBetweenTwoStations(
            [trainId],
            data.fromStationId,
            data.toStationId,
            data.date
        );

        const boughtTickets: Promise<Ticket>[] = [];

        for (const ticket of data.tickets) {
            const fareId = carriageCategories.find(cc => {
                    const carriage = train.carriages.find(c =>
                        c.train_carriage_id == ticket.trainCarriageId
                    );

                    return cc.carriage_category_id == carriage?.carriage.carriageCategory.carriage_category_id
            })?.fare_id;

            if (!fareId) {
                throw new Error("Fare not found");
            }

            const ticketEntity = new Ticket(
                new Date(data.date),
                train.trainStations.find(s => s.station.station_id == data.fromStationId)!,
                train.trainStations.find(s => s.station.station_id == data.toStationId)!,
                new User(userId),
                new Passenger(ticket.passengerId),
                new CarriageSeat(ticket.carriageSeatId),
                new TrainCarriage(ticket.trainCarriageId),
                new Fare(fareId)
            );
            const boughtTicket = TicketRepository.save(ticketEntity);
            boughtTickets.push(boughtTicket);
        }

        return await Promise.all(boughtTickets);
    }
}

