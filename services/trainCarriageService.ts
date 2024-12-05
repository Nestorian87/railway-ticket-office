
import {TrainCarriageRepository} from "../repositories/trainCarriageRepository";
import {TrainCarriage} from "../models/TrainCarriage";

export const TrainCarriageService = {

    async getTrainCarriageWithTrainAndCarriage(trainCarriageId: number): Promise<TrainCarriage | null> {
        return await TrainCarriageRepository.findOne({
            where: {train_carriage_id: trainCarriageId},
            relations: ['train', 'carriage']
        });
    }
}