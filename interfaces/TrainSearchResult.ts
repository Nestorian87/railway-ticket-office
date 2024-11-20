import {CarriageCategorySearchResult} from "./CarriageCategorySearchResult";
import {RouteStop} from "./RouteStop";

export interface TrainSearchResult {
    train_id: number;
    train_number: string;
    departure_station_name: string;
    departure_time: string;
    arrival_time: string;
    arrival_station_name: string;
    route_departure_station_name: string;
    route_arrival_station_name: string;
    total_travel_time_minutes: number;
    departure_date: string;
    arrival_date: string;
    carriage_categories: CarriageCategorySearchResult[];
    route_stations: RouteStop[]
}