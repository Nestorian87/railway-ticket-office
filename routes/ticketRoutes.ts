import express from "express";
import {auth} from "../middlewares/authMiddleware";
import {buyTickets, getUserTickets, renderTicketPassengers} from "../controllers/ticketController";

const router = express.Router();

router.get('/tickets', auth, getUserTickets);

router.post('/tickets/passengers', auth, renderTicketPassengers);

router.put('/tickets/buy', auth, buyTickets);


export default router;
