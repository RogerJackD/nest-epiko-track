import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";

export class TaskStatus {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text')
    title: string;

    @Column('text')
    description: string;

    @Column('number')
    sort_order: number;

    @OneToMany(() => Task, task => task.taskStatus)
    task: Task[];
}