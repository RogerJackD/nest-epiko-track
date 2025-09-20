import { User } from "src/auth/entities/auth.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Area {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    //todo relacion a user
    @OneToMany(() => User, user => user.area)
    users: User[]
    //todo realtion to board
}