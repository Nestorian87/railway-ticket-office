import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";

export const UserRepository = AppDataSource.getRepository(User).extend({

    async findOneByIdWithPassengers(userId: number): Promise<User | null> {
        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.passengers", "passenger")
            .leftJoinAndSelect("passenger.benefit", "benefit")
            .where("user.user_id = :userId", { userId })
            .getOne();
    }

})