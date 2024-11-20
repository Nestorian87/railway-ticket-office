import {AppDataSource} from "../config/database";
import {TrainCarriage} from "../models/TrainCarriage";

export const TrainCarriageRepository = AppDataSource.getRepository(TrainCarriage).extend({

    async findForTrainByCategory(
       trainId: number,
       carriageCategoryId: number,
    ): Promise<TrainCarriage[]> {
        return this.find({
            where: {
                train: {
                    train_id: trainId
                },
                carriage: {
                    carriageCategory: { carriage_category_id: carriageCategoryId }
                }
            },
            order: {
                carriage_number: 'ASC'
            },
            relations: ["carriage", "carriage.carriageCategory"],
        })
    }
})