import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({   
        type: 'text',
    })
    firstName: string;

    @Column({
        type: 'text',
    })
    lastName: string;

    @Column('int',{
        nullable: true
    })
    age: number;

    @Column('text',{
        nullable: true,
        unique: true,
    })
    email: string;

    @CreateDateColumn({
        type: 'timestamp'
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp'
    })
    updatedAt: Date;

    @Column('timestamp',{
        nullable: true
    })
    contractDate: Date;

    //todo: crear idRol->Rol
    //todo: crear idArea->Area

    @Column({
        type: 'text',
    })
    password: string

    @Column('int',{
        default: 1
    })
    status : number

    @Column('varchar')
    fullName_normalized: string

    @BeforeUpdate()
    @BeforeInsert()
    normalizeName(){
        this.fullName_normalized = `${this.firstName} ${this.lastName}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "") //eliminar acentos
            .replace(/\s+/g, " ") //normalizar espacios
    }
}
