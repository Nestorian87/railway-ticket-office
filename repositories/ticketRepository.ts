import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {Ticket} from "../models/Ticket";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {TicketWithPrice} from "../interfaces/TicketWithPrice";
import {Train} from "../models/Train";
import {TicketSearchQuery} from "../interfaces/TicketSearchQuery";
import * as sea from "node:sea";
import {PopularRoute} from "../interfaces/PolarRoute";

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
                tr.train_category_id,
                tct.short_name AS train_category_short_name,
                tct.full_name AS train_category_full_name,
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

    async findForUserWithPrice(userId: number, searchQuery: TicketSearchQuery): Promise<TicketWithPrice[]> {

        let sortColumn = 't.trip_start_date'
        let sortMode = 'DESC'

        switch (searchQuery.sortCriteria) {
            case 'new_first':
                sortColumn = 't.trip_start_date';
                sortMode = 'DESC';
                break;
            case 'old_first':
                sortColumn = 't.trip_start_date';
                sortMode = 'ASC';
                break;
            case 'cheap_first':
                sortColumn = 'ticket_price';
                sortMode = 'ASC';
                break;
            case 'expensive_first':
                sortColumn = 'ticket_price';
                sortMode = 'DESC';
                break;
        }

        const ticketsQuery = `${this.getTicketQuery()} 
            WHERE t.user_id = ?
            AND p.passenger_last_name LIKE ?
            ${searchQuery.fromStationId ? 'AND sd.station_id = ?' : ''}
            ${searchQuery.toStationId ? 'AND sa.station_id = ?' : ''}
            ${searchQuery.ticketValidity ? `AND TIMESTAMP(t.trip_start_date, tsd.departure_time) ${searchQuery.ticketValidity == 'valid' ? '>' : '<='} NOW()` : ''}
            ${searchQuery.trainCategoryId ? `AND tr.train_category_id = ?` : ''}
            ORDER BY ${sortColumn} ${sortMode};
        `;

        return await this.query(ticketsQuery,
            [
                userId,
                `%${searchQuery.passengerLastName}%`,
                searchQuery.fromStationId ? searchQuery.fromStationId : null,
                searchQuery.toStationId ? searchQuery.toStationId : null,
                searchQuery.trainCategoryId ? searchQuery.trainCategoryId : null,
            ].filter(p => p != null)
        ) as unknown as TicketWithPrice[];
    },

    async findOneByIdWithPrice(ticketId: number, usedId: number): Promise<TicketWithPrice | null> {
        const ticketQuery = `${this.getTicketQuery()} 
            WHERE t.ticket_id = ? AND t.user_id = ?
        `;

        const results = await this.query(ticketQuery, [ticketId, usedId]) as unknown as TicketWithPrice[];
        return results.length > 0 ? results[0] : null;
    },

    async getPopularRoutes() {
        const popularRoutesQuery = `
            SELECT sd.station_name    AS departure_station_name,
                   sa.station_name    AS arrival_station_name,
                   COUNT(t.ticket_id) AS tickets_sold,
                   sd.station_id AS departure_station_id,
                   sa.station_id AS arrival_station_id
            FROM ticket t
                     JOIN
                 train_station tsd ON t.departure_station_id = tsd.train_station_id
                     JOIN
                 train_station tsa ON t.arrival_station_id = tsa.train_station_id
                     JOIN station sd ON tsd.station_id = sd.station_id
                     JOIN station sa ON tsa.station_id = sa.station_id
            GROUP BY sd.station_id, sa.station_id
            ORDER BY tickets_sold DESC
            LIMIT 6
        `;
        return await this.query(popularRoutesQuery) as unknown as PopularRoute[];
    }
});
