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
        carriageCategoryId: number,
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

        const carriages = await TrainCarriageRepository.findForTrainByCategory(trainId, carriageCategoryId) as TrainCarriageWithSeats[];
        const seats = await CarriageSeatRepository.findForTrain(
            trainId,
            carriageCategoryId,
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
}

