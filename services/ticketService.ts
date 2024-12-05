import {TicketRepository} from "../repositories/ticketRepository";
import {TicketWithPrice} from "../interfaces/TicketWithPrice";

export const TicketService = {

    async getUserTickets(userId: number): Promise<TicketWithPrice[]> {
        return TicketRepository.findAllForUserWithPrice(userId);
    },

    async getTicket(ticketId: number, userId: number): Promise<TicketWithPrice | null> {
        return TicketRepository.findOneByIdWithPrice(ticketId, userId);
    }
}