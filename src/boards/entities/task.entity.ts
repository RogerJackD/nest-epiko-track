import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TaskUser } from './task-user.entity';
import { Board } from './board.entity';
import { TaskStatus } from './task-status.entity';

export enum TypePriority {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
}


@Entity()
export class Task {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        type: 'text',
    })
    title: string;

    @Column({
        type: 'text',
    })
    description: string;

    //cuando el usuario desea dejar como referencia cuando la tarea puede empezarse a hacerse
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    startDate: Date;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    //cuando el usuario marca como tarea cuando lo aprueba como completa
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    completedAt: Date;

    //cuando el usuario desea la fecha a vencer de la tarea 
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    dueDate: Date;

    @UpdateDateColumn({
        type: 'timestamp'
    })
    updatedAt: Date;

    @Column({
        default : TypePriority.BAJA
    })
    priority: TypePriority;

    //todo relacion entre task-> TaskUser
    @OneToMany(() => TaskUser, taskUser => taskUser.task)
    tasksUsers: TaskUser[]

    //todo realacion entre task-> Board
    @ManyToOne(() => Board, board => board.tasks)
    board: Board;

    //
    @ManyToOne(() => TaskStatus, taskStatus => taskStatus.task)
    taskStatus: TaskStatus;

    @Column({ type: 'int', name: 'taskStatusId', default: 1 })
    taskStatusId: number;
}