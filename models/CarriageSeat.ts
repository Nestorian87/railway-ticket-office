import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Carriage} from "./Carriage";
import {Ticket} from "./Ticket";

@Entity("carriage_seat")
export class CarriageSeat {

    constructor(carriage_seat_id: number) {
        this.carriage_seat_id = carriage_seat_id;
    }

    @PrimaryGeneratedColumn()
    carriage_seat_id!: number;

    @Column({ type: 'int' })
    seat_number!: number;

    @Column({ type: 'enum', enum: ['DEFAULT', 'TOP', 'BOTTOM'] })
    seat_type!: 'DEFAULT' | 'TOP' | 'BOTTOM';

    @Column({ type: 'tinyint' })
    row_number!: number;

    @Column({ type: 'tinyint' })
    column_number!: number;

    @ManyToOne(() => Carriage, (carriage) => carriage.seats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carriage_id' })
    carriage!: Carriage;

    @OneToMany(() => Ticket, (ticket) => ticket.carriageSeat)
    tickets!: Ticket[];
}