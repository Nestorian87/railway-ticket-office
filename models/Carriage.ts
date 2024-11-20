import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CarriageCategory} from "./CarriageCategory";
import {CarriageSeat} from "./CarriageSeat";
import {TrainCarriage} from "./TrainCarriage";

@Entity("carriage")
export class Carriage {
    @PrimaryGeneratedColumn()
    carriage_id!: number;

    @Column({ type: 'tinyint' })
    row_count!: number;

    @Column({ type: 'tinyint' })
    column_count!: number;

    @ManyToOne(() => CarriageCategory, (carriageCategory) => carriageCategory.carriages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carriage_category_id' })
    carriageCategory!: CarriageCategory;

    @OneToMany(() => CarriageSeat, (seat) => seat.carriage)
    seats!: CarriageSeat[];

    @OneToMany(() => TrainCarriage, (trainCarriage) => trainCarriage.carriage)
    trainCarriages!: TrainCarriage[];
}