import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, BaseEntity, JoinColumn, OneToMany} from "typeorm";
import {User} from "./User";
import {Benefit} from "./Benefit";
import {Ticket} from "./Ticket";

@Entity()
export class Passenger {


    constructor(passenger_id: number | null = null) {
        if (passenger_id) {
            this.passenger_id = passenger_id;
        }
    }

    @PrimaryGeneratedColumn()
    passenger_id!: number;

    @Column({type: "varchar", length: 100})
    passenger_first_name!: string;

    @Column({type: "varchar", length: 100})
    passenger_last_name!: string;

    @Column({type: "varchar", length: 50, nullable: true})
    benefit_document!: string | null;

    @ManyToOne(() => Benefit, (benefit) => benefit.passengers, {nullable: true})
    @JoinColumn({name: "benefit_id"})
    benefit!: Benefit | null;

    @ManyToOne(() => User, (user) => user.passengers, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({name: "user_id"})
    user!: User | null;

    @OneToMany(() => Ticket, (ticket) => ticket.passenger)
    tickets!: Ticket[];

    getFullName(): string {
        return `${this.passenger_first_name} ${this.passenger_last_name}`;
    }
}