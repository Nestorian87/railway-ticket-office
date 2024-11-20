import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './Station';
import { User } from './User';
import { Passenger } from './Passenger';
import { CarriageSeat } from './CarriageSeat';
import { TrainCarriage } from './TrainCarriage';
import {Fare} from "./Fare";

@Entity("ticket")
export class Ticket {
    @PrimaryGeneratedColumn()
    ticket_id!: number;

    @Column({ type: 'datetime', default: () => "CURRENT_TIMESTAMP" })
    purchase_datetime!: Date;

    @Column({ type: 'date' })
    trip_start_date!: Date;

    @ManyToOne(() => Station, (station) => station.departureTickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'departure_station_id' })
    departureStation!: Station;

    @ManyToOne(() => Station, (station) => station.arrivalTickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'arrival_station_id' })
    arrivalStation!: Station;

    @ManyToOne(() => User, (user) => user.tickets, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    @ManyToOne(() => Passenger, (passenger) => passenger.tickets, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'passenger_id' })
    passenger!: Passenger | null;

    @ManyToOne(() => CarriageSeat, (carriageSeat) => carriageSeat.tickets)
    @JoinColumn({ name: 'carriage_seat_id' })
    carriageSeat!: CarriageSeat;

    @ManyToOne(() => TrainCarriage, (trainCarriage) => trainCarriage.tickets)
    @JoinColumn({ name: 'train_carriage_id' })
    trainCarriage!: TrainCarriage;

    @ManyToOne(() => Fare, (fare) => fare.tickets)
    @JoinColumn({ name: 'fare_id' })
    fare!: Fare;
}
