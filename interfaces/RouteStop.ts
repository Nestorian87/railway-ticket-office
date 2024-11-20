export interface RouteStop {
    train_id: number;
    arrival_time: string | null;
    departure_time: string | null;
    station_name: string;
    stay_time: string | null;
}