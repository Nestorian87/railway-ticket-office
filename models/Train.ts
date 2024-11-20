import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity, OneToMany} from 'typeorm';
import { TrainCategory } from './TrainCategory';
import {TrainCarriage} from "./TrainCarriage";
import {TrainStation} from "./TrainStation";

@Entity("train")
export class Train {
    @PrimaryGeneratedColumn()
    train_id!: number;

    @Column({ type: 'varchar', length: 10 })
    train_number!: string;

    @Column({ type: 'enum', enum: ['DAILY', 'WEEKDAYS', 'WEEKENDS', 'EVEN_DAYS', 'ODD_DAYS'] })
    frequency!: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'EVEN_DAYS' | 'ODD_DAYS';

    @ManyToOne(() => TrainCategory, (trainCategory) => trainCategory.trains, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_category_id' })
    trainCategory!: TrainCategory;

    @OneToMany(() => TrainCarriage, (trainCarriage) => trainCarriage.train)
    trainCarriages!: TrainCarriage[];

    @OneToMany(() => TrainStation, (trainStation) => trainStation.train)
    trainStations!: TrainStation[];
}
