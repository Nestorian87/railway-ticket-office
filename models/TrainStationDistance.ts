import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    BaseEntity,
    OneToMany,
    ViewEntity, ViewColumn
} from 'typeorm';
import { TrainCategory } from './TrainCategory';
import {TrainCarriage} from "./TrainCarriage";
import {TrainStation} from "./TrainStation";

@ViewEntity({
    expression: `
        SELECT
            ts1.train_id,
            ts1.station_number AS start_train_station_number,
            ts2.station_number AS end_train_station_number,
            ts1.train_station_id AS start_train_station_id,
            ts2.train_station_id AS end_train_station_id,
            d.distance_km
        FROM
            train_station ts1
                JOIN
            train_station ts2 ON ts1.train_id = ts2.train_id
                JOIN
            adjacent_station_distance d ON (d.start_end_min = LEAST(ts1.station_id, ts2.station_id)
                AND d.start_end_max = GREATEST(ts1.station_id, ts2.station_id))
        WHERE
            ts1.station_number < ts2.station_number
          AND (ts2.station_number - ts1.station_number) = 1
    `
})
export class TrainStationDistance {
    @ViewColumn()
    train_id!: number;

    @ViewColumn()
    start_train_station_number!: number;

    @ViewColumn()
    end_train_station_number!: number;

    @ViewColumn()
    start_train_station_id!: number;

    @ViewColumn()
    end_train_station_id!: number;
}
