import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { CarriageCategory } from './CarriageCategory';
import {Ticket} from "./Ticket";

@Entity("fare")
export class Fare {

    constructor(fare_id: number) {
        this.fare_id = fare_id;
    }

    @PrimaryGeneratedColumn()
    fare_id!: number;

    @Column({ type: 'int' })
    min_distance_km!: number;

    @Column({ type: 'int' })
    max_distance_km!: number;

    @Column({ type: 'int' })
    ticket_price!: number;

    @Column({ type: 'int' })
    seat_reservation_price!: number;

    @ManyToOne(() => CarriageCategory, (carriageCategory) => carriageCategory.fares, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carriage_category_id' })
    carriageCategory!: CarriageCategory;

    @Column({ type: 'boolean', nullable: true })
    fare_is_express!: boolean | null;

    @OneToMany(() => Ticket, (ticket) => ticket.fare)
    tickets!: Ticket[];
}
