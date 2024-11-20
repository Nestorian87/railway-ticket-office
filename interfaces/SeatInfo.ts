export interface SeatInfo {
    carriage_seat_id: number;
    seat_number: number;
    row_number: number;
    column_number: number;
    carriage_number: number;
    train_carriage_id: number;
    seat_type: 'DEFAULT' | 'TOP' | 'BOTTOM';
    is_free: boolean;
}