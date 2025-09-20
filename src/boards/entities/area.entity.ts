import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Area {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    nombre: string;

    //todo realtion to board
}