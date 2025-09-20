import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";

@Entity()
export class TaskStatus {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text')
    title: string;

    @Column('text')
    description: string;

    @Column('int')
    sort_order: number;

    @OneToMany(() => Task, task => task.taskStatus)
    task: Task[];
}