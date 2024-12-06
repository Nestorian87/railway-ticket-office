export interface TicketSearchQuery {
    passengerLastName: string;
    fromStationId: number | null;
    toStationId: number | null;
    sortCriteria: 'new_first' | 'old_first' | 'cheap_first' | 'expensive_first' | null;
    ticketValidity: 'valid' | 'expired' | null;
    trainCategoryId: number | null;
}