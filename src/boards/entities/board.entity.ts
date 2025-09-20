import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Area } from './area.entity';
import { Task } from './task.entity';

@Entity()
export class Board {

    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column({
        type: 'text',
    })
    title: string;

    @Column({
        type: 'text',
    })
    description: string;

    @CreateDateColumn({
        type: 'timestamp'
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt: Date;

    @ManyToOne(() => Area, area => area.boards)
    area: Area;

    @OneToMany(() => Task, task => task.board)
    tasks: Task[];
}
