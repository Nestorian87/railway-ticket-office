import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {Benefit} from "../models/Benefit";

export const BenefitRepository = AppDataSource.getRepository(Benefit)