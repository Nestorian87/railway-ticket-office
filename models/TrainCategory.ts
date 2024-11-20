import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Train } from './Train';

@Entity("train_category")
export class TrainCategory {
    @PrimaryGeneratedColumn()
    train_category_id!: number;

    @Column({ type: 'varchar', length: 100 })
    full_name!: string;

    @Column({ type: 'varchar', length: 10 })
    short_name!: string;

    @OneToMany(() => Train, (train) => train.trainCategory)
    trains!: Train[];
}