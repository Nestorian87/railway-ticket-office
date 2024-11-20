import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Station} from "./Station";
import {Train} from "./Train";

@Entity("train_station")
@Unique(["train_id", "station_number"])
export class TrainStation {
    @PrimaryGeneratedColumn()
    train_station_id!: number;

    @ManyToOne(() => Station, (station) => station.trainStations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_id' })
    station!: Station;

    @ManyToOne(() => Train, (train) => train.trainStations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
    train!: Train;

    @Column({ type: 'int' })
    train_id!: number;

    @Column({ type: 'tinyint' })
    station_number!: number;

    @Column({ type: 'time', nullable: true })
    arrival_time!: string | null;

    @Column({ type: 'time', nullable: true })
    departure_time!: string | null;
}