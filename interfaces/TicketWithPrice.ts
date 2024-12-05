export interface TicketWithPrice {
    ticket_id: number;
    trip_start_date: string;
    departure_time: string;
    arrival_time: string;
    departure_station_name: string;
    arrival_station_name: string;
    passenger_first_name: string;
    passenger_last_name: string;
    train_number: string;
    seat_number: string;
    carriage_number: string;
    total_travel_time_minutes: number;
    ticket_price: number;
}