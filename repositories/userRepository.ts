import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {ProfileStatistics} from "../interfaces/ProfileStatistics";

export const UserRepository = AppDataSource.getRepository(User).extend({

    async getProfileStatistics(userId: number): Promise<ProfileStatistics> {
        const statisticsQuery = `
            SELECT COUNT(t.ticket_id)                                                                         AS rides_count,
                   ROUND(SUM(IF(TIMEDIFF(tsa.arrival_time, tsd.departure_time) < 0,
                                TIME_TO_SEC(ADDTIME(TIMEDIFF(tsa.arrival_time, tsd.departure_time), '24:00:00')) / 3600,
                                TIME_TO_SEC(TIMEDIFF(tsa.arrival_time, tsd.departure_time)) /
                                3600)))                                                                       AS total_ride_time_hours,
                   SUM((SELECT SUM(d.distance_km)
                        FROM train_station_distance d
                        WHERE d.train_id = (SELECT train_id FROM train_station WHERE train_station_id = tsd.train_station_id)
                          AND d.start_train_station_number >=
                              (SELECT station_number FROM train_station WHERE train_station_id = tsd.train_station_id)
                          AND d.end_train_station_number <= (SELECT station_number
                                                             FROM train_station
                                                             WHERE train_station_id = tsa.train_station_id))) AS total_ride_distance_km
            FROM ticket t
                     JOIN passenger p ON t.passenger_id = p.passenger_id
                     JOIN
                 train_station tsd ON t.departure_station_id = tsd.train_station_id
                     JOIN
                 train_station tsa ON t.arrival_station_id = tsa.train_station_id
                     JOIN fare f ON t.fare_id = f.fare_id
            WHERE TIMESTAMP(t.trip_start_date, tsd.departure_time) <= NOW()
              AND p.user_id = ?
        `;

        return (await this.query(
            statisticsQuery, [userId]
        ))[0] as unknown as ProfileStatistics;
    }

})