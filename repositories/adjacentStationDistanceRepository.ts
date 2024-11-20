import {AppDataSource} from "../config/database";
import {Passenger} from "../models/Passenger";
import {User} from "../models/User";
import {Station} from "../models/Station";
import {AdjacentStationDistance} from "../models/AjacentStationDistance";

export const AdjacentStationDistanceRepository = AppDataSource.getRepository(
    AdjacentStationDistance
).extend({

    async getAllWithStartAndEndStations(): Promise<AdjacentStationDistance[]> {
        return await this.createQueryBuilder("adjacentStationDistance")
            .leftJoinAndSelect("adjacentStationDistance.start_station", "startStation")
            .leftJoinAndSelect("adjacentStationDistance.end_station", "endStation")
            .getMany();
    }
})