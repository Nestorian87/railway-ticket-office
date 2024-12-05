import {AppDataSource} from "../config/database";
import {Train} from "../models/Train";
import {TrainSearchResult} from "../interfaces/TrainSearchResult";
import {RouteStop} from "../interfaces/RouteStop";
import {TrainStation} from "../models/TrainStation";

export const TrainStationRepository = AppDataSource.getRepository(TrainStation).extend({

    async findRouteStops(trainIds: number[], startTrainStationId: number | null = null, endTrainStationId: number | null = null): Promise<RouteStop[]> {
        const routeStopsQuery = `
            SELECT ts.train_id,
                   ts.arrival_time,
                   ts.departure_time,
                   s.station_name,
                   TIMEDIFF(
                           IF(ts.departure_time < ts.arrival_time, ADDTIME(ts.departure_time, '24:00:00'),
                              ts.departure_time),
                           ts.arrival_time
                   ) AS stay_time
            FROM train_station ts
            JOIN station s ON ts.station_id = s.station_id
            WHERE ts.train_id IN (${trainIds.join(",")})
            ${startTrainStationId && endTrainStationId ? `AND ts.train_station_id BETWEEN ${startTrainStationId} AND ${endTrainStationId}` : ''}
            ORDER BY ts.train_id, ts.station_number;
        `

        return await this.query(routeStopsQuery) as unknown as RouteStop[]
    }
})