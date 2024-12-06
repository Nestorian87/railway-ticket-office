export interface TicketWithPrice {
    ticket_id: number;
    trip_start_date: string;
    departure_time: string;
    arrival_time: string;
    departure_station_name: string;
    departure_train_station_id: number;
    arrival_station_name: string;
    arrival_train_station_id: number;
    passenger_first_name: string;
    passenger_last_name: string;
    train_number: string;
    train_id: number;
    train_category_id: number;
    seat_number: string;
    carriage_number: string;
    total_travel_time_minutes: number;
    ticket_price: number;
    purchase_datetime: string;
    benefit_name: string | null;
    benefit_document_name: string | null;
    benefit_document: string | null;
    discount_percentage: number | null;
    ticket_component_price: number;
    seat_reservation_price: number;
    train_category_short_name: string;
    train_category_full_name: string;
    carriage_category_name: string;
}