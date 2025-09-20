import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity, Column, ManyToOne } from 'typeorm';
import { Area } from './area.entity';

@Entity()
export class Board {

    @PrimaryGeneratedColumn('uuid')
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
        type: 'timestamp'
    })
    updatedAt: Date;

    @ManyToOne(() => Area, area => area.boards)
    area: Area
}
