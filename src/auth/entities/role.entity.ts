import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./auth.entity";

@Entity()
export class Role {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        type: 'text',
        unique: true
    })
    name: string;

    @OneToMany(() => User, user => user.role)
    users: User[]
}