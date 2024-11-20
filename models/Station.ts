import {Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity} from 'typeorm';
import {AdjacentStationDistance} from "./AjacentStationDistance";
import {Ticket} from "./Ticket";
import {TrainStation} from "./TrainStation";

@Entity()
export class Station {
    @PrimaryGeneratedColumn()
    station_id!: number;

    @Column({type: "varchar", length: 100, unique: true})
    station_name!: string;

    @OneToMany(() => AdjacentStationDistance, (distance) => distance.start_station)
    start_station_distances!: AdjacentStationDistance[];

    @OneToMany(() => AdjacentStationDistance, (distance) => distance.end_station)
    end_station_distances!: AdjacentStationDistance[];

    @OneToMany(() => Ticket, (ticket) => ticket.departureStation)
    departureTickets!: Ticket[];

    @OneToMany(() => Ticket, (ticket) => ticket.arrivalStation)
    arrivalTickets!: Ticket[];

    @OneToMany(() => TrainStation, (trainStation) => trainStation.station)
    trainStations!: TrainStation[];
}