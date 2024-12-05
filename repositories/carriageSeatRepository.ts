import {AppDataSource} from "../config/database";
import {Train} from "../models/Train";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {RouteStop} from "../interfaces/RouteStop";
import {CarriageSeat} from "../models/CarriageSeat";
import {Ticket} from "../models/Ticket";
import {TrainStation} from "../models/TrainStation";
import {SeatInfo} from "../interfaces/SeatInfo";

export const CarriageSeatRepository = AppDataSource.getRepository(CarriageSeat).extend({

    async findForTrain(
        trainId: number,
        date: string,
        fromStationId: number,
        toStationId: number
    ): Promise<SeatInfo[]> {
        return await this.createQueryBuilder('cs')
            .leftJoinAndSelect('cs.carriage', 'c')
            .leftJoinAndSelect('c.trainCarriages', 'tc')
            .leftJoin(
                (subQuery) => {
                    return subQuery
                        .select('tk.carriage_seat_id, tc.carriage_number')
                        .from(Ticket, 'tk')
                        .innerJoin('tk.trainCarriage', 'tc', 'tk.train_carriage_id = tc.train_carriage_id')
                        .innerJoin('tc.carriage', 'c', 'tc.carriage_id = c.carriage_id')
                        .innerJoin('tk.departureStation', 'dep_s', 'tk.departure_station_id = dep_s.train_station_id')
                        .innerJoin('tk.arrivalStation', 'arr_s', 'tk.arrival_station_id = arr_s.train_station_id')
                        .where('tc.train_id = :trainId')
                        .andWhere('tk.trip_start_date = :date', { date })
                        .andWhere('arr_s.station_number > (SELECT ts.station_number FROM train_station ts WHERE ts.train_id = :trainId AND ts.station_id = :fromStationId)', { fromStationId })
                        .andWhere('dep_s.station_number < (SELECT ts.station_number FROM train_station ts WHERE ts.train_id = :trainId AND ts.station_id = :toStationId)', { toStationId });
                },
                'occupied_seat',
                'cs.carriage_seat_id = occupied_seat.carriage_seat_id AND tc.carriage_number = occupied_seat.carriage_number',
            )
            .where('tc.train_id = :trainId', { trainId })
            .select([
                'cs.carriage_seat_id AS carriage_seat_id',
                'cs.seat_number AS seat_number',
                'cs.row_number AS `row_number`',
                'cs.column_number AS column_number',
                'tc.carriage_number AS carriage_number',
                'tc.train_carriage_id AS train_carriage_id',
                'cs.seat_type AS seat_type',
                'occupied_seat.carriage_seat_id IS NULL AS is_free',
            ])
            .getRawMany() as SeatInfo[];
    }
})