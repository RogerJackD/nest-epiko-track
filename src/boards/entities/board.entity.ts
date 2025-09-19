import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity, Column } from 'typeorm';

@Entity()
export class Board {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
    })
    name: string;

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

    //todo: crear estados para tableros

}
