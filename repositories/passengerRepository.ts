import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";

export const PassengerRepository = AppDataSource.getRepository(Passenger)