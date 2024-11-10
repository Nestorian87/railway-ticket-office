import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, BaseEntity, JoinColumn} from "typeorm";
import { User } from "./User";
import { Benefit } from "./Benefit";

@Entity()
export class Passenger extends BaseEntity {
    @PrimaryGeneratedColumn()
    passenger_id!: number;

    @Column({ type: "varchar", length: 100 })
    passenger_first_name!: string;

    @Column({ type: "varchar", length: 100 })
    passenger_last_name!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    benefit_document!: string;

    @ManyToOne(() => Benefit, (benefit) => benefit.passengers, { nullable: true })
    @JoinColumn({ name: "benefit_id" })
    benefit!: Benefit | null;

    @ManyToOne(() => User, (user) => user.passengers, { nullable: true })
    @JoinColumn({ name: "user_id" })
    user!: User | null;

    getFullName(): string {
        return `${this.passenger_first_name} ${this.passenger_last_name}`;
    }
}