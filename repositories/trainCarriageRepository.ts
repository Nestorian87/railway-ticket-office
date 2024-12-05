import {AppDataSource} from "../config/database";
import {TrainCarriage} from "../models/TrainCarriage";

export const TrainCarriageRepository = AppDataSource.getRepository(TrainCarriage).extend({

    async findForTrain(
       trainId: number
    ): Promise<TrainCarriage[]> {
        return this.find({
            where: {
                train: {
                    train_id: trainId
                }
            },
            order: {
                carriage_number: 'ASC'
            },
            relations: ["carriage", "carriage.carriageCategory"],
        })
    }
})