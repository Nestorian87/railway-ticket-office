import {Benefit} from "../models/Benefit";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {PassengerRepository} from "../repositories/passengerRepository";
import {NotFoundError} from "../utils/errors/NotFoundError";
import {StationRepository} from "../repositories/stationRepository";
import {Station} from "../models/Station";
import {BenefitRepository} from "../repositories/benefitRepository";

export const BenefitService = {

    async getAllBenefits(): Promise<Benefit[]> {
        return BenefitRepository.find();
    }
}