import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Carriage} from "./Carriage";
import {Fare} from "./Fare";

@Entity("carriage_category")
export class CarriageCategory {
    @PrimaryGeneratedColumn()
    carriage_category_id!: number;

    @Column({ type: 'varchar', length: 100 })
    category_name!: string;

    @OneToMany(() => Carriage, (carriage) => carriage.carriageCategory)
    carriages!: Carriage[];

    @OneToMany(() => Fare, (fare) => fare.carriageCategory)
    fares!: Fare[];
}