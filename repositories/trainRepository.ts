import {AppDataSource} from "../config/database";
import {Train} from "../models/Train";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";

export const TrainRepository = AppDataSource.getRepository(Train).extend({

    async findBetweenTwoStations(
        fromStationId: number,
        toStationId: number,
        date: string,
        trainCategoryId: number | null = null,
        minDepartureTime: string | null = null,
        maxDepartureTime: string | null = null,
        minArrivalTime: string | null = null,
        maxArrivalTime: string | null = null,
        carriageCategoryIds: number[] | null = null,
        sortCriteria: 'departure_time' | 'arrival_time' | 'travel_duration' | null = null,
    ): Promise<TrainSearchResult[]> {

        let sortColumn = 'departure_station_data.departure_time'

        if (sortCriteria === 'arrival_time') {
            sortColumn = 'arrival_station_data.arrival_time'
        }  else if (sortCriteria === 'travel_duration') {
            sortColumn = 'total_travel_time_minutes'
        }

        const trainsQuery = `
            SELECT t.train_id,
                   t.train_number,
                   t.train_category_id,
                   tc.full_name                                                AS train_category_name,
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
                     JOIN train_category tc ON t.train_category_id = tc.train_category_id
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
                ${trainCategoryId ? 'AND t.train_category_id = ?' : ''} 
                ${minDepartureTime ? 'AND departure_station_data.departure_time >= ?' : ''} 
                ${maxDepartureTime ? 'AND departure_station_data.departure_time <= ?' : ''}
                ${minArrivalTime ? 'AND arrival_station_data.arrival_time >= ?' : ''} 
                ${maxArrivalTime ? 'AND arrival_station_data.arrival_time <= ?' : ''}
                ${carriageCategoryIds ? `
                    AND EXISTS (
                        SELECT 1
                        FROM carriage_category cc
                                 JOIN carriage c ON cc.carriage_category_id = c.carriage_category_id
                                 JOIN train_carriage tcg ON c.carriage_id = tcg.carriage_id
                        WHERE tcg.train_id = t.train_id
                          AND cc.carriage_category_id IN (${carriageCategoryIds.map(() => '?').join(',')})
                    )
              ` : ''}
            ORDER BY ${sortColumn};
        `;

        return await this.query(
            trainsQuery,
            [
                fromStationId,
                toStationId,
                date,
                date,
                date,
                date,
                date,
                trainCategoryId,
                minDepartureTime,
                maxDepartureTime,
                minArrivalTime,
                maxArrivalTime,
                ...(carriageCategoryIds ?? [])
            ].filter(p => p !== null)
        ) as unknown as TrainSearchResult[];
    },

    async findWithTrainStations(trainId: number): Promise<Train | null> {
        return await this.findOne({
            where: {train_id: trainId},
            relations: ['trainStations', 'trainStations.station']
        });
    }
})