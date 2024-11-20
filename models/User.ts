import {Entity, Column, PrimaryGeneratedColumn, OneToMany, BaseEntity} from "typeorm";
import { Passenger } from "./Passenger";
import {Ticket} from "./Ticket";

@Entity()
export class User {

    constructor(id: number | undefined = undefined) {
        if (id) {
            this.user_id = id
        }
    }

    @PrimaryGeneratedColumn()
    user_id!: number;

    @Column({ type: "varchar", length: 100 })
    user_first_name!: string;

    @Column({ type: "varchar", length: 100 })
    user_last_name!: string;

    @Column({ type: "varchar", length: 50 })
    phone_number!: string;

    @Column({ type: "varchar", length: 255 })
    email!: string;

    @Column({ type: "varchar", length: 100 })
    password!: string;

    @OneToMany(() => Passenger, (passenger) => passenger.user)
    passengers!: Passenger[];

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets!: Ticket[];

    getFullName(): string {
        return `${this.user_first_name} ${this.user_last_name}`;
    }
}
