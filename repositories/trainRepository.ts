import {AppDataSource} from "../config/database";
import {Train} from "../models/Train";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";

export const TrainRepository = AppDataSource.getRepository(Train).extend({

    async findBetweenTwoStations(fromStationId: number, toStationId: number, date: string): Promise<TrainSearchResult[]> {
        const trainsQuery = `
            SELECT t.train_id,
                   t.train_number,
                   departure_station.station_name                              AS departure_station_name,
                   DATE_FORMAT(departure_station_data.departure_time, '%H:%i') AS departure_time,
                   arrival_station.station_name                                AS arrival_station_name,
                   DATE_FORMAT(arrival_station_data.arrival_time, '%H:%i')     AS arrival_time,
                   IF(TIMEDIFF(arrival_station_data.arrival_time, departure_station_data.departure_time) < 0,
                      TIME_TO_SEC(ADDTIME(
                              TIMEDIFF(arrival_station_data.arrival_time, departure_station_data.departure_time),
                              '24:00:00')) / 60,
                      TIME_TO_SEC(TIMEDIFF(arrival_station_data.arrival_time, departure_station_data.departure_time)) /
                      60)                                                      AS total_travel_time_minutes,
                   (SELECT s1.station_name
                    FROM train_station ts1
                             JOIN station s1 ON ts1.station_id = s1.station_id
                    WHERE ts1.train_id = t.train_id
                    ORDER BY ts1.station_number
                    LIMIT 1)                                                   AS route_departure_station_name,
                   (SELECT s2.station_name
                    FROM train_station ts2
                             JOIN station s2 ON ts2.station_id = s2.station_id
                    WHERE ts2.train_id = t.train_id
                    ORDER BY ts2.station_number DESC
                    LIMIT 1)                                                   AS route_arrival_station_name
            FROM train t
                     JOIN (SELECT *
                           FROM train_station ts
                           WHERE ts.station_id = ?) AS departure_station_data
                          ON t.train_id = departure_station_data.train_id
                     JOIN station departure_station
                          ON departure_station_data.station_id = departure_station.station_id
                     JOIN (SELECT *
                           FROM train_station ts
                           WHERE ts.station_id = ?) AS arrival_station_data
                          ON t.train_id = arrival_station_data.train_id
                     JOIN station arrival_station
                          ON arrival_station_data.station_id = arrival_station.station_id
            WHERE departure_station_data.station_number < arrival_station_data.station_number
              AND (
                t.frequency = 'DAILY'
                    OR (t.frequency = 'WEEKDAYS' AND DAYOFWEEK(?) BETWEEN 2 AND 6)
                    OR (t.frequency = 'WEEKENDS' AND DAYOFWEEK(?) IN (1, 7))
                    OR (t.frequency = 'EVEN_DAYS' AND DAY(?) % 2 = 0)
                    OR (t.frequency = 'ODD_DAYS' AND DAY(?) % 2 != 0)
                )
              AND (DATE(?) != CURDATE() OR departure_station_data.departure_time > CURRENT_TIME())
            ORDER BY departure_station_data.departure_time;
        `;

        return await this.query(
            trainsQuery, [fromStationId, toStationId, date, date, date, date, date]
        ) as unknown as TrainSearchResult[];
    },

    async findWithTrainStations(trainId: number): Promise<Train | null> {
        return await this.findOne({
            where: { train_id: trainId },
            relations: ['trainStations', 'trainStations.station']
        });
    }
})