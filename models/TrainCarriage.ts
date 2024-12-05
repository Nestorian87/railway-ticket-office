import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Train} from "./Train";
import {Carriage} from "./Carriage";
import {Ticket} from "./Ticket";

@Entity("train_carriage")
export class TrainCarriage {

    constructor(train_carriage_id: number) {
        this.train_carriage_id = train_carriage_id;
    }

    @PrimaryGeneratedColumn()
    train_carriage_id!: number;

    @ManyToOne(() => Train, (train) => train.trainCarriages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
    train!: Train;

    @ManyToOne(() => Carriage, (carriage) => carriage.trainCarriages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carriage_id' })
    carriage!: Carriage;

    @Column({ type: 'tinyint' })
    carriage_number!: number;

    @OneToMany(() => Ticket, (ticket) => ticket.trainCarriage)
    tickets!: Ticket[];
}