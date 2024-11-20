import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {Station} from "../models/Station";

export const StationRepository = AppDataSource.getRepository(Station)