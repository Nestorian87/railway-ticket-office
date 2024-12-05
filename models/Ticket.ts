import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './Station';
import { User } from './User';
import { Passenger } from './Passenger';
import { CarriageSeat } from './CarriageSeat';
import { TrainCarriage } from './TrainCarriage';
import {Fare} from "./Fare";
import {TrainStation} from "./TrainStation";

@Entity("ticket")
export class Ticket {

    constructor(
        trip_start_date: Date,
        departureStation: TrainStation,
        arrivalStation: TrainStation,
        user: User,
        passenger: Passenger,
        carriageSeat: CarriageSeat,
        trainCarriage: TrainCarriage,
        fare: Fare
    ) {
        this.trip_start_date = trip_start_date;
        this.departureStation = departureStation;
        this.arrivalStation = arrivalStation;
        this.user = user;
        this.passenger = passenger;
        this.carriageSeat = carriageSeat;
        this.trainCarriage = trainCarriage;
        this.fare = fare;
    }

    @PrimaryGeneratedColumn()
    ticket_id!: number;

    @Column({ type: 'datetime', default: () => "CURRENT_TIMESTAMP" })
    purchase_datetime!: Date;

    @Column({ type: 'date' })
    trip_start_date!: Date;

    @ManyToOne(() => TrainStation, (station) => station.departureTickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'departure_station_id' })
    departureStation!: TrainStation;

    @ManyToOne(() => TrainStation, (station) => station.arrivalTickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'arrival_station_id' })
    arrivalStation!: TrainStation;

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
