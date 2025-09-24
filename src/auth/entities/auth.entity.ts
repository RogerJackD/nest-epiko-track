import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";
import { Area } from "src/boards/entities/area.entity";
import { TaskUser } from "src/boards/entities/task-user.entity";

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
        nullable: true,
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

    @Column('date',{
        nullable: true,
    })
    contractDate: Date;

    @Column({
        type: 'text',
        nullable: true,
    })
    password: string;
    
    @Column('bool',{
        default: true,
    })
    status : boolean;
    
    @Column({
        nullable: true,
    })
    job_title: string

    @Column('text',{
        nullable: true
    })
    phoneNumber: string;

    @Column('text',{
        nullable: true,
    })
    address: string;

    //todo crear idUsuario->TareaaUsuario 
    @OneToMany(() => TaskUser, taskUser => taskUser.user ) 
    tasksUsers?: TaskUser[];
    //todo: crear idRol->Rol
    @ManyToOne(() => Role, role => role.users)
    role: Role
    //todo: crear idArea->Area
    @ManyToOne(() => Area, area => area.users)
    area: Area
    
    
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
