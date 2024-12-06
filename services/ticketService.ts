import {TicketRepository} from "../repositories/ticketRepository";
import {TicketWithPrice} from "../interfaces/TicketWithPrice";
import {TicketSearchQuery} from "../interfaces/TicketSearchQuery";

export const TicketService = {

    async getUserTickets(userId: number, query: TicketSearchQuery): Promise<TicketWithPrice[]> {
        return TicketRepository.findForUserWithPrice(userId, query);
    },

    async getTicket(ticketId: number, userId: number): Promise<TicketWithPrice | null> {
        return TicketRepository.findOneByIdWithPrice(ticketId, userId);
    }
}