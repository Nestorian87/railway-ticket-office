export interface SearchQuery {
    fromStationId: number;
    toStationId: number;
    date: string;
    trainCategoryId: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    departureTimeStart: string | null;
    departureTimeEnd: string | null;
    arrivalTimeStart: string | null;
    arrivalTimeEnd: string | null;
    carriageCategoryIds: string | null;
    sortCriteria: 'departure_time' | 'arrival_time' | 'ticket_price' | 'travel_duration' | null;
}