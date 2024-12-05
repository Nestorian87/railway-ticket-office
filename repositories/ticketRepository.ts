import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {Ticket} from "../models/Ticket";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {TicketWithPrice} from "../interfaces/TicketWithPrice";
import {Train} from "../models/Train";

export const TicketRepository = AppDataSource.getRepository(Ticket).extend({
    async findAllForUserWithPrice(userId: number): Promise<TicketWithPrice[]> {
        const ticketsQuery = `
            SELECT
                t.ticket_id,
                t.trip_start_date,
                DATE_FORMAT(tsd.departure_time, '%H:%i') AS departure_time,
                DATE_FORMAT(tsa.arrival_time, '%H:%i') AS arrival_time,
                sd.station_name AS departure_station_name,
                sa.station_name AS arrival_station_name,
                p.passenger_first_name,
                p.passenger_last_name,
                tr.train_number,
                cs.seat_number,
                tc.carriage_number,
                IF(TIMEDIFF(tsa.arrival_time, tsd.departure_time) < 0,
                   TIME_TO_SEC(ADDTIME(TIMEDIFF(tsa.arrival_time, tsd.departure_time), '24:00:00')) / 60,
                   TIME_TO_SEC(TIMEDIFF(tsa.arrival_time, tsd.departure_time)) / 60) AS total_travel_time_minutes,
                ((f.ticket_price + f.seat_reservation_price) * (1 - COALESCE(b.discount_percentage, 0) / 100)) AS ticket_price
            FROM
                ticket t
            LEFT JOIN
                train_station tsd ON t.departure_station_id = tsd.train_station_id
            LEFT JOIN
                train_station tsa ON t.arrival_station_id = tsa.train_station_id
            LEFT JOIN
                station sd ON tsd.station_id = sd.station_id
            LEFT JOIN
                station sa ON tsa.station_id = sa.station_id
            JOIN
                passenger p ON t.passenger_id = p.passenger_id
            LEFT JOIN
                benefit b ON p.benefit_id = b.benefit_id
            LEFT JOIN
                carriage_seat cs ON t.carriage_seat_id = cs.carriage_seat_id
            LEFT JOIN
                train_carriage tc ON t.train_carriage_id = tc.train_carriage_id
            LEFT JOIN
                train tr ON tc.train_id = tr.train_id
            LEFT JOIN
                fare f ON t.fare_id = f.fare_id
            WHERE
                t.user_id = ?
            ORDER BY
                t.trip_start_date DESC;
        `

        return await this.query(ticketsQuery, [userId]) as unknown as TicketWithPrice[];
    }
});