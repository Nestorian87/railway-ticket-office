import {StationRepository} from "../repositories/stationRepository";
import {Station} from "../models/Station";
import {AdjacentStationDistanceRepository} from "../repositories/adjacentStationDistanceRepository";
import {AdjacentStationDistance} from "../models/AjacentStationDistance";

export const StationService = {

    async getAllStations(): Promise<Station[]> {
        return StationRepository.find();
    },

    async getAllAdjacentStationDistances(): Promise<AdjacentStationDistance[]> {
       return AdjacentStationDistanceRepository.getAllWithStartAndEndStations()
    }
}