import express from "express";
import {auth} from "../middlewares/authMiddleware";
import {
    buyTickets,
    getTicketPdf,
    getTicketRoutePdf,
    getUserTickets,
    renderTicketPassengers
} from "../controllers/ticketController";

const router = express.Router();

router.get('/tickets', auth, getUserTickets);

router.post('/tickets/passengers', auth, renderTicketPassengers);

router.put('/tickets/buy', auth, buyTickets);

router.get('/tickets/:id/pdf', auth, getTicketPdf);

router.get('/tickets/:id/route/pdf', auth, getTicketRoutePdf);


export default router;
