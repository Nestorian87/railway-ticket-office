import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {Ticket} from "../models/Ticket";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {TicketWithPrice} from "../interfaces/TicketWithPrice";
import {Train} from "../models/Train";

export const TicketRepository = AppDataSource.getRepository(Ticket).extend({
    getTicketQuery(): string {
        return `
            SELECT
                t.ticket_id,
                t.trip_start_date,
                t.purchase_datetime,
                DATE_FORMAT(tsd.departure_time, '%H:%i') AS departure_time,
                DATE_FORMAT(tsa.arrival_time, '%H:%i') AS arrival_time,
                t.departure_station_id AS departure_train_station_id,
                t.arrival_station_id AS arrival_train_station_id,
                sd.station_name AS departure_station_name,
                sa.station_name AS arrival_station_name,
                p.passenger_first_name,
                p.passenger_last_name,
                p.benefit_document,
                b.benefit_name,
                b.document_name AS benefit_document_name,
                b.discount_percentage,
                tr.train_id,
                tr.train_number,
                tct.short_name AS train_category_name,
                cs.seat_number,
                tc.carriage_number,
                cc.category_name AS carriage_category_name,
                f.ticket_price * (1 - COALESCE(b.discount_percentage, 0) / 100) AS ticket_component_price,
                f.seat_reservation_price * (1 - COALESCE(b.discount_percentage, 0) / 100) AS seat_reservation_price,
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
                train_category tct ON tr.train_category_id = tct.train_category_id
            LEFT JOIN
                carriage c ON cs.carriage_id = c.carriage_id
            LEFT JOIN
                carriage_category cc ON c.carriage_category_id = cc.carriage_category_id
            LEFT JOIN
                fare f ON t.fare_id = f.fare_id
        `;
    },

    async findAllForUserWithPrice(userId: number): Promise<TicketWithPrice[]> {
        const ticketsQuery = `${this.getTicketQuery()} 
            WHERE t.user_id = ?
            ORDER BY t.trip_start_date DESC;
        `;

        return await this.query(ticketsQuery, [userId]) as unknown as TicketWithPrice[];
    },

    async findOneByIdWithPrice(ticketId: number, usedId: number): Promise<TicketWithPrice | null> {
        const ticketQuery = `${this.getTicketQuery()} 
            WHERE t.ticket_id = ? AND t.user_id = ?
        `;

        const results = await this.query(ticketQuery, [ticketId, usedId]) as unknown as TicketWithPrice[];
        return results.length > 0 ? results[0] : null;
    }
});
