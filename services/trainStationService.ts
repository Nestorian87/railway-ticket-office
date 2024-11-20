import {TrainStationRepository} from "../repositories/trainStationRepository";

export const TrainStationService = {

    async getTrainStation(trainId: number, stationId: number) {
        return TrainStationRepository.findOne({
            where: {
                train: {train_id: trainId}, station: {station_id: stationId}
            },
            relations: ['station']
        })
    }
}