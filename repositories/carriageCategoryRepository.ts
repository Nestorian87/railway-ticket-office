import {AppDataSource} from "../config/database";
import {Train} from "../models/Train";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {CarriageCategorySearchResult} from "../interfaces/CarriageCategorySearchResult";

export const CarriageCategoryRepository = AppDataSource.getRepository(Train).extend({

    async findForTrainsBetweenTwoStations(
        trainIds: number[],
        fromStationId: number,
        toStationId: number,
        date: string
    ): Promise<CarriageCategorySearchResult[]> {

        const carriageCategoriesQuery = `
            SELECT DISTINCT 
                   t.train_id,
                   cc.carriage_category_id,
                   cc.category_name,
                   (f.ticket_price + f.seat_reservation_price) AS total_ticket_price,
                   ((SELECT COUNT(1)
                     FROM carriage_seat cs
                              JOIN carriage c ON cs.carriage_id = c.carriage_id
                              JOIN train_carriage tc ON c.carriage_id = tc.carriage_id
                     WHERE tc.train_id = t.train_id AND c.carriage_category_id = cc.carriage_category_id) - (SELECT COUNT(1)
                       FROM ticket tk
                        JOIN train_carriage tc ON tk.train_carriage_id = tc.train_carriage_id
                        JOIN carriage c ON tc.carriage_id = c.carriage_id
                       JOIN train_station dep_s ON tk.departure_station_id = dep_s.station_id AND dep_s.train_id = t.train_id
                       JOIN train_station arr_s ON tk.arrival_station_id = arr_s.station_id AND arr_s.train_id = t.train_id
                       WHERE c.carriage_category_id = cc.carriage_category_id AND
                             tk.trip_start_date = ?
                       AND arr_s.station_number >
                       (SELECT ts.station_number FROM train_station ts WHERE ts.train_id = t.train_id AND ts.station_id = ?)
                       AND dep_s.station_number <
                           (SELECT ts.station_number FROM train_station ts WHERE ts.train_id = t.train_id AND ts.station_id = ?))
                    ) AS free_seats_count
            FROM train t
                     JOIN train_carriage tc
                          ON t.train_id = tc.train_id
                     JOIN carriage c ON tc.carriage_id = c.carriage_id
                     JOIN carriage_category cc ON c.carriage_category_id = cc.carriage_category_id
                     JOIN train_category tct ON t.train_category_id = tct.train_category_id
                     JOIN fare f
                          ON cc.carriage_category_id = f.carriage_category_id AND tct.train_category_is_express = f.fare_is_express
                     JOIN (SELECT t.train_id, SUM(d.distance_km) AS total_distance
                           FROM train_station ts
                                    JOIN station s ON ts.station_id = s.station_id
                                    JOIN train t ON ts.train_id = t.train_id
                                    JOIN (SELECT train_id,
                                                 MIN(station_number) AS start_station,
                                                 MAX(station_number) AS end_station
                                          FROM train_station
                                          WHERE station_id IN (?, ?)
                                          GROUP BY train_id) AS station_range ON ts.train_id = station_range.train_id
                               AND ts.station_number BETWEEN station_range.start_station AND station_range.end_station
                                    JOIN train_station ts1
                                         ON ts.train_id = ts1.train_id AND ts.station_number = ts1.station_number - 1
                                    JOIN adjacent_station_distance d ON (d.start_end_min = LEAST(ts.station_id, ts1.station_id)
                               AND d.start_end_max = GREATEST(ts.station_id, ts1.station_id))
                                    JOIN station s1 ON s1.station_id = d.start_end_min
                                    JOIN station s2 ON s2.station_id = d.start_end_max
                           WHERE ts.station_number < station_range.end_station
                           GROUP BY t.train_id) distance ON distance.train_id = tc.train_id
            WHERE t.train_id IN (${trainIds.join(",")})
              AND distance.total_distance BETWEEN f.min_distance_km AND f.max_distance_km
        `;

        return await this.query(carriageCategoriesQuery,
            [date, fromStationId, toStationId, fromStationId, toStationId]
        ) as unknown as CarriageCategorySearchResult[];
    }
})