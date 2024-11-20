import {Entity, Column, PrimaryGeneratedColumn, OneToMany, BaseEntity} from "typeorm";
import { Passenger } from "./Passenger";

@Entity()
export class Benefit {

    constructor(id: number) {
        this.benefit_id = id
    }

    @PrimaryGeneratedColumn()
    benefit_id!: number;

    @Column({ type: 'varchar', length: 100 })
    benefit_name!: string

    @Column({ type: "tinyint" })
    discount_percentage!: number;

    @Column({ type: "varchar", length: 50 })
    document_name!: string;

    @OneToMany(() => Passenger, (passenger) => passenger.benefit, { onDelete: "SET NULL" })
    passengers!: Passenger[];
}

