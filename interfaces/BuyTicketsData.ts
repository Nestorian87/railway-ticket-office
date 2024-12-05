import {TicketData} from "./TicketData";

export interface BuyTicketsData {
    fromStationId: number;
    toStationId: number;
    date: string;
    tickets: TicketData[]
}