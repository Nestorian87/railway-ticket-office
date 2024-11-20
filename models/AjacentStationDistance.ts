import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, JoinColumn} from 'typeorm';
import {Station} from './Station';

@Entity("adjacent_station_distance")
export class AdjacentStationDistance {
    @PrimaryGeneratedColumn()
    distance_id!: number;

    @Column({type: 'int'})
    distance_km!: number;

    @ManyToOne(() => Station, (station) => station.start_station_distances, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'start_station_id' })
    start_station!: Station;

    @ManyToOne(() => Station, (station) => station.end_station_distances, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'end_station_id' })
    end_station!: Station;
}
