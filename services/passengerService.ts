import {Benefit} from "../models/Benefit";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {PassengerRepository} from "../repositories/passengerRepository";
import {NotFoundError} from "../utils/errors/NotFoundError";

export const PassengerService = {

    async addPassenger(
        userId: number,
        firstName: string,
        lastName: string,
        benefitId?: number,
        benefitDocument?: string,
    ): Promise<Passenger> {
        const passenger = new Passenger();
        passenger.passenger_first_name = firstName;
        passenger.passenger_last_name = lastName;
        passenger.benefit = benefitId ? new Benefit(benefitId) : null;
        passenger.benefit_document = benefitDocument || null;
        passenger.user = new User(userId)

        const addedPassenger = await PassengerRepository.save(passenger);
        return (await PassengerRepository.findOne(
            { where: { passenger_id: addedPassenger.passenger_id }, relations: ['benefit'] }
        ))! ;
    },

    async editPassenger(
        userId: number,
        passengerId: number,
        firstName: string,
        lastName: string,
        benefitId?: number,
        benefitDocument?: string,
    ): Promise<Passenger> {
        const passenger = await PassengerRepository.findOneBy({passenger_id: passengerId, user: {user_id: userId}});
        if (!passenger) {
            throw new NotFoundError("Passenger not found");
        }

        passenger.passenger_first_name = firstName;
        passenger.passenger_last_name = lastName;
        passenger.benefit = benefitId ? new Benefit(benefitId) : null;
        passenger.benefit_document = benefitDocument || null;

        return await PassengerRepository.save(passenger);
    },

    async deletePassenger(
        userId: number,
        passengerId: number
    ): Promise<void> {
        const result = await PassengerRepository.delete({
            passenger_id: passengerId,
            user: {user_id: userId}
        });

        if (result.affected == 0) {
            throw new NotFoundError("Passenger not found");
        }
    },

    async getUserPassengers(userId: number): Promise<Passenger[]> {
        return await PassengerRepository.find(
            {
                where: {
                    user: {
                        user_id: userId
                    }
                },
                relations: ['benefit']
            }
        )
    }
}