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
import {User} from "../models/User";
import {Passenger} from "../models/Passenger";
import {CarriageSeat} from "../models/CarriageSeat";
import {TrainCarriage} from "../models/TrainCarriage";
import {Fare} from "../models/Fare";
import {SeatsAreNotFreeError} from "../utils/errors/SeatsAreNotFreeError";
import {Train} from "../models/Train";
import {TicketData} from "../interfaces/TicketData";
import {CarriageCategorySearchResult} from "../interfaces/CarriageCategorySearchResult";

export const TrainService = {

    async searchTrains(query: SearchQuery): Promise<TrainSearchResult[]> {
        if (checkIsDateBeforeToday(new Date(query.date))) {
            return [];
        }

        const trains = await TrainRepository.findBetweenTwoStations(
            query.fromStationId,
            query.toStationId,
            query.date,
            query.trainCategoryId,
            query.departureTimeStart,
            query.departureTimeEnd,
            query.arrivalTimeStart,
            query.arrivalTimeEnd,
            query.carriageCategoryIds?.split(',').map(c => +c),
            query.sortCriteria == "ticket_price" ? null : query.sortCriteria
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
                query.date,
                query.minPrice,
                query.maxPrice
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

            train.min_ticket_price = train.carriage_categories.length > 0
                ? Math.min(...train.carriage_categories.map(c => c.total_ticket_price || Infinity))
                : Infinity;
        }

        let filteredTrains = trains.filter(t => t.carriage_categories.length > 0);

        if (query.sortCriteria === "ticket_price") {
            filteredTrains = filteredTrains.sort((a, b) => a.min_ticket_price - b.min_ticket_price);
        }

        return filteredTrains;
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

    async buyTickets(data: BuyTicketsData, userId: number) {
        this.validatePassengers(data);

        const trainCarriages = await this.fetchTrainCarriages(data);
        const trainId = this.validateTrainConsistency(trainCarriages);

        const searchQuery = this.createSearchQuery(data);
        const train = await this.fetchTrainWithDetails(trainId, searchQuery);

        this.validateSeatsAvailability(data, train);

        const carriageCategories = await this.fetchCarriageCategories(trainId, data);
        return await this.createTickets(data, userId, train, carriageCategories);
    },

    validatePassengers(data: BuyTicketsData) {
        if (data.tickets.some(ticket => ticket.passengerId == null)) {
            throw new Error("Not all tickets have passengers");
        }
    },

    async fetchTrainCarriages(data: BuyTicketsData) {
        return await Promise.all(
            data.tickets.map(ticket =>
                TrainCarriageService.getTrainCarriageWithTrainAndCarriage(ticket.trainCarriageId)
            )
        );
    },

    validateTrainConsistency(trainCarriages: Awaited<TrainCarriage | null>[]): number {
        const trainId = trainCarriages[0]!.train.train_id;
        if (trainCarriages.some(carriage => carriage?.train.train_id !== trainId)) {
            throw new Error("Not all tickets belong to the same train");
        }
        return trainId;
    },

    createSearchQuery(data: BuyTicketsData): SearchQuery {
        return {
            fromStationId: data.fromStationId,
            toStationId: data.toStationId,
            date: data.date,
            trainCategoryId: null,
            minPrice: null,
            maxPrice: null,
            departureTimeStart: null,
            departureTimeEnd: null,
            arrivalTimeStart: null,
            arrivalTimeEnd: null,
            sortCriteria: null,
            carriageCategoryIds: null
        };
    },

    async fetchTrainWithDetails(trainId: number, searchQuery: SearchQuery) {
        return await TrainService.getTrainWithCarriagesAndSeats(trainId, searchQuery);
    },

    validateSeatsAvailability(data: BuyTicketsData, train: TrainWithCarriagesAndSeats) {
        const isSeatFree = (trainCarriageId: number, carriageSeatId: number) => {
            const carriage = train.carriages.find(c => c.train_carriage_id === trainCarriageId);
            if (!carriage) return false;
            const seat = carriage.seats.find(s => s.carriage_seat_id === carriageSeatId);
            return seat?.is_free == true;
        };

        if (data.tickets.some(ticket => !isSeatFree(ticket.trainCarriageId, ticket.carriageSeatId))) {
            throw new SeatsAreNotFreeError("Місце або місця вже зайняті");
        }
    },

    async fetchCarriageCategories(trainId: number, data: BuyTicketsData) {
        return await CarriageCategoryRepository.findForTrainsBetweenTwoStations(
            [trainId],
            data.fromStationId,
            data.toStationId,
            data.date
        );
    },

    async createTickets(
        data: BuyTicketsData,
        userId: number,
        train: TrainWithCarriagesAndSeats,
        carriageCategories: CarriageCategorySearchResult[]
    ) {
        const boughtTickets: Promise<Ticket>[] = [];

        for (const ticket of data.tickets) {
            const fareId = this.findFareIdForTicket(ticket, train, carriageCategories);
            const ticketEntity = this.buildTicketEntity(ticket, data, userId, train, fareId);
            const boughtTicket = TicketRepository.save(ticketEntity);
            boughtTickets.push(boughtTicket);
        }

        return await Promise.all(boughtTickets);
    },

    findFareIdForTicket(
        ticket: TicketData,
        train: TrainWithCarriagesAndSeats,
        carriageCategories: CarriageCategorySearchResult[]
    ): number {
        const fareId = carriageCategories.find(cc => {
            const carriage = train.carriages.find(c =>
                c.train_carriage_id == ticket.trainCarriageId
            );
            return cc.carriage_category_id == carriage?.carriage.carriageCategory.carriage_category_id;
        })?.fare_id;

        if (!fareId) {
            throw new Error("Fare not found");
        }
        return fareId;
    },

    buildTicketEntity(
        ticket: TicketData,
        data: BuyTicketsData,
        userId: number,
        train: Train,
        fareId: number
    ): Ticket {
        return new Ticket(
            new Date(data.date),
            train.trainStations.find(s => s.station.station_id == data.fromStationId)!,
            train.trainStations.find(s => s.station.station_id == data.toStationId)!,
            new User(userId),
            new Passenger(ticket.passengerId),
            new CarriageSeat(ticket.carriageSeatId),
            new TrainCarriage(ticket.trainCarriageId),
            new Fare(fareId)
        );
    }

}

