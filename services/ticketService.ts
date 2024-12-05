import {TicketRepository} from "../repositories/ticketRepository";
import {Ticket} from "../models/Ticket";
import {TicketWithPrice} from "../interfaces/TicketWithPrice";

export const TicketService = {

    async getUserTickets(userId: number): Promise<TicketWithPrice[]> {
        return TicketRepository.findAllForUserWithPrice(userId);
    }
}